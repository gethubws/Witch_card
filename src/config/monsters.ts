// ============================================
// 魔女卡牌 — 怪物配置 v4 (4生态副本·独立梯度)
// 解锁顺序: 史莱姆平原→枯木之森→暗影洞穴→龙巢火山
// ============================================
import type { Monster } from '../types';

export const MONSTERS: Monster[] = [
  // ═══════ 副本1: 史莱姆平原 ═══════
  {
    id:'green_slime', name:'🟢 绿史莱姆', eliteLevel:'normal',
    factorPool:['毒','分裂','水','地','游击','尖刺'],
    imageUrl:'/monsters/green_slime.png', description:'湿地弹弹团，有毒的黏液',
  },
  {
    id:'blue_slime', name:'🔵 蓝史莱姆', eliteLevel:'normal',
    factorPool:['水','治愈','冰','守护','增幅','精准'],
    imageUrl:'/monsters/blue_slime.png', description:'纯净水源孕育的半透明史莱姆',
  },
  {
    id:'red_slime', name:'🔴 红史莱姆', eliteLevel:'normal',
    factorPool:['火','猛攻','反击','烈焰','地','精准'],
    imageUrl:'/monsters/red_slime.png', description:'暴躁好斗的火焰史莱姆',
  },
  {
    id:'gold_slime', name:'🟡 金史莱姆', eliteLevel:'elite',
    factorPool:['毒','分裂','水','光','王之粘液','圣光','增幅','治愈','结界'],
    imageUrl:null, description:'稀有变种，体内闪烁着金光',
  },
  {
    id:'slime_king', name:'👑 史莱姆王', eliteLevel:'boss',
    factorPool:['分裂','王之粘液','王之力','水','地','岩石','守护','山岳','结界','咆哮','尖刺','不死'],
    imageUrl:'/monsters/slime_king.png', description:'头戴皇冠，体内封着古代圣剑',
  },

  // ═══════ 副本2: 枯木之森 ═══════
  {
    id:'mandrake', name:'🌿 曼德拉草', eliteLevel:'normal',
    factorPool:['地','毒','水','诅咒','治愈','分裂'],
    imageUrl:'/monsters/mandrake.png', description:'尖叫也能当武器的小人形植物',
  },
  {
    id:'tree_sprout', name:'🌱 树精苗', eliteLevel:'normal',
    factorPool:['地','水','治愈','守护','岩石','风'],
    imageUrl:null, description:'刚萌芽的小树精，头顶两片嫩叶',
  },
  {
    id:'maneater', name:'🌸 妖花', eliteLevel:'elite',
    factorPool:['毒','地','暗','诅咒','诅咒之血','幻觉','暗影','治愈','深渊之印'],
    imageUrl:null, description:'艳丽花瓣下藏着食人的獠牙',
  },
  {
    id:'treant_guard', name:'🌳 树精守卫', eliteLevel:'elite',
    factorPool:['地','岩石','山岳','守护','结界','水','治愈','分裂','尖刺'],
    imageUrl:null, description:'千年古树化作的沉默守护者',
  },
  {
    id:'treant_elder', name:'🏛️ 树精长老', eliteLevel:'boss',
    factorPool:['地','岩石','山岳','地核','水','治愈','结界','分裂','不死','毒','诅咒','深渊之印'],
    imageUrl:null, description:'枯木之森最古老的意志',
  },

  // ═══════ 副本3: 暗影洞穴 ═══════
  {
    id:'bat', name:'🦇 暗夜蝙蝠', eliteLevel:'normal',
    factorPool:['暗','风','雷','迅捷','游击','幻觉'],
    imageUrl:'/monsters/bat.png', description:'暗影中穿梭的幻影猎手',
  },
  {
    id:'golem', name:'🗿 石魔像', eliteLevel:'normal',
    factorPool:['地','岩石','守护','坚韧','山岳','猛攻'],
    imageUrl:'/monsters/golem.png', description:'沉睡已久的石之守护者',
  },
  {
    id:'thunder_wolf', name:'⚡ 雷狼', eliteLevel:'elite',
    factorPool:['雷','猛攻','雷霆','劫雷','迅捷','风','游击','咆哮','天罚'],
    imageUrl:'/monsters/thunder_wolf.png', description:'鬃毛带电的苍蓝幼狼',
  },
  {
    id:'dark_succubus', name:'🌑 暗影魅魔', eliteLevel:'elite',
    factorPool:['暗','暗影','冥暗','虚无','幻觉','深渊之印','诅咒之血','毒','黑焰'],
    imageUrl:'/monsters/dark_succubus.png', description:'吞噬梦魇的暗影魅魔',
  },
  {
    id:'abyss_lord', name:'👁️ 深渊领主', eliteLevel:'boss',
    factorPool:['暗','暗影','冥暗','虚无','湮灭','深渊之印','诅咒之血','毒','幻觉','分身','黑焰','月蚀'],
    imageUrl:null, description:'深渊凝视的具现化',
  },

  // ═══════ 副本4: 龙巢火山 ═══════
  {
    id:'fire_lizard', name:'🦎 火蜥蜴', eliteLevel:'normal',
    factorPool:['火','猛攻','烈焰','反击','地','精准'],
    imageUrl:null, description:'岩浆里泡大的小蜥蜴',
  },
  {
    id:'thunder_bird', name:'⚡ 雷鸟', eliteLevel:'normal',
    factorPool:['雷','风','迅捷','游击','猛攻','雷霆'],
    imageUrl:null, description:'羽翼间跳动着电光的候鸟',
  },
  {
    id:'light_sprite', name:'✨ 光精灵', eliteLevel:'normal',
    factorPool:['光','治愈','增幅','风','守护','水'],
    imageUrl:null, description:'龙巢穹顶漏下的阳光凝成的小精魂',
  },
  {
    id:'fire_spirit', name:'🔥 火焰精', eliteLevel:'elite',
    factorPool:['火','猛攻','烈焰','阳炎','反击','焰岚','风','咆哮','爆炎'],
    imageUrl:'/monsters/fire_spirit.png', description:'火元素凝成的狂舞精灵',
  },
  {
    id:'ice_spirit', name:'❄️ 冰晶灵', eliteLevel:'elite',
    factorPool:['冰','水','极寒','玄冰','守护','结界','精准','永冻','治愈'],
    imageUrl:'/monsters/ice_spirit.png', description:'极寒中诞生的晶莹精灵',
  },
  {
    id:'unicorn', name:'🦄 独角兽', eliteLevel:'elite',
    factorPool:['光','圣光','神辉','天光','增幅','结界','治愈','王之力','创世之光'],
    imageUrl:'/monsters/unicorn.png', description:'圣洁林间出没的银白独角兽',
  },
  {
    id:'wind_fairy', name:'💨 风精', eliteLevel:'elite',
    factorPool:['风','暴风','飓风','虚空风','迅捷','瞬移','游击','时空风暴','雷鸣'],
    imageUrl:'/monsters/wind_fairy.png', description:'无形无影的激流风暴之灵',
  },
  {
    id:'baby_dragon', name:'🐉 幼龙', eliteLevel:'boss',
    factorPool:['火','烈焰','阳炎','凤凰火','巨龙血脉','龙神血脉','山岳','地核','猛攻','反击','焰岚','狱火','星核','咆哮','爆炎'],
    imageUrl:'/monsters/baby_dragon.png', description:'龙族幼崽，火之力的完美容器',
  },
  {
    id:'undead', name:'💀 不死亡灵', eliteLevel:'boss',
    factorPool:['暗','暗影','冥暗','虚无','湮灭','不死','诅咒','深渊之印','诅咒之血','毒','分身','幻觉','月蚀','黑焰','王之力'],
    imageUrl:'/monsters/undead.png', description:'不死禁术的骸骨法师',
  },
];

export const MONSTER_MAP: Record<string, Monster> = {};
MONSTERS.forEach(m => { MONSTER_MAP[m.id] = m; });
