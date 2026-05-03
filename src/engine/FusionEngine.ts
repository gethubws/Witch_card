// ============================================
// 魔女卡牌 — 融合引擎 (v2 — 6:1堆叠)
// ============================================
import type { FactorDef } from '../types';
import { ALL_FACTORS, CONFLICT_FUSIONS, RESONANCES } from '../config/factors';

export interface FusionResult {
  factors: FactorDef[];
  appliedConflicts: string[];
  appliedResonances: string[];
  title?: string;
  stackingLog?: string;
  stackingBonus?: { hp: number; atk: number; mp: number };  // 6合1融合奖励属性
}

// 等级权重
const LEVEL_ORDER = { N:0, R:1, SR:2, SSR:3, UR:4 } as const;
const LEVEL_NAMES = ['N','R','SR','SSR','UR'] as const;
type FactorLevel = keyof typeof LEVEL_ORDER;

/**
 * 堆叠规则：6×同因子 → 升阶一档
 * 先在 ALL_FACTORS 中查找精确定义的升级因子（如 火_R），
 * 找不到则用属性倍率兜底
 */
// N → R → SR → SSR → UR 名称映射（元素系精确定义，其余后缀兜底）
const LEVEL_UP_NAMES: Record<string, Record<number, string>> = {
  '火': { 1:'烈焰', 2:'狱火', 3:'阳炎', 4:'凤凰火' },
  '水': { 1:'激流', 2:'深渊', 3:'沧溟', 4:'归墟' },
  '风': { 1:'暴风', 2:'飓风', 3:'虚空风', 4:'时空风暴' },
  '雷': { 1:'雷霆', 2:'劫雷', 3:'天罚', 4:'混沌雷' },
  '冰': { 1:'极寒', 2:'玄冰', 3:'永冻', 4:'绝对零度' },
  '暗': { 1:'暗影', 2:'冥暗', 3:'虚无', 4:'湮灭' },
  '光': { 1:'圣光', 2:'神辉', 3:'天光', 4:'创世之光' },
  '地': { 1:'岩石', 2:'山岳', 3:'地核', 4:'星核' },
};

function upgradeFactor(f: FactorDef, levelsUp: number): FactorDef {
  // 元素系：按命名表精准查找
  if (f.category === 'element') {
    const nameMap = LEVEL_UP_NAMES[f.id];
    if (nameMap && nameMap[levelsUp]) {
      const target = ALL_FACTORS[nameMap[levelsUp]];
      if (target) return target;
    }
  }

  // 非元素系兜底：用 _R 后缀
  const baseId = f.id.replace(/_(R|SR|SSR|UR)$/, '');
  const currentLevelIdx = LEVEL_ORDER[f.level as FactorLevel] ?? 0;
  const targetIdx = Math.min(currentLevelIdx + levelsUp, 4);
  const targetId = targetIdx >= 1 ? baseId + '_' + LEVEL_NAMES[targetIdx] : baseId;

  if (ALL_FACTORS[targetId]) return ALL_FACTORS[targetId];

  // 最终兜底：属性倍率
  if (levelsUp < 1) return f;
  const scale = Math.pow(1.4, levelsUp);
  const stats = { ...f.stats };
  for (const k of Object.keys(stats as Record<string,number>)) {
    (stats as any)[k] = Math.round((stats as any)[k] * scale);
  }
  return { ...f, id: targetId, level: LEVEL_NAMES[targetIdx] as FactorLevel, stats };
}

/**
 * 六芒星炼成：6张单因子卡 → 堆叠 → 冲突融合 → 共鸣
 */
export function hexagramFusion(inputFactors: FactorDef[]): FusionResult {
  const { factors: stacked, stackingLog, stackingBonus } = applyFactorStacking(inputFactors);
  const { factors: afterConflict, appliedConflicts } = applyConflictFusions(stacked);
  const { title, appliedResonances } = applyResonances(afterConflict);
  return { factors: afterConflict, appliedConflicts, appliedResonances, title, stackingLog, stackingBonus };
}

/**
 * 禁断融合：2张任意卡 → 49%继承 → 堆叠 → 冲突 → 共鸣
 */
export function forbiddenFusion(
  parentFactorsA: FactorDef[],
  parentFactorsB: FactorDef[],
): FusionResult {
  const inherited: FactorDef[] = [];
  for (const f of [...parentFactorsA, ...parentFactorsB]) {
    if (Math.random() < 0.49) inherited.push(f);
  }
  const { factors: stacked, stackingLog, stackingBonus } = applyFactorStacking(inherited);
  const { factors, appliedConflicts } = applyConflictFusions(stacked);
  const { title, appliedResonances } = applyResonances(factors);
  return { factors, appliedConflicts, appliedResonances, title, stackingLog, stackingBonus };
}

/**
 * 同因子堆叠：6×同因子 → 升阶一档
 * N→R: 6张, R→SR: 6张, SR→SSR: 6张, SSR→UR: 6张
 * 不足 6 张不升阶
 */
function applyFactorStacking(
  input: FactorDef[],
): { factors: FactorDef[]; stackingLog?: string; stackingBonus?: { hp: number; atk: number; mp: number } } {
  const count: Record<string, number> = {};
  for (const f of input) count[f.id] = (count[f.id] || 0) + 1;

  const result: FactorDef[] = [];
  const upgrades: string[] = [];
  let totalUpgrades = 0;

  for (const f of input) {
    if (count[f.id] === 0) continue;
    const n = count[f.id];
    count[f.id] = 0;

    const upgradesCount = Math.floor(n / 6);
    const remainder = n % 6;

    if (upgradesCount > 0) {
      totalUpgrades += upgradesCount;
      const upgraded = upgradeFactor(f, upgradesCount);
      result.push(upgraded);
      upgrades.push(`${f.id}×${n}→${upgraded.id}(${upgraded.level})`);
    }
    for (let i = 0; i < remainder; i++) {
      result.push(f);
    }
  }

  // 融合奖励：每发生一次6合1升阶，送基础属性
  const stackingBonus = totalUpgrades > 0
    ? { hp: totalUpgrades * 10, atk: totalUpgrades * 2, mp: totalUpgrades * 2 }
    : undefined;

  return {
    factors: result,
    stackingLog: upgrades.length > 0 ? `🔥 堆叠: ${upgrades.join(', ')}` : undefined,
    stackingBonus,
  };
}

/**
 * 检测并应用冲突融合
 */
function applyConflictFusions(
  factors: FactorDef[],
): { factors: FactorDef[]; appliedConflicts: string[] } {
  const appliedConflicts: string[] = [];
  const consumed = new Set<number>();

  for (const rule of CONFLICT_FUSIONS) {
    const [idA, idB] = rule.inputs;
    let idxA = -1, idxB = -1;
    for (let i = 0; i < factors.length; i++) {
      if (consumed.has(i)) continue;
      if (idxA === -1 && factors[i].id === idA) idxA = i;
      else if (idxB === -1 && factors[i].id === idB) idxB = i;
    }
    if (idxA !== -1 && idxB !== -1) {
      consumed.add(idxA);
      consumed.add(idxB);
      const fusionFactor = ALL_FACTORS[rule.output];
      if (fusionFactor) {
        factors.push(fusionFactor);
        appliedConflicts.push(`${idA}+${idB}→${rule.output}`);
      }
    }
  }
  return { factors: factors.filter((_, i) => !consumed.has(i)), appliedConflicts };
}

/**
 * 检测共鸣
 */
function applyResonances(
  factors: FactorDef[],
): { title?: string; appliedResonances: string[] } {
  const appliedResonances: string[] = [];
  let title: string | undefined;

  for (const r of RESONANCES) {
    let count = 0;
    for (const f of factors) {
      if (r.requiredAtoms) {
        // 要求特定因子 id
        if (r.requiredAtoms.includes(f.id)) count++;
      } else if (r.tag) {
        // 按 tag 统计
        if (f.tag === r.tag) count++;
      } else if (r.category) {
        // 按类别统计
        if (f.category === r.category) count++;
      }
    }
    const threshold = r.minCount ?? 3;
    if (count >= threshold) {
      appliedResonances.push(r.bonus);
      if (!title) title = r.title;
    }
  }
  return { title, appliedResonances };
}

// ============================================
// 骰子命名器
// ============================================
const STYLE_PREFIX = ['烈焰','冰霜','暗影','光辉','风暴','深渊','星辰','月光','雷鸣','森林','钢铁','幻梦'];
const SUFFIX = ['使者','契约','之心','化身','魔女','符文','誓约','印记','低语','祝福','诅咒','守护'];

export function generateName(factors: FactorDef[]): string {
  const sorted = [...factors].sort((a, b) =>
    (LEVEL_ORDER[b.level as FactorLevel] ?? 0) - (LEVEL_ORDER[a.level as FactorLevel] ?? 0)
  );
  const prefix = STYLE_PREFIX[Math.floor(Math.random() * STYLE_PREFIX.length)];
  const core = sorted[0]?.id || '虚空';
  const suffix = SUFFIX[Math.floor(Math.random() * SUFFIX.length)];
  return `${prefix}${core}${suffix}`;
}
