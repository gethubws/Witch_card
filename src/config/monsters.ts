// ============================================
// 魔女卡牌 — 怪物配置（16种，因子驱动）
// ============================================
import type { Monster } from '../types';

// 怪物属性 = sum(factorPool stats) + eliteLevel加成
// 怪物技能 = factorPool因子技能 ∪ 因子组合技
// 由 MonsterEngine.buildMonster() 动态生成

export const MONSTERS: Monster[] = [
  // === 试炼之森 (N) — normal ===
  {
    id: 'green_slime', name: '🟢 绿史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液', '软体'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '绿色弹弹小团子，豆豆眼',
  },
  {
    id: 'blue_slime', name: '🔵 蓝史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液', '软体', '水'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '半透明蓝色，体内有气泡',
  },
  {
    id: 'red_slime', name: '🔴 红史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液', '软体', '火', '分裂'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '红色冒热气，有点暴躁',
  },
  {
    id: 'bat', name: '🦇 暗夜蝙蝠',
    eliteLevel: 'normal',
    factorPool: ['暗', '游击', '迅捷'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '紫色蝙蝠，翅膀星斑',
  },
  {
    id: 'golem', name: '🗿 石魔像',
    eliteLevel: 'normal',
    factorPool: ['地', '守护', '尖刺'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '长青苔的小石人',
  },
  {
    id: 'mandrake', name: '🌿 曼德拉草',
    eliteLevel: 'normal',
    factorPool: ['地', '治愈', '毒'],
    engraveCardNeeded: 'copper',
    imageUrl: '',
    description: '花盆里尖叫的小人形植物',
  },

  // === 密林深处 (R) — elite ===
  {
    id: 'fire_spirit', name: '🔥 火焰精',
    eliteLevel: 'elite',
    factorPool: ['火', '猛攻', '狂热'],
    engraveCardNeeded: 'silver',
    imageUrl: '',
    description: '小火团，尾巴烧着了',
  },
  {
    id: 'ice_spirit', name: '❄️ 冰晶灵',
    eliteLevel: 'elite',
    factorPool: ['冰', '冷静', '精准'],
    engraveCardNeeded: 'silver',
    imageUrl: '',
    description: '雪花状小精灵',
  },
  {
    id: 'ghost_book', name: '📖 幽灵书',
    eliteLevel: 'elite',
    factorPool: ['暗', '诅咒', '召唤'],
    engraveCardNeeded: 'silver',
    imageUrl: '',
    description: '漂浮古书，书页翻动成鬼脸',
  },
  {
    id: 'thunder_wolf', name: '⚡ 雷狼',
    eliteLevel: 'elite',
    factorPool: ['雷', '猛攻', '尖刺'],
    engraveCardNeeded: 'silver',
    imageUrl: '',
    description: '灰蓝小狼，鬃毛带静电',
  },

  // === 古代遗迹 (SR) ===
  {
    id: 'unicorn', name: '🦄 独角兽',
    eliteLevel: 'elite',
    factorPool: ['光', '慈悲', '增幅'],
    engraveCardNeeded: 'gold',
    imageUrl: '',
    description: '银白小独角兽',
  },
  {
    id: 'wind_fairy', name: '💨 风精',
    eliteLevel: 'elite',
    factorPool: ['风', '星之祝福', '幸运'],
    engraveCardNeeded: 'silver',
    imageUrl: '',
    description: '半透明绿色旋风',
  },
  {
    id: 'dark_succubus', name: '🌑 暗影魅魔',
    eliteLevel: 'elite',
    factorPool: ['暗', '献祭', '慵懒', '深渊之印'],
    engraveCardNeeded: 'gold',
    imageUrl: '',
    description: '紫黑小恶魔',
  },
  {
    id: 'slime_king', name: '👑 史莱姆王',
    eliteLevel: 'boss',
    factorPool: ['粘液', '分裂', '王之粘液'],
    engraveCardNeeded: 'gold',
    imageUrl: '',
    description: '巨大皇冠史莱姆，体内封着小剑',
  },

  // === 深渊裂隙 (SSR) — boss ===
  {
    id: 'baby_dragon', name: '🐉 幼龙',
    eliteLevel: 'boss',
    factorPool: ['火', '狂热', '巨龙血脉'],
    engraveCardNeeded: 'gold',
    imageUrl: '',
    description: '还没长翅膀的小火龙，鼻孔冒烟',
  },
  {
    id: 'undead', name: '💀 不死亡灵',
    eliteLevel: 'boss',
    factorPool: ['暗', '献祭', '结界', '王之力'],
    engraveCardNeeded: 'gold',
    imageUrl: '',
    description: '半透明骸骨法师，手持黑杖',
  },
];

export const MONSTER_MAP: Record<string, Monster> = {};
MONSTERS.forEach(m => { MONSTER_MAP[m.id] = m; });
