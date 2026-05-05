// ============================================
// 魔女卡牌 — 商店 & 副本配置 v4 (4生态副本)
// ============================================
import type { ShopItem, Dungeon } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  ...['地','火','水','风'].map(id => ({
    id: `card_${id}`, name: `${id}元素卡`, description: `单因子卡: ${id}`, price: 20, currency: 'gold' as const, type: 'factor_card' as const, factorId: id,
  })),
  { id:'engrave_blank', name:'空白铭刻卡', description:'战斗中消耗一回合，随机抽取敌人1个因子', price:50, currency:'gold', type:'engrave_card' },
  { id:'capture_blank', name:'空白卡', description:'战斗中消耗一回合，低血量时捕捉敌人获得全部因子+图像', price:300, currency:'gold', type:'consumable' },
  { id:'potion_vial', name:'魔药瓶', description:'六芒星合成消耗品(1次)', price:30, currency:'gold', type:'consumable' },
  { id:'stabilizer',  name:'魔药稳定剂', description:'禁断融合保底1因子', price:5, currency:'diamond', type:'consumable' },
  { id:'forbidden_book', name:'禁断之书', description:'禁断融合消耗品(1次)', price:15, currency:'diamond', type:'consumable' },
];

/** 副本解锁顺序 */
const DUNGEON_ORDER = ['slime_plains','withered_woods','shadow_cavern','dragon_volcano'];

export function getNextDungeon(currentId: string): string | null {
  const idx = DUNGEON_ORDER.indexOf(currentId);
  return idx >= 0 && idx < DUNGEON_ORDER.length - 1 ? DUNGEON_ORDER[idx + 1] : null;
}

export const DUNGEONS: Dungeon[] = [
  {
    id:'slime_plains', name:'🟢 史莱姆平原',
    description:'弹弹团子的乐园·新手试炼',
    difficulty:'N',
    monsters: ['green_slime','blue_slime','red_slime','gold_slime'],
    bossMonster: 'slime_king',
  },
  {
    id:'withered_woods', name:'🌲 枯木之森',
    description:'被诅咒的千年古林',
    difficulty:'R',
    monsters: ['mandrake','tree_sprout','maneater','treant_guard'],
    bossMonster: 'treant_elder',
  },
  {
    id:'shadow_cavern', name:'🕳️ 暗影洞穴',
    description:'深渊裂隙蔓延的地下迷宫',
    difficulty:'SR',
    monsters: ['bat','golem','thunder_wolf','dark_succubus'],
    bossMonster: 'abyss_lord',
  },
  {
    id:'dragon_volcano', name:'🐉 龙巢火山',
    description:'龙族巢穴·最终试炼',
    difficulty:'SSR',
    monsters: ['fire_lizard','thunder_bird','light_sprite','fire_spirit','ice_spirit','unicorn','wind_fairy'],
    bossMonster: 'baby_dragon',
  },
];
