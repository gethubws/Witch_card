// ============================================
// 魔女卡牌 — 战斗引擎 v3 (九元素+发展度+互克)
// ============================================
import type { Card, Monster, BattleCard, BattleLogEntry, Skill, TeamPosition, Buff } from '../types';
import { calcCardStat, calcDevelopmentDegree, calcCounterMultiplier } from './FactorEngine';
import { buildMonster } from './MonsterEngine';

let uidCounter = 0;
function newUid() { return `bc_${++uidCounter}`; }

/** 创建战斗用卡片（玩家） */
export function createBattleCard(card: Card, position: TeamPosition): BattleCard {
  if (!card.stats) card.stats = calcCardStat(card.factors);
  card.skills = card.skills ?? [];
  return { card, currentHp: card.stats.maxHp, currentMp: card.stats.maxMp, position, buffs: [], uid: newUid() };
}

/** 创建战斗用怪物 */
export function createBattleMonster(monster: Monster): BattleCard {
  const bc = buildMonster(monster, monster.eliteLevel);
  bc.uid = newUid();
  return bc;
}

export function getBuffDef(buffs: Buff[]): number {
  return buffs.filter(b => b.turnsLeft > 0).reduce((sum, b) => sum + (b.defMod || 0), 0);
}
export function getBuffAtk(buffs: Buff[]): number {
  return buffs.filter(b => b.turnsLeft > 0).reduce((sum, b) => sum + (b.atkMod || 0), 0);
}
export function tickBuffs(buffs: Buff[]): Buff[] {
  return buffs.map(b => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter(b => b.turnsLeft > 0);
}

/** 计算对特定目标的伤害倍率（发展度×克制） */
export function getDamageMultiplier(attackerFactors: any[], defenderFactors: any[]): number {
  const devDegree = calcDevelopmentDegree(attackerFactors);
  const counter = calcCounterMultiplier(attackerFactors, defenderFactors);
  return devDegree * counter;
}

/** 伤害公式（减法 DEF×0.5 + 发展度×克制） */
export function calcDamage(
  atk: number, def: number, multiplier: number,
  critRate: number, isCrit: boolean = false,
  devDegree: number = 1,
  counterMult: number = 1,
): { damage: number; crit: boolean } {
  const base = Math.max(1, atk * multiplier - def);
  const variance = 0.9 + Math.random() * 0.2;
  let damage = Math.round(base * variance * devDegree * counterMult);

  const crit = isCrit || Math.random() * 100 < critRate;
  if (crit) damage = Math.round(damage * 1.5);

  return { damage, crit };
}

export interface SkillResult {
  log: BattleLogEntry;
  targetNewHp: number;
  targetNewMp: number;
  killed: boolean;
  attackerNewMp: number;
  crit: boolean;
  damage: number;
}

/** 普通攻击 */
export function executeBasicAttack(attacker: BattleCard, defender: BattleCard, turn: number): SkillResult {
  const stat = attacker.card.stats || fallbackStat();
  const defStat = (defender.card.stats?.def || 0) + getBuffDef(defender.buffs);
  const devDegree = calcDevelopmentDegree(attacker.card.factors);
  const counter = calcCounterMultiplier(attacker.card.factors, defender.card.factors);
  const { damage, crit } = calcDamage(stat.atk, defStat, 1.0, stat.crit, false, devDegree, counter);
  const newHp = Math.max(0, defender.currentHp - damage);
  return {
    log: { turn, actor: attacker.card.name, action: '普通攻击', target: defender.card.name,
      result: crit ? `暴击! -${damage}` : `-${damage}`, damage },
    targetNewHp: newHp, targetNewMp: defender.currentMp, killed: newHp <= 0,
    attackerNewMp: attacker.currentMp, crit, damage,
  };
}

/** 执行技能 */
export function executeSkill(attacker: BattleCard, defender: BattleCard, skill: Skill, turn: number): SkillResult {
  const stat = attacker.card.stats || fallbackStat();
  const mpCost = skill.mpCost || 0;

  if (skill.type === 'active' || skill.type === 'aura') {
    const mult = skill.multiplier || 1.0;
    const defStat = (defender.card.stats?.def || 0) + getBuffDef(defender.buffs);
    const devDegree = calcDevelopmentDegree(attacker.card.factors);
    const counter = calcCounterMultiplier(attacker.card.factors, defender.card.factors);
    const { damage, crit } = calcDamage(stat.atk, defStat, mult, stat.crit, false, devDegree, counter);
    const newHp = Math.max(0, defender.currentHp - damage);
    return {
      log: { turn, actor: attacker.card.name, action: skill.name, target: defender.card.name,
        result: crit ? `暴击! -${damage}` : `-${damage}`, damage },
      targetNewHp: newHp, targetNewMp: defender.currentMp, killed: newHp <= 0,
      attackerNewMp: Math.max(0, attacker.currentMp - mpCost), crit, damage,
    };
  }

  // 治疗类
  const heal = Math.round(stat.atk * (skill.multiplier || 1.0));
  const newHp = Math.min((defender.card.stats?.maxHp || 100), defender.currentHp + heal);
  return {
    log: { turn, actor: attacker.card.name, action: skill.name, target: defender.card.name, result: `+${heal} HP` },
    targetNewHp: newHp, targetNewMp: defender.currentMp, killed: false,
    attackerNewMp: Math.max(0, attacker.currentMp - mpCost), crit: false, damage: 0,
  };
}

/** 怪物AI选目标 — 前排60% 后排各20% */
export function monsterSelectTarget(monster: BattleCard, targets: BattleCard[]): BattleCard | null {
  const alive = targets.filter(t => t.currentHp > 0);
  if (alive.length === 0) return null;
  const front = alive.filter(t => t.position === 'front');
  const supports = alive.filter(t => t.position !== 'front');
  const roll = Math.random();
  if (front.length > 0 && roll < 0.6) return front[Math.floor(Math.random() * front.length)];
  if (supports.length > 0) return supports[Math.floor(Math.random() * supports.length)];
  return alive[Math.floor(Math.random() * alive.length)];
}

/** 怪物AI：优先技能，否则普攻 */
export function monsterAI(monster: BattleCard, targets: BattleCard[]): { skill?: Skill; target: BattleCard; isBasic: boolean } | null {
  const target = monsterSelectTarget(monster, targets);
  if (!target) return null;
  const skills = monster.card.skills || [];
  if (skills.length > 0 && monster.currentMp >= (skills[0].mpCost || 0)) {
    const usable = skills.filter(s => (s.mpCost || 0) <= monster.currentMp);
    if (usable.length > 0) return { skill: usable[Math.floor(Math.random() * usable.length)], target, isBasic: false };
  }
  return { target, isBasic: true };
}

export function nextAliveIndex(team: BattleCard[], current: number): number {
  const n = team.length;
  for (let i = 1; i <= n; i++) {
    const idx = (current + i) % n;
    if (team[idx].currentHp > 0) return idx;
  }
  return -1;
}

function fallbackStat() {
  return { atk: 1, def: 1, spd: 0, hp: 10, maxHp: 10, mp: 0, maxMp: 0, crit: 0, dodge: 0 };
}
