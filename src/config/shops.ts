// ============================================
// 魔女卡牌 — 商店 & 副本配置
// ============================================
import type { ShopItem, Dungeon } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // 元素因子卡
  ...['火','水','风','雷','冰','暗','光','地'].map(id => ({
    id: `card_${id}`, name: `${id}元素卡`, description: `单因子卡: ${id}`,
    price: 20, currency: 'gold' as const, type: 'factor_card' as const, factorId: id,
  })),
  // 铭刻卡
  { id:'engrave_copper', name:'铜铭刻卡', description:'铭刻N级怪物', price:15, currency:'gold', type:'engrave_card', engraveType:'copper' },
  { id:'engrave_silver', name:'银铭刻卡', description:'铭刻R级怪物', price:60, currency:'gold', type:'engrave_card', engraveType:'silver' },
  { id:'engrave_gold',   name:'金铭刻卡', description:'铭刻SR级怪物', price:200, currency:'gold', type:'engrave_card', engraveType:'gold' },
  // 消耗品
  { id:'potion_vial', name:'魔药瓶', description:'六芒星合成消耗品(1次)', price:30, currency:'gold', type:'consumable' },
  { id:'stabilizer',  name:'魔药稳定剂', description:'禁断融合保底1因子', price:5, currency:'diamond', type:'consumable' },
  { id:'forbidden_book', name:'禁断之书', description:'禁断融合消耗品(1次)', price:15, currency:'diamond', type:'consumable' },
];

export const DUNGEONS: Dungeon[] = [
  { id:'forest_trial',  name:'试炼之森', description:'普通野怪出没的森林', difficulty:'N',
    monsters: ['green_slime','blue_slime','red_slime','bat','golem','mandrake'] },
  { id:'deep_woods',    name:'密林深处', description:'稀有怪物栖息的密林', difficulty:'R',
    monsters: ['fire_spirit','ice_spirit','ghost_book','thunder_wolf'] },
  { id:'ancient_ruins', name:'古代遗迹', description:'BOSS守卫的远古废墟', difficulty:'SR',
    monsters: ['unicorn','wind_fairy','dark_succubus'], bossMonster:'slime_king' },
  { id:'abyss_rift',    name:'深渊裂隙', description:'极高难度的深渊入口', difficulty:'SSR',
    monsters: ['baby_dragon','undead'], bossMonster:'baby_dragon' },
];
