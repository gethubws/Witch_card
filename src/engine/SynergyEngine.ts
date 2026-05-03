// ============================================
// 魔女卡牌 — 因子组合技引擎
// ============================================
import type { FactorDef, Skill } from '../types';
import { SYNERGY_RULES, type SynergyRule } from '../config/synergies';

/**
 * 评估因子列表中的所有组合技
 * 遍历所有因子对，检查是否触发组合技规则
 */
export function evaluateSynergies(factors: FactorDef[]): Skill[] {
  if (factors.length < 2) return [];

  const factorIds = new Set(factors.map(f => f.id));
  const skills: Skill[] = [];

  for (const rule of SYNERGY_RULES) {
    // 检查因子对是否都存在
    if (factorIds.has(rule.inputs[0]) && factorIds.has(rule.inputs[1])) {
      skills.push({ ...rule.skill });
    }
  }

  return skills;
}

/**
 * 检查两个特定因子是否触发组合技
 */
export function getSynergySkill(factorA: FactorDef, factorB: FactorDef): Skill | null {
  for (const rule of SYNERGY_RULES) {
    const [a, b] = rule.inputs;
    if ((factorA.id === a && factorB.id === b) || (factorA.id === b && factorB.id === a)) {
      return { ...rule.skill };
    }
  }
  return null;
}

/**
 * 获取某个因子参与的所有组合技
 */
export function getSynergiesForFactor(factorId: string): SynergyRule[] {
  return SYNERGY_RULES.filter(
    rule => rule.inputs[0] === factorId || rule.inputs[1] === factorId
  );
}
