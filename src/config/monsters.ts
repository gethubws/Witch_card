// ============================================
// 魔女卡牌 — 怪物配置 v5
// 副本1: 史莱姆平原 (完整梯度)
// 结构: N(1R+5N) → 精英(1SR+8N) → 稀有(1SSR+11N) → BOSS(1UR+14N)
// ============================================
import type { Monster } from '../types';

// 20个N因子
export const ALL_N = ['地','火','水','冰','风','雷','光','暗','猛攻','精准','守护','游击','治愈','诅咒','刃','壁','雾','血','晶','尘'];

function pickN(exclude: string[], count: number): string[] {
  const pool = ALL_N.filter(f => !exclude.includes(f));
  // 洗牌取前 count 个 (确定性: 按元素分组保证多样性)
  const result: string[] = [];
  const copy = [...pool];
  while (result.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

export const MONSTERS: Monster[] = [
  // ═══════════════════════════════
  // 副本1: 史莱姆平原
  // ═══════════════════════════════

  // —— 普通 (N, 6 = 1R + 5N) ——
  {
    id:'green_slime', name:'🟢 绿史莱姆', eliteLevel:'normal',
    factorPool:['毒','水','地','游击','治愈','诅咒'],
    imageUrl:'/monsters/green_slime.png', description:'湿地弹弹团，体含毒液',
  },
  {
    id:'red_slime', name:'🔴 红史莱姆', eliteLevel:'normal',
    factorPool:['烈焰','火','猛攻','地','精准','守护'],
    imageUrl:'/monsters/red_slime.png', description:'好斗的火焰弹，暴躁易怒',
  },
  {
    id:'blue_slime', name:'🔵 蓝史莱姆', eliteLevel:'normal',
    factorPool:['激流','水','冰','治愈','守护','精准'],
    imageUrl:'/monsters/blue_slime.png', description:'纯净水源孕育的半透明聚合体',
  },
  {
    id:'balloon_slime', name:'🎈 气球史莱姆', eliteLevel:'normal',
    factorPool:['膨胀','风','光','地','游击','守护'],
    imageUrl:'/monsters/balloon_slime.png', description:'吸饱了空气，轻飘飘浮在半空',
  },

  // —— 精英 (R, 9 = 1SR + 8N) ——
  {
    id:'thunder_slime', name:'⚡ 雷史莱姆', eliteLevel:'elite',
    factorPool:['劫雷','雷','风','猛攻','游击','地','水','光','精准'],
    imageUrl:'/monsters/thunder_slime.png', description:'体内涌动雷光的金纹史莱姆',
  },
  {
    id:'ice_slime', name:'❄️ 冰史莱姆', eliteLevel:'elite',
    factorPool:['玄冰','冰','水','治愈','守护','精准','地','风','光'],
    imageUrl:'/monsters/ice_slime.png', description:'玄冰壳包裹的寒气史莱姆',
  },
  {
    id:'giant_slime', name:'🪨 大型史莱姆', eliteLevel:'elite',
    factorPool:['山岳','地','守护','猛攻','水','风','火','精准','治愈'],
    imageUrl:'/monsters/giant_slime.png', description:'小山般巨大的硬化史莱姆',
  },

  // —— 稀有 (SR, 12 = 1SSR + 11N) ——
  {
    id:'light_slime', name:'✨ 光史莱姆', eliteLevel:'boss',
    factorPool:['天光','光','治愈','风','守护','水','地','冰','雷','精准','游击','猛攻'],
    imageUrl:'/monsters/light_slime.png', description:'穹顶之光凝成的圣洁史莱姆',
  },
  {
    id:'dark_slime', name:'🌑 暗史莱姆', eliteLevel:'boss',
    factorPool:['虚无','暗','诅咒','地','风','游击','水','火','冰','雷','治愈','猛攻'],
    imageUrl:'/monsters/dark_slime.png', description:'深渊裂隙漏出的暗影聚合体，吞噬光线',
  },

  // —— 王者 (SSR, 15 = 1UR + 全14N) ——
  {
    id:'slime_king', name:'👑 史莱姆王', eliteLevel:'boss',
    factorPool:['星核',...ALL_N],
    imageUrl:'/monsters/slime_king.png', description:'头顶王冠，体内封印着行星之核',
  },

  // —— 隐藏: 混合史莱姆 ——
  // 6因子全随机(从所有因子中抽, 极限6UR), 精英血量
  {
    id:'chaos_slime', name:'🌈 混合史莱姆', eliteLevel:'elite',
    factorPool:[], // 运行时随机生成
    imageUrl:'/monsters/chaos_slime.png', description:'一切史莱姆的混沌融合体，完全不可预测',
  },

  // —— 新N因子小怪 (6只, 1R+5N) ——
  {
    id:'stone_sprite', name:'💎 碎石精', eliteLevel:'normal',
    factorPool:['岩石','地','晶','尘','壁','守护'],
    imageUrl:'/monsters/stone_sprite.png', description:'大地碎晶凝成的小精魂',
  },
  {
    id:'wall_turtle', name:'🐢 岩壁龟', eliteLevel:'normal',
    factorPool:['尖刺','壁','晶','地','守护','水'],
    imageUrl:'/monsters/wall_turtle.png', description:'硬壳上长满水晶的小龟',
  },
  {
    id:'mist_cluster', name:'🌫️ 雾团', eliteLevel:'normal',
    factorPool:['幻觉','雾','水','风','暗','光'],
    imageUrl:'/monsters/mist_cluster.png', description:'水面蒸腾的迷雾聚合体',
  },
  {
    id:'blood_bat', name:'🩸 血蝠', eliteLevel:'normal',
    factorPool:['毒','血','暗','猛攻','游击','风'],
    imageUrl:'/monsters/blood_bat.png', description:'吸食魔力的微型红蝙蝠',
  },
  {
    id:'blade_rat', name:'🐀 刃牙鼠', eliteLevel:'normal',
    factorPool:['反击','刃','猛攻','游击','风','地'],
    imageUrl:'/monsters/blade_rat.png', description:'门牙如刃的洞穴鼠',
  },
  {
    id:'dust_sprite', name:'💨 尘埃精', eliteLevel:'normal',
    factorPool:['分裂','尘','风','地','光','暗'],
    imageUrl:'/monsters/dust_sprite.png', description:'风化的尘埃精灵，打散了还会聚拢',
  },

  // ═══════════════════════════════
  // 副本2-4: 占位 (待后续重构)
  // ═══════════════════════════════
  {
    id:'mandrake', name:'🌿 曼德拉草', eliteLevel:'normal',
    factorPool:['地','毒','水','诅咒','治愈','游击'],
    imageUrl:'/monsters/mandrake.png', description:'尖叫也能当武器的小人形植物',
  },
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
];

export const MONSTER_MAP: Record<string, Monster> = {};
MONSTERS.forEach(m => { MONSTER_MAP[m.id] = m; });
