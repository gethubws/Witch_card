// ============================================
// 魔女卡牌 — 全局游戏状态 (Zustand)
// ============================================
import { create } from 'zustand';
import type { Card, BattleState, BattleCard, Skill, TeamPosition, AnimType } from '../types';
import { calcCardStat, collectSkills } from '../engine/FactorEngine';
import { hexagramFusion, forbiddenFusion, generateName } from '../engine/FusionEngine';
import { createBattleCard, createBattleMonster, executeSkill, executeBasicAttack, monsterAI, nextAliveIndex, tickBuffs } from '../engine/CombatEngine';
import { createNewSave, saveGame, loadGame } from '../engine/SaveManager';
import { ALL_FACTORS, STAR_FACTOR_POOLS } from '../config/factors';
import { MONSTER_MAP } from '../config/monsters';
import { SHOP_ITEMS, DUNGEONS, getNextDungeon } from '../config/shops';

// ---- Helper: generate unique card ID ----
let cardIdCounter = Date.now();
function newCardId() { return `card_${++cardIdCounter}`; }

// ---- Helper: hydrate card with computed stats ----
function hydrateCard(card: Card): Card {
  card.stats = calcCardStat(card.factors);
  card.skills = collectSkills(card.factors);
  return card;
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
  blankEngraveCards: number;
  captureCards: number;
  
  // 图片缓存：因子组合key → dataUrl，卡片消耗后图不丢
  cardImageCache: Record<string, string>;
  currentPage: 'home' | 'cauldron' | 'battle' | 'dungeon' | 'map' | 'teamSelect' | 'shop' | 'hospital' | 'warehouse';
  battle: BattleState | null;
  pendingDungeonId: string | null;
  fusionAnimating: boolean;
  logMessages: string[];

  // 地图探索
  defeatedMapGroups: string[];
  pendingMapEnemies: ReturnType<typeof createBattleMonster>[] | null;
  pendingMapGroupName: string | null;
  pendingMapGroupId: string | null;
  pendingMapEntry: boolean;
  
  // 引擎操作
  addLog: (msg: string) => void;
  setPage: (page: GameState['currentPage']) => void;
  
  // 卡片
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  getCard: (cardId: string) => Card | undefined;
  setCardImage: (cardId: string, imageUrl: string) => void;
  
  // 商店
  buyItem: (itemId: string, factorId?: string) => boolean;
  
  // 融合
  doHexagramFusion: (factorIds: string[]) => { card: Card; conflicts: string[]; resonances: string[]; title?: string; stackingLog?: string; stackingBonus?: {hp:number;atk:number;mp:number} } | null;
  doForbiddenFusion: (cardIdA: string, cardIdB: string) => { card: Card; conflicts: string[]; resonances: string[]; title?: string; stackingLog?: string; stackingBonus?: {hp:number;atk:number;mp:number} } | null;
  generateCardName: (card: Card) => string;

  // 升星
  starUpCard: (cardId: string, factorId: string) => { card: Card; newFactor: string } | null;
  findStarDupe: (cardId: string) => string | null;  // 找到同因子的复制品ID
  getStarUpPool: (targetStars: number) => string[];
  
  // 铭刻 (战斗中物品)
  useBattleItem: (itemType: 'engrave' | 'capture', targetEnemyIndex: number) => string | null;
  
  // 战斗
  selectDungeon: (dungeonId: string) => void;
  startBattle: (team: { cardId: string; position: TeamPosition }[]) => void;
  playerAction: (skillIndex: number, targetIndex: number) => void;
  playerDefend: () => void;
  enemyAction: () => void;
  endBattle: () => void;

  // 地图探索战斗
  triggerMapEncounter: (enemies: ReturnType<typeof createBattleMonster>[], groupName?: string, groupId?: string) => void;
  startMapBattle: (teamSelection: { cardId: string; position: TeamPosition }[]) => void;
  finishMapBattle: () => void;
  
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
  unlockedAreas: ['slime_plains'],
  tutorialDone: false,
  currentPage: 'home',
  battle: null,
  pendingDungeonId: null,
  fusionAnimating: false,
  logMessages: [],
  defeatedMapGroups: [],
  pendingMapEnemies: null,
  pendingMapGroupName: null,
  pendingMapGroupId: null,
  pendingMapEntry: false,
  engraveCopper: 0,
  engraveSilver: 0,
  engraveGold: 0,
  blankEngraveCards: 1,
  captureCards: 0,
  cardImageCache: {},

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

  setCardImage: (cardId, imageUrl) => {
    set(s => ({
      bag: s.bag.map(c => c.id === cardId ? { ...c, imageUrl } : c),
      warehouse: s.warehouse.map(c => c.id === cardId ? { ...c, imageUrl } : c),
    }));
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
      set(s => ({ blankEngraveCards: s.blankEngraveCards + 1 }));
      get().addLog('✅ 获得了空白铭刻卡');
    }
    if (item.type === 'consumable' && item.id === 'capture_blank') {
      set(s => ({ captureCards: s.captureCards + 1 }));
      get().addLog('✅ 获得了空白卡');
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

  // 查找背包/仓库中和目标同因子的复制品
  findStarDupe: (cardId) => {
    const s = get();
    const target = s.getCard(cardId);
    if (!target || target.stars >= 6) return null;  // 6星满
    const targetKeys = [...target.factors.map(f => f.id)].sort().join(',');
    const dup = [...s.bag, ...s.warehouse].find(c =>
      c.id !== cardId &&
      c.stars === target.stars &&
      c.status === 'normal' &&
      [...c.factors.map(f => f.id)].sort().join(',') === targetKeys
    );
    return dup?.id || null;
  },

  getStarUpPool: (targetStars) => {
    return STAR_FACTOR_POOLS[targetStars] || [];
  },

  starUpCard: (cardId, factorId) => {
    const s = get();
    const target = s.getCard(cardId);
    if (!target) return null;

    const newStars = target.stars + 1;
    if (newStars > 6) return null;

    // 检查因子是否在可选的池子里
    const pool = STAR_FACTOR_POOLS[newStars];
    if (!pool?.includes(factorId)) { get().addLog(`⚠️ 该因子不可用于升至★${newStars}`); return null; }
    if (target.factors.some(f => f.id === factorId)) { get().addLog('⚠️ 该因子已存在'); return null; }

    // 找到并消耗复制品
    const dupeId = get().findStarDupe(cardId);
    if (!dupeId) { get().addLog('⚠️ 需要一张因子完全相同的卡片作为素材'); return null; }

    const newFactor = ALL_FACTORS[factorId];
    if (!newFactor) return null;

    // 消耗素材卡 + 替换目标卡
    const updatedCard: Card = {
      ...target,
      stars: newStars,
      factors: [...target.factors, newFactor],
    };
    const targetId = target.id;
    set(prev => ({
      bag: prev.bag.filter(c => c.id !== dupeId).map(c => c.id === targetId ? updatedCard : c),
      warehouse: prev.warehouse.filter(c => c.id !== dupeId).map(c => c.id === targetId ? updatedCard : c),
    }));

    hydrateCard(updatedCard);
    get().addLog(`🌟 升星成功! ★${newStars} — 习得 ${factorId}`);

    return { card: hydrateCard(updatedCard), newFactor: factorId };
  },

  useBattleItem: (itemType, targetEnemyIndex) => {
    const s = get();
    if (!s.battle || s.battle.phase !== 'fighting') return null;
    if (s.battle.actingSide !== 'player') return null;
    if (s.battle.itemUsedThisTurn) { get().addLog('⚠️ 本回合已使用过物品'); return null; }

    const target = s.battle.enemyTeam[targetEnemyIndex];
    if (!target || target.currentHp <= 0) return null;

    if (itemType === 'engrave') {
      if (s.blankEngraveCards <= 0) { get().addLog('❌ 没有空白铭刻卡！去学院购买'); return null; }
      const factors = target.card.factors;
      if (factors.length === 0) return null;
      const factor = factors[Math.floor(Math.random() * factors.length)];
      const card: Card = {
        id: newCardId(), name: `${factor.id}铭刻卡`,
        factors: [factor], imageUrl: target.card.imageUrl, stars: 1, status: 'normal',
      };
      get().addCard(card);
      set(s => ({
        blankEngraveCards: s.blankEngraveCards - 1,
        battle: s.battle ? { ...s.battle, itemUsedThisTurn: true, actingSide: 'enemy' as const } : null,
      }));
      get().addLog(`📜 铭刻: ${factor.id} (${factor.level})`);
      // 消耗回合 → 触发怪物回合
      setTimeout(() => get().enemyAction(), 600);
      return factor.id;
    }

    if (itemType === 'capture') {
      if (s.captureCards <= 0) { get().addLog('❌ 没有空白卡！去学院购买'); return null; }
      // 捕捉成功率: 100% - (HP% × 0.7) - eliteLevel惩罚
      const hpPct = target.currentHp / (target.card.stats?.maxHp || 100);
      const elitePenalty = { normal: 0, elite: 20, boss: 40 }[target.card.factors.length > 10 ? 'boss' : target.card.factors.length > 6 ? 'elite' : 'normal'] || 20;
      const successRate = Math.max(5, 100 - hpPct * 70 - elitePenalty);
      const success = Math.random() * 100 < successRate;

      set(s => ({ captureCards: s.captureCards - 1 }));

      if (success) {
        const capturedCard: Card = {
          id: newCardId(), name: target.card.name,
          factors: [...target.card.factors],
          imageUrl: target.card.imageUrl || '',
          stars: 1, status: 'normal',
        };
        get().addCard(capturedCard);
        // 移除敌人
        set(s => ({
          battle: s.battle ? {
            ...s.battle,
            enemyTeam: s.battle.enemyTeam.map((e, i) =>
              i === targetEnemyIndex ? { ...e, currentHp: 0 } : e
            ),
            itemUsedThisTurn: true,
            actingSide: 'enemy' as const,
          } : null,
        }));
        get().addLog(`✅ 捕捉成功! 获得 ${target.card.name}`);

        // 检查敌方全灭
        const remaining = get().battle?.enemyTeam.filter(e => e.currentHp > 0) || [];
        if (remaining.length === 0) {
          set(s => ({ battle: s.battle ? { ...s.battle, phase: 'victory' as const } : null }));
          get().addLog('🎉 战斗胜利!');
        } else {
          setTimeout(() => get().enemyAction(), 600);
        }
        return target.card.name;
      } else {
        set(s => ({
          battle: s.battle ? { ...s.battle, itemUsedThisTurn: true, actingSide: 'enemy' as const } : null,
        }));
        get().addLog(`💨 捕捉失败... (成功率${Math.round(successRate)}%)`);
        setTimeout(() => get().enemyAction(), 600);
        return null;
      }
    }
    return null;
  },

  // 保留旧接口 (兼容)
  engraveMonster: (monsterId: string, cardLevel: 'copper'|'silver'|'gold') => {
    const s = get();
    const monster = MONSTER_MAP[monsterId];
    if (!monster) return null;
    if (s.blankEngraveCards <= 0) { get().addLog('❌ 没有空白铭刻卡！'); return null; }
    const factor = monster.factorPool[Math.floor(Math.random() * monster.factorPool.length)];
    const f = ALL_FACTORS[factor];
    if (!f) return null;
    const card: Card = {
      id: newCardId(), name: `${factor}铭刻卡`,
      factors: [f], imageUrl: monster.imageUrl, stars: 1, status: 'normal',
    };
    get().addCard(card);
    set(s => ({ blankEngraveCards: s.blankEngraveCards - 1 }));
    get().addLog(`📜 铭刻: ${factor} (${f.level})`);
    return factor;
  },

  // ═══ 地图探索战斗 ═══
  triggerMapEncounter: (enemies, groupName?, groupId?) => {
    set({
      pendingMapEnemies: enemies,
      pendingMapGroupName: groupName || null,
      pendingMapGroupId: groupId || null,
      currentPage: 'teamSelect',
    });
  },

  startMapBattle: (teamSelection) => {
    const s = get();
    const enemies = s.pendingMapEnemies;
    if (!enemies || enemies.length === 0) return;

    const team: BattleCard[] = [];
    for (const slot of teamSelection) {
      const card = s.bag.find(c => c.id === slot.cardId);
      if (card) team.push(createBattleCard(card, slot.position));
    }
    if (team.length === 0) return;

    set({
      battle: {
        phase: 'fighting',
        playerTeam: team,
        enemyTeam: enemies,
        currentTurn: 1,
        activeIndex: 0,
        log: [],
        canEngrave: true,
        animQueue: [],
        selectedSkill: null,
        selectedTarget: null,
        actingSide: 'player',
        itemUsedThisTurn: false,
      },
      currentPage: 'battle',
      pendingMapEnemies: null,
    });
  },

  finishMapBattle: () => {
    const s = get();
    const cleared = new Set(s.defeatedMapGroups);
    if (s.pendingMapGroupId) cleared.add(s.pendingMapGroupId);
    if (s.battle) {
      for (const e of s.battle.enemyTeam) {
        if (e.currentHp <= 0 && (e as any)._soloId) cleared.add((e as any)._soloId);
      }
    }
    set({
      currentPage: 'map',
      battle: null,
      defeatedMapGroups: [...cleared],
      pendingMapGroupId: null,
      pendingMapGroupName: null,
    });
  },

  selectDungeon: (dungeonId) => {
    const s = get();
    if (s.bag.filter(c => c.status === 'normal').length === 0) {
      get().addLog('⚠️ 没有可用的卡片，先去融合几张吧');
      return;
    }
    set({ pendingDungeonId: dungeonId, currentPage: 'teamSelect' });
  },

  startBattle: (teamSelection) => {
    const s = get();
    const dungeonId = s.pendingDungeonId;
    if (!dungeonId) return;

    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return;

    // 根据编队创建战斗卡
    const team: BattleCard[] = [];
    for (const slot of teamSelection) {
      const card = s.bag.find(c => c.id === slot.cardId);
      if (card) team.push(createBattleCard(card, slot.position));
    }
    if (team.length === 0) return;

    // 生成怪物
    // 生成怪物: 15%隐藏 / 10%BOSS / 75%普通
    let monsterIds = [...dungeon.monsters];
    if (dungeon.bossMonster) monsterIds.push(dungeon.bossMonster);
    const roll = Math.random();
    if (dungeon.hiddenMonster && roll < 0.15) {
      monsterIds = [dungeon.hiddenMonster];
    } else if (dungeon.bossMonster && roll < 0.25) {
      monsterIds = [dungeon.bossMonster];
    }
    const mid = monsterIds[Math.floor(Math.random() * monsterIds.length)];
    const monster = MONSTER_MAP[mid];
    if (!monster) return;

    const enemy = createBattleMonster(monster);

    set({
      battle: {
        phase: 'fighting',
        playerTeam: team,
        enemyTeam: [enemy],
        currentTurn: 1,
        activeIndex: 0,
        log: [],
        canEngrave: false,
        animQueue: [],
        selectedSkill: null,
        selectedTarget: null,
        actingSide: 'player',
        itemUsedThisTurn: false,
      },
      currentPage: 'battle',
      pendingDungeonId: null,
    });
  },

  playerAction: (skillIndex, targetIndex) => {
    const s = get();
    if (!s.battle || s.battle.phase !== 'fighting' || s.battle.actingSide !== 'player') return;

    const bc = s.battle.playerTeam[s.battle.activeIndex];
    if (!bc || bc.currentHp <= 0) return;

    const aliveEnemies = s.battle.enemyTeam.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) { get().endBattle(); return; }

    const skills = bc.card.skills || [];
    const isBasic = skillIndex === -1 || skillIndex >= skills.length;
    const target = aliveEnemies[Math.min(targetIndex, aliveEnemies.length - 1)];
    let skill: Skill | undefined;

    if (!isBasic) {
      skill = skills[skillIndex];
      if (!skill || bc.currentMp < (skill.mpCost || 0)) return;
    }

    const result = isBasic
      ? executeBasicAttack(bc, target, s.battle.currentTurn)
      : executeSkill(bc, target, skill!, s.battle.currentTurn);

    // 攻击动画
    const atkAnim = result.crit ? 'crit' : 'strike';

    // 更新敌方
    let newEnemyTeam = s.battle.enemyTeam.map(e => {
      if (e.uid === target.uid) return { ...e, currentHp: result.targetNewHp };
      return e;
    });

    // 更新玩家 MP
    const newPlayerTeam = s.battle.playerTeam.map(p => {
      if (p.uid === bc.uid) return { ...p, currentMp: result.attackerNewMp };
      return p;
    });

    let newLog = [...s.battle.log, result.log];

    // 检查敌方全灭
    if (newEnemyTeam.every(e => e.currentHp <= 0)) {
      set({
        battle: {
          ...s.battle,
          playerTeam: newPlayerTeam,
          enemyTeam: newEnemyTeam,
          log: newLog,
          phase: 'victory',
          selectedSkill: null,
          selectedTarget: null,
        },
      });
      get().addLog('🎉 战斗胜利!');
      return;
    }

    // 设为怪物回合
    set({
      battle: {
        ...s.battle,
        playerTeam: newPlayerTeam,
        enemyTeam: newEnemyTeam,
        log: newLog,
        actingSide: 'enemy',
        selectedSkill: null,
        selectedTarget: null,
        animQueue: [...s.battle.animQueue, { type: atkAnim as AnimType, sourceId: bc.uid, targetId: target.uid, damage: result.damage, isCrit: result.crit }],
      },
    });
  },

  /** 防御 — 跳过攻击，+5DEF buff，少量恢复，结束回合 */
  playerDefend: () => {
    const s = get();
    if (!s.battle || s.battle.phase !== 'fighting' || s.battle.actingSide !== 'player') return;
    const btl = s.battle;
    const bc = btl.playerTeam[btl.activeIndex];
    if (!bc || bc.currentHp <= 0) return;

    const stats = bc.card.stats || { maxHp: 100, maxMp: 100, def: 0 };
    const hpGain = Math.min(5, (stats.maxHp || 100) - bc.currentHp);
    const mpGain = Math.min(3, (stats.maxMp || 100) - bc.currentMp);

    const defendBuff = { id: `buff_def_${Date.now()}`, name: '防守', turnsLeft: 1, effect: 'DEF+5', defMod: 5 };

    set({
      battle: {
        ...btl,
        playerTeam: btl.playerTeam.map((p, i) =>
          i === btl.activeIndex
            ? { ...p, currentHp: p.currentHp + hpGain, currentMp: p.currentMp + mpGain, buffs: [...(p.buffs || []), defendBuff] }
            : p
        ),
        actingSide: 'enemy' as const,
        selectedSkill: null,
        selectedTarget: null,
        log: [...btl.log, {
          turn: btl.currentTurn, actor: bc.card.name, action: '防御',
          target: '-', result: `DEF+5, +${hpGain}HP +${mpGain}MP`,
        }],
      },
    });
    get().addLog(`🛡️ ${bc.card.name} 进入防守姿态!`);
  },

  /** 怪物行动 — 由 UI 在动画后调用 */
  enemyAction: () => {
    const s = get();
    if (!s.battle || s.battle.phase !== 'fighting' || s.battle.actingSide !== 'enemy') return;

    const aliveEnemies = s.battle.enemyTeam.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) { get().endBattle(); return; }

    // 按速度排序，最快的先行动
    const sortedEnemies = [...aliveEnemies].sort((a, b) =>
      (b.card.stats?.spd || 0) - (a.card.stats?.spd || 0)
    );

    let newPlayerTeam = [...s.battle.playerTeam];
    let newEnemyTeam = [...s.battle.enemyTeam];
    let newLog = [...s.battle.log];
    let newAnims = [...s.battle.animQueue];

    for (const enemy of sortedEnemies) {
      const currentEnemy = newEnemyTeam.find(e => e.uid === enemy.uid);
      if (!currentEnemy || currentEnemy.currentHp <= 0) continue;

      const alivePlayers = newPlayerTeam.filter(p => p.currentHp > 0);
      if (alivePlayers.length === 0) break;

      const mResult = monsterAI(currentEnemy, alivePlayers);
      if (!mResult) continue;

      const mExec = mResult.isBasic
        ? executeBasicAttack(currentEnemy, mResult.target, s.battle.currentTurn)
        : executeSkill(currentEnemy, mResult.target, mResult.skill!, s.battle.currentTurn);

      newAnims = [...newAnims, { type: (mExec.crit ? 'crit' : 'strike') as AnimType, sourceId: currentEnemy.uid, targetId: mResult.target.uid, damage: mExec.damage, isCrit: mExec.crit }];

      newEnemyTeam = newEnemyTeam.map(e => {
        if (e.uid === currentEnemy.uid) return { ...e, currentMp: mExec.attackerNewMp };
        return e;
      });
      newPlayerTeam = newPlayerTeam.map(p => {
        if (p.uid === mResult.target.uid) return { ...p, currentHp: mExec.targetNewHp };
        return p;
      });
      newLog = [...newLog, mExec.log];

      // 检查玩家全灭
      if (newPlayerTeam.every(p => p.currentHp <= 0)) {
        const injuredIds = s.battle.playerTeam.map(bc => bc.card.id);
        set({
          bag: get().bag.map(c => {
            if (injuredIds.includes(c.id)) return { ...c, status: 'injured' as const };
            return c;
          }),
          battle: {
            ...s.battle,
            playerTeam: newPlayerTeam,
            enemyTeam: newEnemyTeam,
            log: newLog,
            phase: 'defeat',
          },
        });
        get().addLog('💔 战斗失败！卡片重伤，需去医院治疗');
        return;
      }
    }

    // 怪物回合结束 → 回到玩家回合，推进 activeIndex
    const nextActive = nextAliveIndex(newPlayerTeam, s.battle.activeIndex);
    if (nextActive === -1) {
      set({
        battle: {
          ...s.battle,
          playerTeam: newPlayerTeam,
          enemyTeam: newEnemyTeam,
          log: newLog,
          phase: 'defeat',
        },
      });
      return;
    }

    set({
      battle: {
        ...s.battle,
        playerTeam: newPlayerTeam.map(p => ({ ...p, buffs: tickBuffs(p.buffs || []) })),
        enemyTeam: newEnemyTeam.map(e => ({ ...e, buffs: tickBuffs(e.buffs || []) })),
        log: newLog,
        currentTurn: s.battle.currentTurn + 1,
        activeIndex: nextActive,
        actingSide: 'player',
        selectedSkill: null,
        selectedTarget: null,
        itemUsedThisTurn: false,
        animQueue: newAnims,
      },
    });
  },

  endBattle: () => {
    const s = get();
    if (!s.battle) return;

    if (s.battle.phase === 'victory') {
      const reward = 10 + Math.floor(Math.random() * 30);
      const nextDungeon = s.pendingDungeonId ? getNextDungeon(s.pendingDungeonId) : null;
      const unlockedAreas = nextDungeon && !s.unlockedAreas.includes(nextDungeon)
        ? [...s.unlockedAreas, nextDungeon]
        : s.unlockedAreas;
      const unlockMsg = unlockedAreas.length > s.unlockedAreas.length
        ? ` | 🗺️ 新副本解锁!` : '';
      set({ gold: s.gold + reward, battle: null, currentPage: 'home', unlockedAreas });
      get().addLog(`💰 获得 ${reward} 金币${unlockMsg}`);
      return;
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
      blankEngraveCards: s.blankEngraveCards,
      captureCards: s.captureCards,
      cardImageCache: s.cardImageCache,
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
      blankEngraveCards: (data as any).blankEngraveCards ?? 1,
      captureCards: (data as any).captureCards ?? 0,
      cardImageCache: (data as any).cardImageCache ?? {},
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
