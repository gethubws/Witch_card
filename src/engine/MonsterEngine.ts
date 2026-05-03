// ============================================
// 魔女卡牌 — 怪物引擎
// 从因子池 + 精英等级 → 自动生成怪物属性和技能
// ============================================
import type { Monster, FactorDef, CardStat, Skill, BattleCard } from '../types';
import { ALL_FACTORS } from '../config/factors';
import { calcCardStat, collectSkills } from './FactorEngine';
import { evaluateSynergies } from './SynergyEngine';

export type EliteLevel = 'normal' | 'elite' | 'boss';

/** 精英等级加成 */
const ELITE_BONUS: Record<EliteLevel, { hp: number; atk: number; allMult: number }> = {
  normal: { hp: 10, atk: 2, allMult: 1.0 },
  elite:  { hp: 30, atk: 8, allMult: 1.2 },
  boss:   { hp: 100, atk: 25, allMult: 1.5 },
};

/**
 * 从怪物定义构建战斗怪物
 * 属性 = sum(factorPool stats) × 精英倍率 + 精英固定加成
 * 技能 = 稀有因子技能 ∪ 因子组合技，保证至少1个
 */
export function buildMonster(monster: Monster, eliteLevel: EliteLevel = 'normal'): BattleCard {
  // 1. 获取因子
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid];
    if (f) factors.push(f);
  }

  // 2. 基础属性 = 因子叠加
  const baseStats = factors.length > 0 ? calcCardStat(factors) : fallbackStats();

  // 3. 精英等级加成
  const bonus = ELITE_BONUS[eliteLevel];
  const eliteStats: CardStat = {
    atk:   Math.round(baseStats.atk * bonus.allMult) + bonus.atk,
    def:   Math.round(baseStats.def * bonus.allMult),
    spd:   Math.round(baseStats.spd * bonus.allMult),
    hp:    Math.round(baseStats.hp * bonus.allMult) + bonus.hp,
    maxHp: Math.round(baseStats.hp * bonus.allMult) + bonus.hp,
    mp:    Math.round(baseStats.mp * bonus.allMult),
    maxMp: Math.round(baseStats.mp * bonus.allMult),
    crit:  Math.min(Math.round(baseStats.crit * bonus.allMult), 95),
    dodge: Math.min(Math.round(baseStats.dodge * bonus.allMult), 99),
  };

  // 4. 技能：稀有因子技能 + 组合技
  const rareSkills = collectSkills(factors);
  const synergySkills = evaluateSynergies(factors);
  let skills = [...rareSkills, ...synergySkills];

  // 5. 保底：如果没有技能，给一个基础普攻
  if (skills.length === 0) {
    skills = [{
      name: '普攻',
      type: 'active',
      target: 'single_enemy',
      effect: '基础攻击',
      mpCost: 0,
      multiplier: 1.0,
      desc: '普通的一击',
    }];
  }

  return {
    card: {
      id: monster.id,
      name: monster.name,
      factors,
      imageUrl: monster.imageUrl,
      stars: 1,
      status: 'normal',
      stats: eliteStats,
      skills,
    },
    currentHp: eliteStats.maxHp,
    currentMp: eliteStats.maxMp,
    position: 'front',
    buffs: [],
  };
}

/** 获取怪物的纯因子属性（不含精英加成），用于显示/比较 */
export function getMonsterBaseStats(monster: Monster): CardStat {
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid];
    if (f) factors.push(f);
  }
  return factors.length > 0 ? calcCardStat(factors) : fallbackStats();
}

/** 获取怪物技能预览 */
export function getMonsterSkills(monster: Monster): Skill[] {
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid];
    if (f) factors.push(f);
  }
  const rareSkills = collectSkills(factors);
  const synergySkills = evaluateSynergies(factors);
  const all = [...rareSkills, ...synergySkills];
  if (all.length === 0) {
    return [{ name: '普攻', type: 'active', target: 'single_enemy', effect: '基础攻击', mpCost: 0, multiplier: 1.0, desc: '普通的一击' }];
  }
  return all;
}

function fallbackStats(): CardStat {
  return { atk: 1, def: 1, spd: 0, hp: 5, maxHp: 5, mp: 0, maxMp: 0, crit: 0, dodge: 0 };
}
