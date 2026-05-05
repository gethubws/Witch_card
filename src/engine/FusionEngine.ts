// ============================================
// 魔女卡牌 — 融合引擎 v3 (九元素体系 · 6:1堆叠)
// ============================================
import type { FactorDef } from '../types';
import { ALL_FACTORS, CONFLICT_FUSIONS, RESONANCES } from '../config/factors';

export interface FusionResult {
  factors: FactorDef[];
  appliedConflicts: string[];
  appliedResonances: string[];
  title?: string;
  stackingLog?: string;
  stackingBonus?: { hp: number; atk: number; mp: number };
}

const LEVEL_ORDER = { N:0, R:1, SR:2, SSR:3, UR:4 } as const;
const LEVEL_NAMES = ['N','R','SR','SSR','UR'] as const;
type FactorLevel = keyof typeof LEVEL_ORDER;

/** 元素因子升级链 (按因子ID索引) */
const LEVEL_UP_NAMES: Record<string, Record<number, string>> = {
  '火': { 1:'烈焰', 2:'爆炎', 3:'阳炎', 4:'凤凰火' },
  '水': { 1:'激流', 2:'深渊', 3:'沧溟', 4:'归墟' },
  '冰': { 1:'极寒', 2:'玄冰', 3:'永冻', 4:'绝对零度' },
  '风': { 1:'暴风', 2:'飓风', 3:'虚空风', 4:'时空风暴' },
  '雷': { 1:'雷霆', 2:'劫雷', 3:'天罚', 4:'混沌雷' },
  '暗': { 1:'暗影', 2:'冥暗', 3:'虚无', 4:'湮灭' },
  '光': { 1:'圣光', 2:'神辉', 3:'天光', 4:'创世之光' },
  '地': { 1:'岩石', 2:'山岳', 3:'地核', 4:'星核' },
  '王之力': { 1:'王之粘液' },
  '巨龙血脉': { 1:'龙神血脉' },
};

function upgradeFactor(f: FactorDef, levelsUp: number): FactorDef {
  if (levelsUp < 1) return f;

  // 元素因子：按命名表精准查找
  if (f.element && LEVEL_UP_NAMES[f.id]) {
    const nameMap = LEVEL_UP_NAMES[f.id];
    const target = nameMap?.[levelsUp] ? ALL_FACTORS[nameMap[levelsUp]] : null;
    if (target) return target;
  }

  // 兜底：属性倍率
  const scale = Math.pow(1.4, levelsUp);
  const stats = { ...f.stats };
  for (const k of Object.keys(stats as Record<string,number>)) {
    (stats as any)[k] = Math.round((stats as any)[k] * scale);
  }
  const targetIdx = Math.min((LEVEL_ORDER[f.level as FactorLevel] ?? 0) + levelsUp, 4);
  return { ...f, level: LEVEL_NAMES[targetIdx] as FactorLevel, stats };
}

/** 六芒星炼成 */
export function hexagramFusion(inputFactors: FactorDef[]): FusionResult {
  const { factors: stacked, stackingLog, stackingBonus } = applyFactorStacking(inputFactors);
  const { factors: afterConflict, appliedConflicts } = applyConflictFusions(stacked);
  const { title, appliedResonances } = applyResonances(afterConflict);
  return { factors: afterConflict, appliedConflicts, appliedResonances, title, stackingLog, stackingBonus };
}

/** 禁断融合 */
export function forbiddenFusion(parentFactorsA: FactorDef[], parentFactorsB: FactorDef[]): FusionResult {
  const inherited: FactorDef[] = [];
  for (const f of [...parentFactorsA, ...parentFactorsB]) {
    if (Math.random() < 0.49) inherited.push(f);
  }
  const { factors: stacked, stackingLog, stackingBonus } = applyFactorStacking(inherited);
  const { factors, appliedConflicts } = applyConflictFusions(stacked);
  const { title, appliedResonances } = applyResonances(factors);
  return { factors, appliedConflicts, appliedResonances, title, stackingLog, stackingBonus };
}

/** 同因子堆叠：6×同因子 → 升阶 */
function applyFactorStacking(input: FactorDef[]): {
  factors: FactorDef[];
  stackingLog?: string;
  stackingBonus?: { hp: number; atk: number; mp: number };
} {
  const count: Record<string, number> = {};
  for (const f of input) count[f.id] = (count[f.id] || 0) + 1;

  const result: FactorDef[] = [];
  const upgrades: string[] = [];
  let totalUpgrades = 0;

  for (const f of input) {
    if (count[f.id] === 0) continue;
    const n = count[f.id];
    count[f.id] = 0;
    const ups = Math.floor(n / 6);
    const rem = n % 6;
    if (ups > 0) {
      totalUpgrades += ups;
      const upgraded = upgradeFactor(f, ups);
      result.push(upgraded);
      upgrades.push(`${f.id}×${n}→${upgraded.id}(${upgraded.level})`);
    }
    for (let i = 0; i < rem; i++) result.push(f);
  }

  const stackingBonus = totalUpgrades > 0
    ? { hp: totalUpgrades * 10, atk: totalUpgrades * 2, mp: totalUpgrades * 2 }
    : undefined;

  return { factors: result, stackingLog: upgrades.length > 0 ? `🔥 堆叠: ${upgrades.join(', ')}` : undefined, stackingBonus };
}

/** 冲突融合 */
function applyConflictFusions(factors: FactorDef[]): { factors: FactorDef[]; appliedConflicts: string[] } {
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
      consumed.add(idxA); consumed.add(idxB);
      const fusion = ALL_FACTORS[rule.output];
      if (fusion) { factors.push(fusion); appliedConflicts.push(`${idA}+${idB}→${rule.output}`); }
    }
  }
  return { factors: factors.filter((_, i) => !consumed.has(i)), appliedConflicts };
}

/** 共鸣检测 */
function applyResonances(factors: FactorDef[]): { title?: string; appliedResonances: string[] } {
  const appliedResonances: string[] = [];
  let title: string | undefined;

  for (const r of RESONANCES) {
    let count = 0;
    for (const f of factors) {
      if (r.requiredAtoms?.includes(f.id)) count++;
      else if (r.tag && f.tag === r.tag) count++;
      else if (r.category && f.category === r.category) count++;
      else if (r.element && f.element === r.element) count++;
    }
    if (count >= (r.minCount ?? 3)) {
      appliedResonances.push(r.bonus);
      if (!title) title = r.title;
    }
  }
  return { title, appliedResonances };
}

// 骰子命名器
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
