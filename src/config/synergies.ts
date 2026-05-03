// ============================================
// 魔女卡牌 — 因子组合技规则
// ============================================
import type { Skill } from '../types';

export interface SynergyRule {
  inputs: [string, string];
  skill: Skill;
}

/**
 * 11组因子组合技
 * 特定因子对出现在同一张卡/怪物上 → 自动解锁组合技能
 */
export const SYNERGY_RULES: SynergyRule[] = [
  {
    inputs: ['火', '猛攻'],
    skill: {
      name: '🔥 烈焰斩',
      type: 'active', target: 'single_enemy',
      effect: 'ATK×1.8 火属性+灼烧',
      mpCost: 15, multiplier: 1.8,
      desc: '火焰裹挟利刃，一刀两断',
    },
  },
  {
    inputs: ['水', '治愈'],
    skill: {
      name: '💧 水疗术',
      type: 'active', target: 'single_ally',
      effect: '回复25%HP+净化',
      mpCost: 12,
      desc: '水流涤荡伤口，恢复生机',
    },
  },
  {
    inputs: ['暗', '诅咒'],
    skill: {
      name: '🌑 暗影诅咒',
      type: 'active', target: 'all_enemies',
      effect: '敌方全体ATK-20% 2回合',
      mpCost: 18,
      desc: '暗影侵蚀敌方意志',
    },
  },
  {
    inputs: ['雷', '迅捷'],
    skill: {
      name: '⚡ 电光石火',
      type: 'active', target: 'single_enemy',
      effect: '先制ATK×1.4+麻痹20%',
      mpCost: 10, multiplier: 1.4,
      desc: '快如闪电的一击',
    },
  },
  {
    inputs: ['地', '守护'],
    skill: {
      name: '🛡️ 岩壁',
      type: 'active', target: 'all_allies',
      effect: '全队DEF+30% 2回合',
      mpCost: 15,
      desc: '大地之力凝聚为护盾',
    },
  },
  {
    inputs: ['风', '游击'],
    skill: {
      name: '🍃 风遁',
      type: 'active', target: 'self',
      effect: '自身DODGE+50% 1回合',
      mpCost: 8,
      desc: '疾风掩护，身形消散',
    },
  },
  {
    inputs: ['冰', '精准'],
    skill: {
      name: '❄️ 冰晶狙击',
      type: 'active', target: 'single_enemy',
      effect: 'ATK×2.0冰属性必暴击',
      mpCost: 20, multiplier: 2.0,
      desc: '冰晶弹道精准锁定要害',
    },
  },
  {
    inputs: ['光', '慈悲'],
    skill: {
      name: '✨ 圣光普照',
      type: 'active', target: 'all_allies',
      effect: '全队回复20%HP',
      mpCost: 22,
      desc: '神圣光芒治愈身心',
    },
  },
  {
    inputs: ['狂热', '猛攻'],
    skill: {
      name: '💢 狂战士',
      type: 'active', target: 'self',
      effect: 'ATK+50% DEF-30% 3回合',
      mpCost: 15,
      desc: '放弃防御，全力进攻',
    },
  },
  {
    inputs: ['冷静', '增幅'],
    skill: {
      name: '🧘 冥想',
      type: 'active', target: 'self',
      effect: 'MP回满+技能冷却-1',
      mpCost: 0,
      desc: '静心凝神，恢复法力',
    },
  },
  {
    inputs: ['粘液', '软体'],
    skill: {
      name: '🟢 弹力护盾',
      type: 'active', target: 'self',
      effect: '减伤15% 2回合',
      mpCost: 5,
      desc: '弹性粘液吸收冲击',
    },
  },
  {
    inputs: ['雷', '猛攻'],
    skill: {
      name: '⚡ 雷霆一击',
      type: 'active', target: 'single_enemy',
      effect: 'ATK×1.7雷属性+麻痹25%',
      mpCost: 12, multiplier: 1.7,
      desc: '雷光灌顶，一击粉碎',
    },
  },
  {
    inputs: ['暗', '献祭'],
    skill: {
      name: '🩸 暗影献祭',
      type: 'active', target: 'single_enemy',
      effect: '消耗10%HP，ATK×2.5暗属性',
      mpCost: 8, multiplier: 2.5,
      desc: '献祭自身鲜血，释放暗影之力',
    },
  },
  {
    inputs: ['风', '幸运'],
    skill: {
      name: '🍀 幸运之风',
      type: 'active', target: 'all_allies',
      effect: '全队CRIT+20% DODGE+15% 2回合',
      mpCost: 14,
      desc: '幸运的风拂过战场',
    },
  },
  {
    inputs: ['暗', '迅捷'],
    skill: {
      name: '🌌 暗影突袭',
      type: 'active', target: 'single_enemy',
      effect: '先制ATK×1.5暗属性',
      mpCost: 10, multiplier: 1.5,
      desc: '暗影中闪出致命一击',
    },
  },
];
