// ============================================
// 魔女卡牌 — 因子引擎
// ============================================
import type { FactorDef, CardStat, FactorCategory } from '../types';
import { ALL_FACTORS } from '../config/factors';
import { evaluateSynergies } from './SynergyEngine';

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
  // 基础保底：每张卡至少有 1 ATK / 10 HP / 5 MP
  stat.atk = Math.max(stat.atk, 1);
  stat.hp  = Math.max(stat.hp, 10);
  stat.mp  = Math.max(stat.mp, 5);
  stat.maxHp = stat.hp;
  stat.maxMp = stat.mp;
  // clamp
  stat.crit  = Math.min(stat.crit, 95);
  stat.dodge = Math.min(stat.dodge, 99);
  return stat;
}

/** 统计每个分类的因子数量 */
export function countByCategory(factors: FactorDef[]): Record<FactorCategory, number> {
  const counts: Record<FactorCategory, number> = { element:0, combat:0, trait:0, magic:0, soul:0, fate:0 };
  for (const f of factors) counts[f.category]++;
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
  // 去重（组合技可能与因子自带重名）
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
