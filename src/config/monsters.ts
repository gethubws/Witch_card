// ============================================
// 魔女卡牌 — 怪物配置 v2（6/9/12/15 因子）
// N:6 R:9 SR:12 SSR:15 · 因子分布: 1-2同级+几个低一级+更多低2级
// ============================================
import type { Monster } from '../types';

export const MONSTERS: Monster[] = [
  // ═══════ 试炼之森 (N · normal · 6因子) ═══════
  {
    id: 'green_slime', name: '🟢 绿史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液','软体','水','守护','冷静','星之祝福'],
    imageUrl: '/monsters/green_slime.png', description: '绿色弹弹小团子，豆豆眼',
  },
  {
    id: 'blue_slime', name: '🔵 蓝史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液','软体','水','治愈','幸运','精准'],
    imageUrl: '/monsters/blue_slime.png', description: '半透明蓝色，体内有气泡',
  },
  {
    id: 'red_slime', name: '🔴 红史莱姆',
    eliteLevel: 'normal',
    factorPool: ['粘液','软体','火','猛攻','狂热','分裂'],
    imageUrl: '/monsters/red_slime.png', description: '红色冒热气，有点暴躁',
  },
  {
    id: 'bat', name: '🦇 暗夜蝙蝠',
    eliteLevel: 'normal',
    factorPool: ['暗','游击','迅捷','风','精准','星之祝福'],
    imageUrl: '/monsters/bat.png', description: '紫色蝙蝠，翅膀星斑',
  },
  {
    id: 'golem', name: '🗿 石魔像',
    eliteLevel: 'normal',
    factorPool: ['地','守护','尖刺','岩石','硬壳','冷静'],
    imageUrl: '/monsters/golem.png', description: '长青苔的小石人',
  },
  {
    id: 'mandrake', name: '🌿 曼德拉草',
    eliteLevel: 'normal',
    factorPool: ['地','治愈','毒','诅咒','闪光','胆怯'],
    imageUrl: '/monsters/mandrake.png', description: '花盆里尖叫的小人形植物',
  },

  // ═══════ 密林深处 (R · elite · 9因子) ═══════
  // 分布: 1-2 SR + 3-5 R + 剩余 N
  {
    id: 'fire_spirit', name: '🔥 火焰精',
    eliteLevel: 'elite',
    factorPool: ['火','猛攻','狂热','烈焰','熔岩','精准','风','幸运','狱火'],
    imageUrl: '/monsters/fire_spirit.png', description: '小火团，尾巴烧着了',
  },
  {
    id: 'ice_spirit', name: '❄️ 冰晶灵',
    eliteLevel: 'elite',
    factorPool: ['冰','冷静','精准','极寒','霜冻','守护','水','慈悲','玄冰'],
    imageUrl: '/monsters/ice_spirit.png', description: '雪花状小精灵',
  },
  {
    id: 'ghost_book', name: '📖 幽灵书',
    eliteLevel: 'elite',
    factorPool: ['暗','诅咒','召唤','暗影','毒','幸运','软体','慵懒','冥暗'],
    imageUrl: '/monsters/ghost_book.png', description: '漂浮古书，书页翻动成鬼脸',
  },
  {
    id: 'thunder_wolf', name: '⚡ 雷狼',
    eliteLevel: 'elite',
    factorPool: ['雷','猛攻','尖刺','雷霆','雷暴','游击','风','迅捷','劫雷'],
    imageUrl: '/monsters/thunder_wolf.png', description: '灰蓝小狼，鬃毛带静电',
  },

  // ═══════ 古代遗迹 (SR · elite|boss · 12因子) ═══════
  // 分布: 1-2 SSR + 3-5 SR + 剩余 R
  {
    id: 'unicorn', name: '🦄 独角兽',
    eliteLevel: 'elite',
    factorPool: ['光','慈悲','增幅','圣光','神辉','治愈','幸运','禅定','天光','疾风','血清','冷静'],
    imageUrl: '/monsters/unicorn.png', description: '银白小独角兽',
  },
  {
    id: 'wind_fairy', name: '💨 风精',
    eliteLevel: 'elite',
    factorPool: ['风','星之祝福','幸运','暴风','飓风','游击','迅捷','闪光','瞬移','疾风','幻觉','虚空风'],
    imageUrl: '/monsters/wind_fairy.png', description: '半透明绿色旋风',
  },
  {
    id: 'dark_succubus', name: '🌑 暗影魅魔',
    eliteLevel: 'elite',
    factorPool: ['暗','献祭','慵懒','深渊之印','暗影','冥暗','诅咒','傲慢','分身','幻觉','虚无','毒'],
    imageUrl: '/monsters/dark_succubus.png', description: '紫黑小恶魔',
  },
  {
    id: 'slime_king', name: '👑 史莱姆王',
    eliteLevel: 'boss',
    factorPool: ['粘液','分裂','王之粘液','软体','水','治愈','屏障','守护','岩石','咆哮','山岳','不死'],
    imageUrl: '/monsters/slime_king.png', description: '巨大皇冠史莱姆，体内封着小剑',
  },

  // ═══════ 深渊裂隙 (SSR · boss · 15因子) ═══════
  // 分布: 1-2 UR + 3-5 SSR + 剩余 SR
  {
    id: 'baby_dragon', name: '🐉 幼龙',
    eliteLevel: 'boss',
    factorPool: ['火','狂热','巨龙血脉','烈焰','熔岩','猛攻','鳞片','咆哮','狱火','阳炎','龙神血脉','勇敢','毒牙','山岳','地核'],
    imageUrl: '/monsters/baby_dragon.png', description: '还没长翅膀的小火龙，鼻孔冒烟',
  },
  {
    id: 'undead', name: '💀 不死亡灵',
    eliteLevel: 'boss',
    factorPool: ['暗','献祭','结界','王之力','暗影','冥暗','诅咒','毒','虚无','不死','深渊之印','傲慢','贤者','殉道','湮灭'],
    imageUrl: '/monsters/undead.png', description: '半透明骸骨法师，手持黑杖',
  },
];

export const MONSTER_MAP: Record<string, Monster> = {};
MONSTERS.forEach(m => { MONSTER_MAP[m.id] = m; });
