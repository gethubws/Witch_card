// ============================================
// 魔女卡牌 — 怪物引擎 v3 (HP×2/×3/×8)
// ============================================
import type { Monster, FactorDef, CardStat, Skill, BattleCard } from '../types';
import { ALL_FACTORS } from '../config/factors';
import { calcCardStat, collectSkills } from './FactorEngine';
import { evaluateSynergies } from './SynergyEngine';

export type EliteLevel = 'normal' | 'elite' | 'boss';

/** 精英等级加成 — N×2, R×3, SSR×8 */
const ELITE_BONUS: Record<EliteLevel, { hpMult: number; atkMult: number; hpFlat: number; atkFlat: number }> = {
  normal: { hpMult: 2,  atkMult: 1.0, hpFlat: 0,  atkFlat: 0 },
  elite:  { hpMult: 3,  atkMult: 1.5, hpFlat: 10, atkFlat: 5 },
  boss:   { hpMult: 8,  atkMult: 2.0, hpFlat: 50, atkFlat: 15 },
};

export function buildMonster(monster: Monster, eliteLevel: EliteLevel = 'normal'): BattleCard {
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid];
    if (f) factors.push(f);
  }

  const baseStats = factors.length > 0 ? calcCardStat(factors) : fallbackStats();
  const bonus = ELITE_BONUS[eliteLevel];

  const eliteStats: CardStat = {
    atk:   Math.round(baseStats.atk * bonus.atkMult) + bonus.atkFlat,
    def:   baseStats.def,
    spd:   baseStats.spd,
    hp:    Math.round(baseStats.hp * bonus.hpMult) + bonus.hpFlat,
    maxHp: Math.round(baseStats.hp * bonus.hpMult) + bonus.hpFlat,
    mp:    baseStats.mp,
    maxMp: baseStats.mp,
    crit:  Math.min(baseStats.crit, 95),
    dodge: Math.min(baseStats.dodge, 99),
  };

  // 技能
  const rareSkills = collectSkills(factors);
  const synergySkills = evaluateSynergies(factors);
  let skills = [...rareSkills, ...synergySkills];
  if (skills.length === 0) {
    skills = [{ name:'普攻', type:'active', target:'single_enemy', effect:'基础攻击', mpCost:0, multiplier:1.0, desc:'普通的一击' }];
  }

  return {
    card: { id:monster.id, name:monster.name, factors, imageUrl:monster.imageUrl, stars:1, status:'normal', stats:eliteStats, skills },
    currentHp: eliteStats.maxHp, currentMp: eliteStats.maxMp, position:'front', buffs:[], uid: monster.id,
  };
}

export function getMonsterBaseStats(monster: Monster): CardStat {
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid]; if (f) factors.push(f);
  }
  return factors.length > 0 ? calcCardStat(factors) : fallbackStats();
}

export function getMonsterSkills(monster: Monster): Skill[] {
  const factors: FactorDef[] = [];
  for (const fid of monster.factorPool) {
    const f = ALL_FACTORS[fid]; if (f) factors.push(f);
  }
  const all = [...collectSkills(factors), ...evaluateSynergies(factors)];
  if (all.length === 0) return [{ name:'普攻', type:'active', target:'single_enemy', effect:'基础攻击', mpCost:0, multiplier:1.0, desc:'普通的一击' }];
  return all;
}

function fallbackStats(): CardStat {
  return { atk:1, def:1, spd:0, hp:5, maxHp:5, mp:0, maxMp:0, crit:0, dodge:0 };
}
