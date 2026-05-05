// ============================================
// 魔女卡牌 — 商店 & 副本配置 v3
// ============================================
import type { ShopItem, Dungeon } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // 元素因子卡 — 9元素基础 N 因子
  ...['地','火','水','冰','风','雷','光','暗'].map(id => ({
    id: `card_${id}`, name: `${id}元素卡`, description: `单因子卡: ${id}`, price: 20, currency: 'gold' as const, type: 'factor_card' as const, factorId: id,
  })),
  // 非元素基础因子卡
  ...['猛攻','精准','守护','游击','治愈','诅咒'].map(id => ({
    id: `card_${id}`, name: `${id}卡`, description: `单因子卡: ${id}`, price: 25, currency: 'gold' as const, type: 'factor_card' as const, factorId: id,
  })),
  // 铭刻卡
  { id:'engrave_blank', name:'空白铭刻卡', description:'战斗中消耗一回合，随机抽取敌人1个因子', price:50, currency:'gold', type:'engrave_card' },
  // 空白卡 — 捕捉用
  { id:'capture_blank', name:'空白卡', description:'战斗中消耗一回合，低血量时捕捉敌人获得全部因子+图像', price:300, currency:'gold', type:'consumable' },
  // 消耗品
  { id:'potion_vial', name:'魔药瓶', description:'六芒星合成消耗品(1次)', price:30, currency:'gold', type:'consumable' },
  { id:'stabilizer',  name:'魔药稳定剂', description:'禁断融合保底1因子', price:5, currency:'diamond', type:'consumable' },
  { id:'forbidden_book', name:'禁断之书', description:'禁断融合消耗品(1次)', price:15, currency:'diamond', type:'consumable' },
];

export const DUNGEONS: Dungeon[] = [
  { id:'forest_trial',  name:'试炼之森', description:'N级·6因子普通野怪', difficulty:'N',
    monsters: ['green_slime','blue_slime','red_slime','bat','golem','mandrake'] },
  { id:'deep_woods',    name:'密林深处', description:'R级·9因子精英怪物', difficulty:'R',
    monsters: ['fire_spirit','ice_spirit','ghost_book','thunder_wolf'] },
  { id:'ancient_ruins', name:'古代遗迹', description:'SR级·12因子稀有守卫', difficulty:'SR',
    monsters: ['unicorn','wind_fairy','dark_succubus'], bossMonster:'slime_king' },
  { id:'abyss_rift',    name:'深渊裂隙', description:'SSR级·15因子深渊首领', difficulty:'SSR',
    monsters: ['baby_dragon','undead'], bossMonster:'baby_dragon' },
];
