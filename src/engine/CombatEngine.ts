// ============================================
// 魔女卡牌 — 战斗引擎
// ============================================
import type { Card, Monster, BattleCard, BattleLogEntry, Skill } from '../types';
import { calcCardStat } from './FactorEngine';
import { buildMonster } from './MonsterEngine';

/** 创建战斗用卡片 */
export function createBattleCard(card: Card, position: 'front'|'supportA'|'supportB'): BattleCard {
  // 写回 card.stats，确保后续代码能读到属性
  if (!card.stats) card.stats = calcCardStat(card.factors);
  card.skills = card.skills ?? [];
  return {
    card,
    currentHp: card.stats.maxHp,
    currentMp: card.stats.maxMp,
    position,
    buffs: [],
  };
}

/** 创建战斗用怪物（委托给 MonsterEngine） */
export function createBattleMonster(monster: Monster): BattleCard {
  return buildMonster(monster, monster.eliteLevel);
}

/** 计算伤害 */
export function calcDamage(
  atk: number, def: number, multiplier: number,
  critRate: number, isCrit: boolean = false,
): { damage: number; crit: boolean } {
  const base = Math.max(1, atk * multiplier - def * 0.5);
  const variance = 0.9 + Math.random() * 0.2;
  let damage = Math.round(base * variance);

  const crit = isCrit || Math.random() * 100 < critRate;
  if (crit) damage = Math.round(damage * 1.5);

  return { damage, crit };
}

/** 普通攻击（无技能消耗，ATK×1.0） */
export function executeBasicAttack(
  attacker: BattleCard,
  defender: BattleCard,
  turn: number,
): SkillResult {
  const stat = attacker.card.stats || { atk:0, def:0, spd:0, hp:0, maxHp:0, mp:0, maxMp:0, crit:0, dodge:0 };
  const { damage, crit } = calcDamage(stat.atk, defender.card.stats?.def || 0, 1.0, stat.crit);
  const newHp = Math.max(0, defender.currentHp - damage);
  return {
    log: { turn, actor: attacker.card.name, action: '普通攻击', target: defender.card.name,
      result: crit ? `暴击! -${damage}` : `-${damage}`, damage },
    targetNewHp: newHp, targetNewMp: defender.currentMp, killed: newHp <= 0,
  };
}

/** 执行单个技能 */
export interface SkillResult {
  log: BattleLogEntry;
  targetNewHp: number;
  targetNewMp: number;
  killed: boolean;
}

export function executeSkill(
  attacker: BattleCard,
  defender: BattleCard,
  skill: Skill,
  turn: number,
): SkillResult {
  const stat = attacker.card.stats || { atk:0, def:0, spd:0, hp:0, maxHp:0, mp:0, maxMp:0, crit:0, dodge:0 };
  
  if (skill.type === 'active' || skill.type === 'aura') {
    const mult = skill.multiplier || 1.0;
    const { damage, crit } = calcDamage(stat.atk, defender.card.stats?.def || 0, mult, stat.crit);
    
    const newHp = Math.max(0, defender.currentHp - damage);
    
    return {
      log: {
        turn,
        actor: attacker.card.name,
        action: skill.name,
        target: defender.card.name,
        result: crit ? `暴击! -${damage}` : `-${damage}`,
        damage,
      },
      targetNewHp: newHp,
      targetNewMp: defender.currentMp,
      killed: newHp <= 0,
    };
  }
  
  // 治疗类
  const heal = Math.round(stat.atk * (skill.multiplier || 1.0));
  const newHp = Math.min((defender.card.stats?.maxHp || 100), defender.currentHp + heal);
  
  return {
    log: {
      turn, actor: attacker.card.name,
      action: skill.name, target: defender.card.name,
      result: `+${heal} HP`,
    },
    targetNewHp: newHp,
    targetNewMp: defender.currentMp,
    killed: false,
  };
}

/** 怪物 AI：优先技能，否则普通攻击 */
export function monsterAI(monster: BattleCard, targets: BattleCard[]): { skill?: Skill; target: BattleCard; isBasic: boolean } | null {
  const alive = targets.filter(t => t.currentHp > 0);
  if (alive.length === 0) return null;
  const target = alive[Math.floor(Math.random() * alive.length)];
  
  const skills = monster.card.skills || [];
  if (skills.length > 0 && monster.currentMp >= (skills[0].mpCost || 0)) {
    const usable = skills.filter(s => (s.mpCost || 0) <= monster.currentMp);
    if (usable.length > 0) {
      return { skill: usable[Math.floor(Math.random() * usable.length)], target, isBasic: false };
    }
  }
  return { target, isBasic: true };
}
