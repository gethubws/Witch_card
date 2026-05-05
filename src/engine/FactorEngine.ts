// ============================================
// 魔女卡牌 — 因子引擎 v3 (九元素+发展度+互克)
// ============================================
import type { FactorDef, CardStat, FactorCategory } from '../types';
import { ALL_FACTORS } from '../config/factors';
import { evaluateSynergies } from './SynergyEngine';

// ═══════ 元素互克表 ═══════
const COUNTER_MAP: Record<string, string[]> = {
  '地': ['风'],
  '火': ['水'],
  '水': ['地'],
  '风': ['火'],
  '光': ['暗'],
  '暗': ['光'],
  '人': [],
  '神': [],
  '以太': [],
};

/** 获取单个因子的所有元素标签（主元素 + 副元素） */
export function getElementTags(f: FactorDef): string[] {
  const tags: string[] = [];
  if (f.element) tags.push(f.element);
  if (f.subElements) tags.push(...f.subElements);
  return tags;
}

/** 统计卡片的元素分布 */
export function countElements(factors: FactorDef[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of factors) {
    for (const el of getElementTags(f)) {
      counts[el] = (counts[el] || 0) + 1;
    }
  }
  return counts;
}

/** 计算因子发展度 = 1.2^n，n=同元素标签出现次数 */
export function calcDevelopmentDegree(factors: FactorDef[]): number {
  const elementCounts = countElements(factors);
  let maxDegree = 1.0;
  for (const [el, count] of Object.entries(elementCounts)) {
    // 人/神/以太不参与发展度（它们是辅助元素）
    if (el === '人' || el === '神' || el === '以太') continue;
    const degree = Math.pow(1.2, count);
    if (degree > maxDegree) maxDegree = degree;
  }
  return Math.round(maxDegree * 100) / 100;
}

/** 计算元素多样性：有多少种不同元素 */
export function calcElementDiversity(factors: FactorDef[]): number {
  const elements = new Set<string>();
  for (const f of factors) {
    if (f.element) elements.add(f.element);
    if (f.subElements) f.subElements.forEach(el => elements.add(el));
  }
  // 只计算六大基础元素（地火水风光暗）
  const basics = ['地','火','水','风','光','暗'];
  return basics.filter(el => elements.has(el)).length;
}

/** 多样性奖励：每多一种元素全属性+10% */
export function calcDiversityBonus(factors: FactorDef[]): number {
  const diversity = calcElementDiversity(factors);
  return diversity > 1 ? (diversity - 1) * 0.10 : 0;
}

/** 攻击方对防御方的元素克制倍率 (1.3/0.7) */
export function calcCounterMultiplier(attackerFactors: FactorDef[], defenderFactors: FactorDef[]): number {
  const atkElements = countElements(attackerFactors);
  const defElements = countElements(defenderFactors);

  let bestMultiplier = 1.0;

  for (const [atkEl, _atkCount] of Object.entries(atkElements)) {
    const counters = COUNTER_MAP[atkEl];
    if (!counters || counters.length === 0) continue;

    for (const counterTarget of counters) {
      if (defElements[counterTarget]) {
        // 我方克制对方 → ×1.3
        bestMultiplier = Math.max(bestMultiplier, 1.3);
      }
    }
    // 检查是否被克制 → ×0.7（但防御方多标签取最优，很难被克）
    // 对方元素克制我方 = 对方克我
    // 遍历对方每个元素，看是否克我方的元素
  }

  // 防御方取最优：只要防御方有任一标签不克制攻击方，就不算被克
  let worstMultiplier = 1.0;
  for (const [defEl, _defCount] of Object.entries(defElements)) {
    const defCounters = COUNTER_MAP[defEl];
    if (!defCounters || defCounters.length === 0) continue;
    for (const counterTarget of defCounters) {
      if (atkElements[counterTarget]) {
        // 对方克制我方 → ×0.7
        if (worstMultiplier === 1.0) worstMultiplier = 0.7;
      }
    }
  }
  // 如果攻击方有非被克元素，可以补偿
  // 简化：取 best(克制倍率) 和 worst(被克倍率) 的乘积
  const hasAdvantage = bestMultiplier > 1.0;
  const hasDisadvantage = worstMultiplier < 1.0;

  if (hasAdvantage && hasDisadvantage) return 1.0; // 互克抵消
  if (hasAdvantage) return 1.3;
  if (hasDisadvantage) return 0.7;
  return 1.0;
}

/** 根据 id 列表获取因子对象 */
export function getFactors(ids: string[]): FactorDef[] {
  return ids.map(id => ALL_FACTORS[id]).filter(Boolean);
}

/** 根据 id 获取单个因子 */
export function getFactor(id: string): FactorDef | undefined {
  return ALL_FACTORS[id];
}

/** 计算卡片的属性（所有因子属性相加） */
export function calcCardStat(factors: FactorDef[]): CardStat {
  const stat: CardStat = { atk:0, def:0, spd:0, hp:0, maxHp:0, mp:0, maxMp:0, crit:0, dodge:0 };
  for (const f of factors) {
    stat.atk   += f.stats.atk;
    stat.def   += f.stats.def;
    stat.spd   += f.stats.spd;
    stat.hp    += f.stats.hp;
    stat.mp    += f.stats.mp;
    stat.crit  += f.stats.crit;
    stat.dodge += f.stats.dodge;
  }
  // 多样性加成
  const diversityBonus = calcDiversityBonus(factors);
  if (diversityBonus > 0) {
    stat.atk = Math.round(stat.atk * (1 + diversityBonus));
    stat.def = Math.round(stat.def * (1 + diversityBonus));
    stat.spd = Math.round(stat.spd * (1 + diversityBonus));
    stat.hp = Math.round(stat.hp * (1 + diversityBonus));
  }
  // 基础保底
  stat.atk = Math.max(stat.atk, 1);
  stat.hp  = Math.max(stat.hp, 10);
  stat.mp  = Math.max(stat.mp, 5);
  stat.maxHp = stat.hp;
  stat.maxMp = stat.mp;
  stat.crit  = Math.min(stat.crit, 95);
  stat.dodge = Math.min(stat.dodge, 99);
  return stat;
}

/** 统计每个分类的因子数量 */
export function countByCategory(factors: FactorDef[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of factors) {
    const cat = f.category || f.element || 'unknown';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

/** 统计每个 tag 的因子数量 */
export function countByTag(factors: FactorDef[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of factors) {
    if (f.tag) counts[f.tag] = (counts[f.tag] || 0) + 1;
  }
  return counts;
}

/** 获取卡片的主动技能列表（因子自带 + 组合技） */
export function collectSkills(factors: FactorDef[]) {
  const own = factors.filter(f => f.skill && f.skill.type === 'active').map(f => f.skill!);
  const synergies = evaluateSynergies(factors);
  const names = new Set(own.map(s => s.name));
  for (const s of synergies) {
    if (!names.has(s.name)) { own.push(s); names.add(s.name); }
  }
  return own;
}

/** 获取卡片的被动效果列表 */
export function collectPassives(factors: FactorDef[]): string[] {
  return factors.filter(f => f.passive).map(f => f.passive!);
}

/** 计算因子的最高稀有度 */
export function highestLevel(factors: FactorDef[]): string {
  const order: Record<string, number> = { N:0, R:1, SR:2, SSR:3, UR:4 };
  let max = 'N';
  for (const f of factors) {
    if (order[f.level] > order[max]) max = f.level;
  }
  return max;
}
