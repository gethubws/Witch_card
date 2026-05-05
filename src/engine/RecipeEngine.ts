// ============================================
// 魔女卡牌 — 配方引擎 v1
// 2-4个不同因子 → 产物, 支持链式递归
// ============================================
import type { FactorDef } from '../types';
import { ALL_FACTORS } from '../config/factors';

export interface Recipe {
  inputs: string[];   // 因子ID集合 (无序, 2-4个)
  output: string;     // 产物因子ID
}

export interface RecipeResult {
  output: FactorDef;
  consumed: number[];   // 被消耗的因子在原始数组中的索引
  recipeId: number;     // 匹配到的配方索引
}

// ══════════════════════════════════════
// 配方表
// ══════════════════════════════════════
export const RECIPES: Recipe[] = [
  // —— 元素R (2N) ——
  { inputs: ['火','猛攻'], output:'烈焰' },
  { inputs: ['水','治愈'], output:'激流' },
  { inputs: ['地','守护'], output:'岩石' },
  { inputs: ['风','游击'], output:'暴风' },
  { inputs: ['光','治愈'], output:'圣光' },
  { inputs: ['暗','诅咒'], output:'暗影' },
  { inputs: ['冰','水'], output:'极寒' },
  { inputs: ['雷','风'], output:'雷霆' },

  // —— 元素SR (R+2N 或 3N) ——
  { inputs: ['烈焰','尘'], output:'爆炎' },
  { inputs: ['火','猛攻','尘'], output:'爆炎' },
  { inputs: ['激流','雾'], output:'深渊' },
  { inputs: ['水','治愈','雾'], output:'深渊' },
  { inputs: ['岩石','晶'], output:'山岳' },
  { inputs: ['地','守护','晶'], output:'山岳' },
  { inputs: ['暴风','尘'], output:'飓风' },
  { inputs: ['风','游击','尘'], output:'飓风' },
  { inputs: ['圣光','晶'], output:'神辉' },
  { inputs: ['光','治愈','晶'], output:'神辉' },
  { inputs: ['暗影','雾'], output:'冥暗' },
  { inputs: ['暗','诅咒','雾'], output:'冥暗' },
  { inputs: ['极寒','壁'], output:'玄冰' },
  { inputs: ['冰','水','壁'], output:'玄冰' },
  { inputs: ['雷霆','刃'], output:'劫雷' },
  { inputs: ['雷','风','刃'], output:'劫雷' },

  // —— 元素SSR (SR+R 或 SR+2N) ——
  { inputs: ['爆炎','光'], output:'阳炎' },
  { inputs: ['爆炎','圣光'], output:'阳炎' },
  { inputs: ['深渊','暗'], output:'沧溟' },
  { inputs: ['深渊','暗影'], output:'沧溟' },
  { inputs: ['山岳','壁'], output:'地核' },
  { inputs: ['山岳','岩石'], output:'地核' },
  { inputs: ['飓风','雷'], output:'虚空风' },
  { inputs: ['飓风','雷霆'], output:'虚空风' },
  { inputs: ['神辉','光'], output:'天光' },
  { inputs: ['神辉','圣光'], output:'天光' },
  { inputs: ['冥暗','暗'], output:'虚无' },
  { inputs: ['冥暗','暗影'], output:'虚无' },
  { inputs: ['玄冰','水'], output:'永冻' },
  { inputs: ['玄冰','极寒'], output:'永冻' },
  { inputs: ['劫雷','雷'], output:'天罚' },
  { inputs: ['劫雷','雷霆'], output:'天罚' },

  // —— 冲突融合 (跨元素) ——
  { inputs: ['火','水'], output:'蒸汽' },
  { inputs: ['火','冰'], output:'融毁' },
  { inputs: ['雷','水'], output:'雷暴' },
  { inputs: ['地','风'], output:'沙暴' },
  { inputs: ['火','地'], output:'熔岩' },
  { inputs: ['冰','水'], output:'霜冻' },
  { inputs: ['火','暗'], output:'黑焰' },
  { inputs: ['火','风'], output:'焰岚' },
  { inputs: ['烈焰','风'], output:'焰岚' },
  { inputs: ['地','水'], output:'藤蔓' },
  { inputs: ['水','光'], output:'珊瑚' },
  { inputs: ['暗','光'], output:'月蚀' },
  { inputs: ['风','光'], output:'雷鸣' },
  { inputs: ['膨胀','风'], output:'气球' },
  { inputs: ['膨胀','毒'], output:'毒云' },
  { inputs: ['火','风','光'], output:'极光' },
  { inputs: ['烈焰','猛攻'], output:'狱火' },
  { inputs: ['烈焰','圣光'], output:'焰岚' },

  // —— 非元素链 (人/神/暗扩展) ——
  { inputs: ['猛攻','守护'], output:'反击' },
  { inputs: ['守护','壁'], output:'坚韧' },
  { inputs: ['刃','风'], output:'迅捷' },
  { inputs: ['雾','暗'], output:'幻觉' },
  { inputs: ['风','光'], output:'瞬移' },
  { inputs: ['猛攻','反击'], output:'咆哮' },
  { inputs: ['治愈','壁'], output:'结界' },
  { inputs: ['暗','血'], output:'毒' },
  { inputs: ['毒','光'], output:'诅咒之血' },
  { inputs: ['毒','暗'], output:'深渊之印' },
  { inputs: ['治愈','光'], output:'增幅' },
  { inputs: ['分身','暗'], output:'月蚀' },
  { inputs: ['毒','治愈'], output:'血清' },

  // —— 龙链 ——
  { inputs: ['龙息','龙鳞'], output:'巨龙血脉' },
  { inputs: ['巨龙血脉','龙威'], output:'龙神血脉' },

  // —— 地系扩展 ——
  { inputs: ['地','刃'], output:'分裂' },
  { inputs: ['地','壁'], output:'尖刺' },
  { inputs: ['地','风'], output:'尘' },
  { inputs: ['水','壁'], output:'冰' },
  { inputs: ['火','风'], output:'雷' },
];

/**
 * 在因子列表中查找匹配的配方
 * 返回 { 消耗的索引列表, 产物, 配方索引 }
 */
export function findRecipe(factors: FactorDef[]): RecipeResult | null {
  const ids = factors.map(f => f.id);
  let best: RecipeResult | null = null;

  for (let ri = 0; ri < RECIPES.length; ri++) {
    const recipe = RECIPES[ri];
    // 检查所有 recipe.inputs 是否都在 ids 中 (每个因子只能被消耗一次)
    const available = [...ids];
    const consumed: number[] = [];
    let matched = true;

    for (const need of recipe.inputs) {
      const idx = available.indexOf(need);
      if (idx === -1) { matched = false; break; }
      consumed.push(idx);
      available[idx] = '__used__';  // 标记已用
    }

    if (matched) {
      const output = ALL_FACTORS[recipe.output];
      if (!output) continue;
      // 偏好: 稀有度更高的产物 > 消耗更多因子的配方
      const levelScore = { N:0, R:1, SR:2, SSR:3, UR:4 }[output.level] ?? 0;
      const bestScore = best ? { N:0, R:1, SR:2, SSR:3, UR:4 }[best.output.level] ?? 0 : -1;
      if (levelScore > bestScore || (levelScore === bestScore && consumed.length > (best?.consumed.length ?? 0))) {
        best = { output, consumed: consumed.map(i => factors.findIndex((_, fi) => 
          factors[fi].id === ids[i] && !consumed.filter((_, ci) => ci !== consumed.indexOf(i)).includes(fi))
        ), recipeId: ri };
      }
    }
  }

  // Fix consumed indices: find actual positions in original array
  if (best) {
    const used = new Array(factors.length).fill(false);
    const actualConsumed: number[] = [];
    const needed = RECIPES[best.recipeId].inputs;
    for (const need of needed) {
      for (let i = 0; i < factors.length; i++) {
        if (!used[i] && factors[i].id === need) {
          used[i] = true;
          actualConsumed.push(i);
          break;
        }
      }
    }
    best.consumed = actualConsumed;
  }

  return best;
}

/**
 * 递归求解配方链, 返回最终因子列表和日志
 */
export function solveRecipeChain(inputFactors: FactorDef[]): {
  result: FactorDef[];
  steps: string[];
} {
  let factors = [...inputFactors];
  const steps: string[] = [];

  for (let iter = 0; iter < 5; iter++) {  // 最多5轮链式
    if (factors.length < 2) break;
    const recipe = findRecipe(factors);
    if (!recipe) break;

    // 消耗输入因子, 加入产物
    const newFactors = factors.filter((_, i) => !recipe.consumed.includes(i));
    newFactors.push(recipe.output);
    
    const consumedNames = recipe.consumed.map(i => factors[i].id).join('+');
    steps.push(`${consumedNames} → ${recipe.output.id}(${recipe.output.level})`);
    factors = newFactors;
  }

  return { result: factors, steps };
}
