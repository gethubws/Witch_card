// ============================================
// 魔女卡牌 — 全局类型定义
// ============================================

// ---- 因子 ----
export type FactorLevel = 'N' | 'R' | 'SR' | 'SSR' | 'UR';
export type FactorCategory = 'element' | 'combat' | 'trait' | 'magic' | 'soul' | 'fate';

export interface FactorStat {
  atk: number;
  def: number;
  spd: number;
  hp: number;
  mp: number;
  crit: number;   // 百分比
  dodge: number;  // 百分比
}

export interface Skill {
  name: string;
  type: 'active' | 'passive' | 'aura';
  target: 'single_ally' | 'all_allies' | 'single_enemy' | 'all_enemies' | 'self' | 'random_enemy';
  effect: string;
  mpCost?: number;
  cooldown?: number;
  multiplier?: number;
  desc?: string;
  statusEffect?: string;   // burn, stun, freeze...
  defBased?: boolean;       // 基于 DEF 计算攻击
  pierceDef?: number;       // 穿防比例 (0-1)
  heal?: boolean;           // 治疗技能
  hits?: number;            // 多段攻击次数
}

export interface FactorDef {
  id: string;
  category?: FactorCategory;
  level: FactorLevel;
  promptZh: string;
  promptEn: string;
  stats: FactorStat;
  passive?: string;
  skill?: Skill;
  description: string;
  tag?: string;       // 子标签，如 "fire", "water"
  element?: string;    // 九元素: 地火水风光暗人神以太
  subElements?: string[]; // 融合因子的多元素标签
}

export type ElementType = '地' | '火' | '水' | '风' | '光' | '暗' | '人' | '神' | '以太';

// ---- 卡片 ----
export interface Card {
  id: string;
  name: string;
  factors: FactorDef[];
  imageUrl: string | null;
  stars: number;
  status: 'normal' | 'injured' | 'dispatched';
  // 运行时计算
  stats?: CardStat;
  skills?: Skill[];
  title?: string;        // 共鸣称号
}

export interface CardStat {
  atk: number;
  def: number;
  spd: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  crit: number;
  dodge: number;
}

// ---- 怪物 ----
export type EliteLevel = 'normal' | 'elite' | 'boss';

export interface Monster {
  id: string;
  name: string;
  eliteLevel: EliteLevel;   // 精英等级（替代 hardcoded stats）
  factorPool: string[];      // 因子 id 列表（N:6, R:9, SR:12, SSR:15）
  imageUrl: string;
  description: string;
  // stats 和 skills 由 MonsterEngine.buildMonster() 动态生成
}

// ---- 融合 ----
export type FusionType = 'hexagram' | 'forbidden';

export interface ConflictFusionRule {
  inputs: [string, string];
  output: string;
  level: FactorLevel;
}

export interface ResonanceRule {
  name: string;
  title: string;
  minCount?: number;
  tag?: string;
  element?: string;
  category?: FactorCategory;
  requiredAtoms?: string[];
  bonus: string;
}

// ---- 存档 ----
export interface SaveData {
  version: number;
  timestamp: number;
  gold: number;
  diamonds: number;
  bag: Card[];
  warehouse: Card[];
  hospitalQueue: { cardId: string; healEndTime: number }[];
  unlockedAreas: string[];
  tutorialDone: boolean;
  questFlags: Record<string, boolean>;
  blankEngraveCards: number;  // 空白铭刻卡（战斗中消耗一回合，随机抽取怪物1个因子）
  captureCards: number;       // 空白卡（战斗中消耗一回合，捕捉整只怪物）
  cardImageCache?: Record<string, string>;  // 因子组合key→图片dataUrl
  engraveCopper: number;      // 旧版兼容
  engraveSilver: number;
  engraveGold: number;
}

// ---- 编队 ----
export type TeamPosition = 'front' | 'supportA' | 'supportB';

export interface TeamSlot {
  position: TeamPosition;
  cardId: string | null;
}

// ---- 战斗动画 ----
export type AnimType = 'strike' | 'shake' | 'crit' | 'defeat' | 'heal' | 'buff';

export interface BattleAnim {
  type: AnimType;
  sourceId: string;    // 攻击者 card id
  targetId: string;    // 受击者 card id
  damage?: number;
  isCrit?: boolean;
}

// ---- 战斗 ----
export interface BattleState {
  phase: 'setup' | 'fighting' | 'victory' | 'defeat';
  playerTeam: BattleCard[];
  enemyTeam: BattleCard[];
  currentTurn: number;
  activeIndex: number;  // 当前行动的角色在 playerTeam 中的索引
  log: BattleLogEntry[];
  canEngrave: boolean;
  engraveTarget?: Monster;
  itemUsedThisTurn: boolean; // 当前回合是否已用物品
  animQueue: BattleAnim[];
  selectedSkill: number | null;
  selectedTarget: number | null;
  actingSide: 'player' | 'enemy'; // 当前行动方
}

export interface BattleCard {
  card: Card;
  currentHp: number;
  currentMp: number;
  position: TeamPosition;
  buffs: Buff[];
  uid: string; // 动画用的唯一标识
}

export interface Buff {
  id: string;
  name: string;
  turnsLeft: number;
  effect: string;
  atkMod?: number;
  defMod?: number;
}

export interface BattleLogEntry {
  turn: number;
  actor: string;
  action: string;
  target: string;
  result: string;
  damage?: number;
}

// ---- 消耗品 & 商店 ----
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'gold' | 'diamond';
  type: 'factor_card' | 'engrave_card' | 'consumable';
  factorId?: string;
  engraveType?: 'copper' | 'silver' | 'gold';
  stock?: number;
}

// ---- 副本 ----
export interface Dungeon {
  id: string;
  name: string;
  description: string;
  difficulty: 'N' | 'R' | 'SR' | 'SSR';
  monsters: string[];      // monster id 列表
  bossMonster?: string;    // boss monster id
}

export interface DungeonEncounter {
  dungeonId: string;
  monsters: Monster[];
  canEngrave: boolean;
}
