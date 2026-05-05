// ============================================
// 魔女卡牌 — 怪物配置 v3 (九元素体系)
// N:6 R:9 SR:12 SSR:15 因子
// 所有因子可在游戏中获取
// ============================================
import type { Monster } from '../types';

export const MONSTERS: Monster[] = [
  // ═══════ 试炼之森 (N · 普通 · 6因子) ═══════
  // 低等级基础泛用因子，偶尔混1-2个R
  {
    id:'green_slime', name:'🟢 绿史莱姆', eliteLevel:'normal',
    factorPool: ['毒','分裂','水','地','游击','尖刺'],
    imageUrl:'/monsters/green_slime.png', description:'湿地弹弹团，有毒的黏液',
  },
  {
    id:'blue_slime', name:'🔵 蓝史莱姆', eliteLevel:'normal',
    factorPool: ['水','治愈','冰','守护','增幅','精准'],
    imageUrl:'/monsters/blue_slime.png', description:'纯净水源孕育的半透明史莱姆',
  },
  {
    id:'red_slime', name:'🔴 红史莱姆', eliteLevel:'normal',
    factorPool: ['火','猛攻','反击','烈焰','地','精准'],
    imageUrl:'/monsters/red_slime.png', description:'暴躁好斗的火焰史莱姆',
  },
  {
    id:'bat', name:'🦇 暗夜蝙蝠', eliteLevel:'normal',
    factorPool: ['暗','风','迅捷','游击','幻觉','暗影'],
    imageUrl:'/monsters/bat.png', description:'暗影中穿梭的幻影猎手',
  },
  {
    id:'golem', name:'🗿 石魔像', eliteLevel:'normal',
    factorPool: ['地','岩石','守护','坚韧','山岳','猛攻'],
    imageUrl:'/monsters/golem.png', description:'沉睡已久的石之守护者',
  },
  {
    id:'mandrake', name:'🌿 曼德拉草', eliteLevel:'normal',
    factorPool: ['地','毒','水','诅咒','治愈','分裂'],
    imageUrl:'/monsters/mandrake.png', description:'尖叫也能当武器的小人形植物',
  },

  // ═══════ 密林深处 (R · 精英 · 9因子) ═══════
  // 1-2 SR + 3-5 R + 少量N
  {
    id:'fire_spirit', name:'🔥 火焰精', eliteLevel:'elite',
    factorPool: ['火','猛攻','烈焰','阳炎','反击','焰岚','风','咆哮','爆炎'],
    imageUrl:'/monsters/fire_spirit.png', description:'火元素凝成的狂舞精灵',
  },
  {
    id:'ice_spirit', name:'❄️ 冰晶灵', eliteLevel:'elite',
    factorPool: ['冰','水','极寒','玄冰','守护','结界','精准','永冻','治愈'],
    imageUrl:'/monsters/ice_spirit.png', description:'极寒中诞生的晶莹精灵',
  },
  {
    id:'ghost_book', name:'📖 幽灵书', eliteLevel:'elite',
    factorPool: ['暗','诅咒','暗影','冥暗','幻觉','深渊之印','毒','风','虚无'],
    imageUrl:'/monsters/ghost_book.png', description:'写满禁忌知识的浮空古书',
  },
  {
    id:'thunder_wolf', name:'⚡ 雷狼', eliteLevel:'elite',
    factorPool: ['雷','猛攻','雷霆','劫雷','迅捷','风','游击','咆哮','天罚'],
    imageUrl:'/monsters/thunder_wolf.png', description:'鬃毛带电的苍蓝幼狼',
  },

  // ═══════ 古代遗迹 (SR · 精英/首领 · 12因子) ═══════
  // 1-2 SSR + 3-5 SR + 其余R
  {
    id:'unicorn', name:'🦄 独角兽', eliteLevel:'elite',
    factorPool: ['光','圣光','神辉','天光','增幅','结界','治愈','王之力','创世之光','风','瞬移','珊瑚'],
    imageUrl:'/monsters/unicorn.png', description:'圣洁林间出没的银白独角兽',
  },
  {
    id:'wind_fairy', name:'💨 风精', eliteLevel:'elite',
    factorPool: ['风','暴风','飓风','虚空风','迅捷','瞬移','游击','时空风暴','雷','天罚','幻觉','雷鸣'],
    imageUrl:'/monsters/wind_fairy.png', description:'无形无影的激流风暴之灵',
  },
  {
    id:'dark_succubus', name:'🌑 暗影魅魔', eliteLevel:'elite',
    factorPool: ['暗','暗影','冥暗','虚无','幻觉','深渊之印','诅咒之血','毒','湮灭','黑焰','月蚀','分身'],
    imageUrl:'/monsters/dark_succubus.png', description:'吞噬梦魇的暗影魅魔',
  },
  {
    id:'slime_king', name:'👑 史莱姆王', eliteLevel:'boss',
    factorPool: ['分裂','王之粘液','王之力','水','地','岩石','守护','山岳','结界','咆哮','尖刺','不死'],
    imageUrl:'/monsters/slime_king.png', description:'头戴皇冠，体内封着古代圣剑',
  },

  // ═══════ 深渊裂隙 (SSR · 首领 · 15因子) ═══════
  // 1-2 UR + 3-5 SSR + 其余SR
  {
    id:'baby_dragon', name:'🐉 幼龙', eliteLevel:'boss',
    factorPool: ['火','烈焰','阳炎','凤凰火','巨龙血脉','龙神血脉','山岳','地核','猛攻','反击','焰岚','狱火','星核','咆哮','爆炎'],
    imageUrl:'/monsters/baby_dragon.png', description:'龙族幼崽，火之力的完美容器',
  },
  {
    id:'undead', name:'💀 不死亡灵', eliteLevel:'boss',
    factorPool: ['暗','暗影','冥暗','虚无','湮灭','不死','诅咒','深渊之印','诅咒之血','毒','分身','幻觉','月蚀','黑焰','王之力'],
    imageUrl:'/monsters/undead.png', description:'不死禁术的骸骨法师',
  },
];

export const MONSTER_MAP: Record<string, Monster> = {};
MONSTERS.forEach(m => { MONSTER_MAP[m.id] = m; });
