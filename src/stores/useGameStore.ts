// ============================================
// 魔女卡牌 — 全局游戏状态 (Zustand)
// ============================================
import { create } from 'zustand';
import type { Card, BattleState, BattleCard, Skill } from '../types';
import { calcCardStat, collectSkills } from '../engine/FactorEngine';
import { hexagramFusion, forbiddenFusion, generateName } from '../engine/FusionEngine';
import { createBattleCard, createBattleMonster, executeSkill, executeBasicAttack, monsterAI } from '../engine/CombatEngine';
import { createNewSave, saveGame, loadGame } from '../engine/SaveManager';
import { ALL_FACTORS } from '../config/factors';
import { MONSTER_MAP } from '../config/monsters';
import { SHOP_ITEMS, DUNGEONS } from '../config/shops';

// ---- Helper: generate unique card ID ----
let cardIdCounter = Date.now();
function newCardId() { return `card_${++cardIdCounter}`; }

// ---- Helper: hydrate card with computed stats ----
function hydrateCard(card: Card): Card {
  card.stats = calcCardStat(card.factors);
  card.skills = collectSkills(card.factors);
  return card;
}

/** 找到下一个活着的角色索引（自动跳过死卡） */
function nextAliveIndex(team: BattleCard[], current: number): number {
  const n = team.length;
  for (let i = 1; i <= n; i++) {
    const idx = (current + i) % n;
    if (team[idx].currentHp > 0) return idx;
  }
  return -1; // 全灭
}

// ---- Store ----
interface GameState {
  // 数据
  gold: number;
  diamonds: number;
  bag: Card[];
  warehouse: Card[];
  hospitalQueue: { cardId: string; healEndTime: number }[];
  unlockedAreas: string[];
  tutorialDone: boolean;
  
  // 铭刻卡库存 (独立计数，不计入100格背包)
  engraveCopper: number;
  engraveSilver: number;
  engraveGold: number;
  
  // UI
  currentPage: 'home' | 'cauldron' | 'battle' | 'dungeon' | 'shop' | 'hospital' | 'warehouse';
  battle: BattleState | null;
  fusionAnimating: boolean;
  logMessages: string[];
  
  // 引擎操作
  addLog: (msg: string) => void;
  setPage: (page: GameState['currentPage']) => void;
  
  // 卡片
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  getCard: (cardId: string) => Card | undefined;
  
  // 商店
  buyItem: (itemId: string, factorId?: string) => boolean;
  
  // 融合
  doHexagramFusion: (factorIds: string[]) => { card: Card; conflicts: string[]; resonances: string[]; title?: string; stackingLog?: string; stackingBonus?: {hp:number;atk:number;mp:number} } | null;
  doForbiddenFusion: (cardIdA: string, cardIdB: string) => { card: Card; conflicts: string[]; resonances: string[]; title?: string; stackingLog?: string; stackingBonus?: {hp:number;atk:number;mp:number} } | null;
  generateCardName: (card: Card) => string;
  
  // 铭刻
  engraveMonster: (monsterId: string, cardLevel: 'copper'|'silver'|'gold') => string | null;
  
  // 战斗
  startBattle: (dungeonId: string) => void;
  playerAction: (skillIndex: number, targetIndex: number) => void;
  endBattle: () => void;
  
  // 治疗
  healCard: (cardId: string) => void;
  
  // 存档
  save: () => Promise<void>;
  load: () => Promise<boolean>;
  newGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初始值
  gold: 300,
  diamonds: 5,
  bag: [],
  warehouse: [],
  hospitalQueue: [],
  unlockedAreas: ['forest_trial'],
  tutorialDone: false,
  currentPage: 'home',
  battle: null,
  fusionAnimating: false,
  logMessages: [],
  engraveCopper: 1,  // 初始送1张铜铭刻卡
  engraveSilver: 0,
  engraveGold: 0,

  addLog: (msg) => set(s => ({ logMessages: [...s.logMessages.slice(-49), msg] })),
  setPage: (page) => set({ currentPage: page }),

  addCard: (card) => {
    card = hydrateCard(card);
    const bag = get().bag;
    if (bag.length >= 100) {
      // 背包满→放仓库
      set(s => ({ warehouse: [...s.warehouse, card] }));
      get().addLog('背包已满，卡片已放入仓库');
    } else {
      set(s => ({ bag: [...s.bag, card] }));
    }
  },

  removeCard: (cardId) => set(s => ({
    bag: s.bag.filter(c => c.id !== cardId),
    warehouse: s.warehouse.filter(c => c.id !== cardId),
  })),

  getCard: (cardId) => {
    const s = get();
    return s.bag.find(c => c.id === cardId) || s.warehouse.find(c => c.id === cardId);
  },

  buyItem: (itemId, factorId) => {
    const s = get();
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    const price = item.price;
    const currency = item.currency === 'gold' ? s.gold : s.diamonds;
    if (currency < price) { get().addLog('💰 钱不够！'); return false; }

    if (item.currency === 'gold') set({ gold: s.gold - price });
    else set({ diamonds: s.diamonds - price });

    if (item.type === 'factor_card' && (factorId || item.factorId)) {
      const fid = factorId || item.factorId;
      const factor = ALL_FACTORS[fid!];
      if (factor) {
        const card: Card = {
          id: newCardId(), name: `${factor.id}卡`, factors: [factor],
          imageUrl: null, stars: 1, status: 'normal',
        };
        get().addCard(card);
        get().addLog(`✅ 获得了 [${fid}] 因子卡`);
      }
    }
    // 铭刻卡 → 计入库存
    if (item.type === 'engrave_card') {
      if (item.engraveType === 'copper') set(s => ({ engraveCopper: s.engraveCopper + 1 }));
      else if (item.engraveType === 'silver') set(s => ({ engraveSilver: s.engraveSilver + 1 }));
      else if (item.engraveType === 'gold') set(s => ({ engraveGold: s.engraveGold + 1 }));
      get().addLog(`✅ 获得了${item.name}`);
    }
    return true;
  },

  doHexagramFusion: (factorIds) => {
    const s = get();
    if (factorIds.length === 0 || factorIds.length > 6) return null;
    
    const cards = factorIds.map(id => s.bag.find(c => c.id === id)).filter(Boolean) as Card[];
    if (cards.length !== factorIds.length) return null;
    
    const factors = cards.flatMap(c => c.factors);
    if (factors.length !== cards.length) return null; // 确保每张卡恰好1个因子
    
    const result = hexagramFusion(factors);
    
    // 消耗卡片
    const consumedIds = new Set(cards.map(c => c.id));
    set(s => ({ bag: s.bag.filter(c => !consumedIds.has(c.id)) }));
    
    // 创建新卡
    const newCard: Card = {
      id: newCardId(),
      name: generateName(result.factors),
      factors: result.factors,
      imageUrl: null,
      stars: 1,
      status: 'normal',
    };
    // 6合1堆叠奖励属性
    if (result.stackingBonus) {
      const h = hydrateCard(newCard);
      if (h.stats) {
        h.stats.hp += result.stackingBonus.hp;
        h.stats.maxHp += result.stackingBonus.hp;
        h.stats.atk += result.stackingBonus.atk;
        h.stats.mp += result.stackingBonus.mp;
        h.stats.maxMp += result.stackingBonus.mp;
      }
      get().addLog(`🎁 融合奖励: +${result.stackingBonus.hp}HP +${result.stackingBonus.atk}ATK +${result.stackingBonus.mp}MP`);
    }
    get().addCard(newCard);
    get().addLog(`🧪 六芒星炼成: ${newCard.name} (${newCard.factors.length}因子)`);
    if (result.appliedConflicts.length > 0) {
      get().addLog(`⚡ 冲突融合: ${result.appliedConflicts.join(', ')}`);
    }
    if (result.stackingLog) {
      get().addLog(result.stackingLog);
    }
    if (result.title) {
      get().addLog(`🌟 获得称号: ${result.title}`);
    }
    
    return { card: hydrateCard(newCard), conflicts: result.appliedConflicts, resonances: result.appliedResonances, title: result.title, stackingLog: result.stackingLog, stackingBonus: result.stackingBonus };
  },

  doForbiddenFusion: (cardIdA, cardIdB) => {
    const s = get();
    const cardA = s.getCard(cardIdA);
    const cardB = s.getCard(cardIdB);
    if (!cardA || !cardB) return null;
    
    const result = forbiddenFusion(cardA.factors, cardB.factors);
    
    // 消耗卡片
    set(s => ({
      bag: s.bag.filter(c => c.id !== cardIdA && c.id !== cardIdB),
      warehouse: s.warehouse.filter(c => c.id !== cardIdA && c.id !== cardIdB),
    }));
    
    const newCard: Card = {
      id: newCardId(),
      name: generateName(result.factors),
      factors: result.factors,
      imageUrl: null,
      stars: 1,
      status: 'normal',
    };
    get().addCard(newCard);
    if (result.stackingLog) {
      get().addLog(result.stackingLog);
    }
    get().addLog(`💀 禁断融合: ${newCard.name} (${newCard.factors.length}因子)`);
    
    return { card: hydrateCard(newCard), conflicts: result.appliedConflicts, resonances: result.appliedResonances, title: result.title, stackingLog: result.stackingLog, stackingBonus: result.stackingBonus };
  },

  generateCardName: (card) => generateName(card.factors),

  engraveMonster: (monsterId, cardLevel) => {
    const s = get();
    const monster = MONSTER_MAP[monsterId];
    if (!monster) return null;
    
    // 检查铭刻卡库存
    const cardKey = cardLevel === 'copper' ? 'engraveCopper' : cardLevel === 'silver' ? 'engraveSilver' : 'engraveGold';
    if (s[cardKey] <= 0) {
      const names = { copper: '铜', silver: '银', gold: '金' };
      get().addLog(`❌ 没有${names[cardLevel]}铭刻卡！去学院购买`);
      return null;
    }
    
    // 根据铭刻卡等级筛选可获取的因子
    const levelMap = { copper:'N', silver:'R', gold:'SR' };
    const maxLevel = levelMap[cardLevel];
    const levelOrder = ['N','R','SR','SSR','UR'];
    
    const availableFactors = monster.factorPool.filter(fid => {
      const f = ALL_FACTORS[fid];
      return f && levelOrder.indexOf(f.level) <= levelOrder.indexOf(maxLevel);
    });
    
    if (availableFactors.length === 0) return null;
    
    const factorId = availableFactors[Math.floor(Math.random() * availableFactors.length)];
    const factor = ALL_FACTORS[factorId];
    if (!factor) return null;
    
    const card: Card = {
      id: newCardId(), name: `${monster.id.split('_')[0]}的${factor.id}`,
      factors: [factor], imageUrl: monster.imageUrl, stars: 1, status: 'normal',
    };
    get().addCard(card);
    get().addLog(`📜 铭刻成功: ${factor.id} (${factor.level})`);
    
    // 消耗铭刻卡
    // 每只怪只能铭刻一次
    set(s => ({ battle: s.battle ? { ...s.battle, canEngrave: false, engraveTarget: undefined } : null }));
    if (cardLevel === 'copper') set(s => ({ engraveCopper: s.engraveCopper - 1 }));
    else if (cardLevel === 'silver') set(s => ({ engraveSilver: s.engraveSilver - 1 }));
    else if (cardLevel === 'gold') set(s => ({ engraveGold: s.engraveGold - 1 }));
    
    return factorId;
  },

  startBattle: (dungeonId) => {
    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return;
    
    // 随机选怪物
    const monsterIds = dungeon.bossMonster ? [dungeon.bossMonster] : dungeon.monsters;
    const mid = monsterIds[Math.floor(Math.random() * monsterIds.length)];
    const monster = MONSTER_MAP[mid];
    if (!monster) return;
    
    const s = get();
    // 检查是否有可用的卡
    const available = s.bag.filter(c => c.status === 'normal');
    if (available.length === 0) { get().addLog('⚠️ 没有可用的卡片，先去融合几张吧'); return; }
    if (available.length > 3) available.length = 3;
    
    // 创建队伍（卡片不够3张就用可用的）
    const team: BattleCard[] = [];
    for (let i = 0; i < Math.min(3, available.length); i++) {
      const pos = i === 0 ? 'front' : (i === 1 ? 'supportA' : 'supportB');
      team.push(createBattleCard(available[i], pos));
    }
    
    const enemy = createBattleMonster(monster);
    
    set({
      battle: {
        phase: 'fighting',
        playerTeam: team,
        enemyTeam: [enemy],
        currentTurn: 1,
        activeIndex: 0,
        log: [],
        canEngrave: !!dungeon.monsters.includes(mid),
        engraveTarget: dungeon.monsters.includes(mid) ? monster : undefined,
      },
      currentPage: 'battle',
    });
  },

  playerAction: (skillIndex, targetIndex) => {
    const s = get();
    if (!s.battle || s.battle.phase !== 'fighting') return;
    
    const bc = s.battle.playerTeam[s.battle.activeIndex];
    if (!bc || bc.currentHp <= 0) return;
    
    const aliveEnemies = s.battle.enemyTeam.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) { get().endBattle(); return; }
    
    // skillIndex === -1 表示普通攻击
    const skills = bc.card.skills || [];
    const isBasic = skillIndex === -1 || skillIndex >= skills.length;
    const target = aliveEnemies[Math.min(targetIndex, aliveEnemies.length - 1)];
    let skill: Skill | undefined;
    
    if (!isBasic) {
      skill = skills[skillIndex];
      if (!skill) return;
      if (bc.currentMp < (skill.mpCost || 0)) return; // MP不够
    }
    
    const result = isBasic
      ? executeBasicAttack(bc, target, s.battle.currentTurn)
      : executeSkill(bc, target, skill!, s.battle.currentTurn);
    
    // 更新
    let newEnemyTeam = s.battle.enemyTeam.map(e => {
      if (e === target) return { ...e, currentHp: result.targetNewHp };
      return e;
    });
    
    const newPlayerTeam = s.battle.playerTeam.map(p => {
      if (p === bc) return { ...p, currentMp: p.currentMp - (isBasic ? 0 : (skill?.mpCost || 0)) };
      return p;
    });
    
    let newLog = [...s.battle.log, result.log];
    
    // 检查敌方全灭
    if (newEnemyTeam.every(e => e.currentHp <= 0)) {
      set({ battle: { ...s.battle, playerTeam: newPlayerTeam, enemyTeam: newEnemyTeam, log: newLog, phase: 'victory' } });
      get().addLog('🎉 战斗胜利!');
      return;
    }
    
    // 怪物回合 — 从更新后的敌人中找活着的来行动
    const aliveAfterPlayer = newEnemyTeam.filter(e => e.currentHp > 0);
    if (aliveAfterPlayer.length > 0) {
      const monster = aliveAfterPlayer[0];
      const mResult = monsterAI(monster, newPlayerTeam.filter(p => p.currentHp > 0));
      
      if (mResult) {
        if (mResult.isBasic) {
          const mExec = executeBasicAttack(monster, mResult.target, s.battle.currentTurn);
          newPlayerTeam.forEach(p => {
            if (p === mResult.target) p.currentHp = mExec.targetNewHp;
          });
          newLog = [...newLog, mExec.log];
        } else if (mResult.skill) {
          const mExec = executeSkill(monster, mResult.target, mResult.skill, s.battle.currentTurn);
          newPlayerTeam.forEach(p => {
            if (p === mResult.target) p.currentHp = mExec.targetNewHp;
          });
          newLog = [...newLog, mExec.log];
        }
      }
    }
    
    // 检查玩家全灭
    if (newPlayerTeam.every(p => p.currentHp <= 0)) {
      const injuredIds = s.battle.playerTeam.map(bc => bc.card.id);
      set({
        bag: get().bag.map(c => {
          if (injuredIds.includes(c.id)) return { ...c, status: 'injured' as const };
          return c;
        }),
        battle: { ...s.battle, playerTeam: newPlayerTeam, enemyTeam: newEnemyTeam, log: newLog, phase: 'defeat' },
      });
      get().addLog('💔 战斗失败！卡片重伤，需去医院治疗');
      return;
    }
    
    // 找到下一个活着的卡片来做 activeIndex
    const nextActive = nextAliveIndex(newPlayerTeam, s.battle.activeIndex);
    if (nextActive === -1) {
      // 不应该走到这里（上面已经判全灭），防御性兜底
      set({ battle: { ...s.battle, playerTeam: newPlayerTeam, enemyTeam: newEnemyTeam, log: newLog, phase: 'defeat' } });
      return;
    }
    
    set({
      battle: {
        ...s.battle,
        playerTeam: newPlayerTeam,
        enemyTeam: newEnemyTeam,
        log: newLog,
        currentTurn: s.battle.currentTurn + 1,
        activeIndex: nextActive,
      },
    });
  },

  endBattle: () => {
    const s = get();
    if (!s.battle) return;
    
    if (s.battle.phase === 'victory') {
      const reward = 10 + Math.floor(Math.random() * 30);
      set({ gold: s.gold + reward });
      get().addLog(`💰 获得 ${reward} 金币`);
    }
    
    set({ battle: null, currentPage: 'home' });
  },

  healCard: (cardId) => {
    const gold = get().gold;
    if (gold < 30) { get().addLog('💰 治疗需要30金币'); return; }
    
    set(s => ({
      gold: s.gold - 30,
      bag: s.bag.map(c => c.id === cardId ? { ...c, status: 'normal' as const } : c),
    }));
    get().addLog('🏥 卡片已康复');
  },

  save: async () => {
    const s = get();
    await saveGame('auto', {
      version: 1,
      timestamp: Date.now(),
      gold: s.gold,
      diamonds: s.diamonds,
      bag: s.bag,
      warehouse: s.warehouse,
      hospitalQueue: s.hospitalQueue,
      unlockedAreas: s.unlockedAreas,
      tutorialDone: s.tutorialDone,
      questFlags: {},
      engraveCopper: s.engraveCopper,
      engraveSilver: s.engraveSilver,
      engraveGold: s.engraveGold,
    });
  },

  load: async () => {
    const data = await loadGame('auto');
    if (!data) return false;
    set({
      gold: data.gold, diamonds: data.diamonds,
      bag: data.bag.map(hydrateCard), warehouse: data.warehouse.map(hydrateCard),
      hospitalQueue: data.hospitalQueue, unlockedAreas: data.unlockedAreas,
      tutorialDone: data.tutorialDone,
      engraveCopper: (data as any).engraveCopper ?? 0,
      engraveSilver: (data as any).engraveSilver ?? 0,
      engraveGold: (data as any).engraveGold ?? 0,
    });
    return true;
  },

  newGame: () => {
    const s = createNewSave();
    set({
      gold: s.gold, diamonds: s.diamonds,
      bag: [], warehouse: [], hospitalQueue: [],
      unlockedAreas: s.unlockedAreas, tutorialDone: false,
      battle: null, currentPage: 'home',
    });
  },
}));
