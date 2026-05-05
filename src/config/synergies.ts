// ============================================
// 魔女卡牌 — 因子组合技规则 v2
// ============================================
import type { Skill } from '../types';

export interface SynergyRule {
  inputs: [string, string];
  skill: Skill;
}

export const SYNERGY_RULES: SynergyRule[] = [
  {
    inputs: ['火', '猛攻'],
    skill: { name:'🔥 烈焰斩', type:'active', target:'single_enemy', effect:'ATK×1.8+灼烧', mpCost:15, multiplier:1.8, desc:'火焰裹挟利刃，一刀两断' },
  },
  {
    inputs: ['水', '治愈'],
    skill: { name:'💧 水疗术', type:'active', target:'single_ally', effect:'回复25%HP+净化', mpCost:12, desc:'水流涤荡伤口，恢复生机' },
  },
  {
    inputs: ['暗', '诅咒'],
    skill: { name:'🌑 暗影诅咒', type:'active', target:'all_enemies', effect:'敌方全体ATK-20% 2回合', mpCost:18, desc:'暗影侵蚀敌方意志' },
  },
  {
    inputs: ['雷', '迅捷'],
    skill: { name:'⚡ 电光石火', type:'active', target:'single_enemy', effect:'先制ATK×1.4+麻痹20%', mpCost:10, multiplier:1.4, desc:'快如闪电的一击' },
  },
  {
    inputs: ['地', '守护'],
    skill: { name:'🛡️ 岩壁', type:'active', target:'all_allies', effect:'全队DEF+30% 2回合', mpCost:15, desc:'大地之力凝聚为护盾' },
  },
  {
    inputs: ['风', '游击'],
    skill: { name:'🍃 风遁', type:'active', target:'self', effect:'自身DODGE+50% 1回合', mpCost:8, desc:'疾风掩护，身形消散' },
  },
  {
    inputs: ['冰', '精准'],
    skill: { name:'❄️ 冰晶狙击', type:'active', target:'single_enemy', effect:'ATK×2.0必暴击', mpCost:20, multiplier:2.0, desc:'冰晶弹道精准锁定要害' },
  },
  {
    inputs: ['雷', '猛攻'],
    skill: { name:'⚡ 雷霆一击', type:'active', target:'single_enemy', effect:'ATK×1.7+麻痹25%', mpCost:12, multiplier:1.7, desc:'雷光灌顶，一击粉碎' },
  },
  {
    inputs: ['暗', '迅捷'],
    skill: { name:'🌌 暗影突袭', type:'active', target:'single_enemy', effect:'先制ATK×1.5暗属性', mpCost:10, multiplier:1.5, desc:'暗影中闪出致命一击' },
  },
  // ——— v2 新增 5 组 ———
  {
    inputs: ['火', '风'],
    skill: { name:'🔥 火借风势', type:'active', target:'all_enemies', effect:'ATK×1.6全体+灼烧', mpCost:18, multiplier:1.6, desc:'火焰借风势席卷全场' },
  },
  {
    inputs: ['地', '水'],
    skill: { name:'🌱 泥沼', type:'active', target:'all_enemies', effect:'敌方全体SPD-20% 2回合', mpCost:14, desc:'大地化为泥沼束缚敌人' },
  },
  {
    inputs: ['暗', '毒'],
    skill: { name:'☠️ 剧毒暗影', type:'active', target:'single_enemy', effect:'ATK×1.5+中毒(-5%HP×3回合)', mpCost:16, multiplier:1.5, desc:'暗影包裹毒素侵蚀生命' },
  },
  {
    inputs: ['光', '暗'],
    skill: { name:'🌗 黄昏之力', type:'active', target:'all_enemies', effect:'敌全体DEF-15%+HP-10%', mpCost:22, desc:'光暗交汇的湮灭之力' },
  },
  {
    inputs: ['分裂', '不死'],
    skill: { name:'♾️ 不死增殖', type:'active', target:'self', effect:'创造1个分身(HP=30%)+重生buff', mpCost:25, desc:'分裂碎片获得不死性' },
  },
];
