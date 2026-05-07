// ============================================
// 史莱姆平原 · 溪谷高地 — 地图配置
// 28 × 20, 64px/cell, 总世界 1792 × 1280
// ============================================

export interface MapCell {
  x: number; y: number;
  walkable: boolean;
  terrain: 'grass_low' | 'grass_highland' | 'grass_platform' | 'water_deep' | 'water_shallow' | 'bridge' | 'slope' | 'cave';
}

export interface SceneryObject {
  id: string;
  x: number; y: number;
  w: number; h: number;
  type: 'highGrass' | 'rock' | 'flowerField' | 'fence' | 'caveEntrance' | 'spring';
  dir?: 'horizontal' | 'vertical';
}

export interface MonsterSpawn {
  id: string;
  monsterId: string;
  x: number; y: number;
  sizeW: number; sizeH: number;
  behavior: 'static' | 'patrol_small' | 'fly' | 'boss';
}

export interface MonsterGroup {
  groupId: string;
  name: string;
  monsters: MonsterSpawn[];
  behavior: 'static' | 'patrol_small' | 'mixed' | 'boss';
}

export interface MapConfig {
  name: string;
  width: number;
  height: number;
  cellSize: number;
  playerStart: { x: number; y: number };
  exit: { x: number; y: number; locked: boolean; unlockAfter: string };
  elevation: {
    outerHighland: { x: number; yRange: [number, number] }[];
    outerHighlandY: { y: number; xRange: [number, number] }[];
    platform: { xRange: [number, number]; yRange: [number, number] };
    platformWalls: Array<{ xRange?: [number, number]; yRange?: [number, number]; x?: number; note: string }>;
    slopes: Array<{ x: number; y: number; w: number; h: number; id: string }>;
  };
  water: {
    spring: { x: number; y: number };
    mainStream: Array<{ x: number; y: number; bridge?: string }>;
    westBranch: Array<{ x: number; y: number; bridge?: string }>;
    eastBranch: Array<{ x: number; y: number; bridge?: string }>;
  };
  scenery: {
    highGrass: Array<{ x: number; y: number; w: number; h: number }>;
    rocks: Array<{ x: number; y: number }>;
    flowerFields: Array<{ x: number; y: number; w: number; h: number }>;
    fences: Array<{ x: number; y: number; w: number; h: number; dir: string }>;
    bridges: Array<{ x: number; y: number; id: string }>;
    caveEntrance: { x: number; y: number; w: number; h: number };
  };
  monsterGroups: MonsterGroup[];
  soloMonsters: MonsterSpawn[];
  hidden: {
    slimeRainbow: {
      id: string;
      name: string;
      size: [number, number];
      spawnRule: string;
      chance: number;
    };
  };
}

const MAP: MapConfig = {
  name: '史莱姆平原 · 溪谷高地',
  width: 28,
  height: 20,
  cellSize: 64,
  playerStart: { x: 2, y: 18 },
  exit: { x: 26, y: 17, locked: true, unlockAfter: 'boss_guards' },

  // ---- 高低差 ----
  elevation: {
    outerHighland: [ // X0, X27 整列
      { x: 0, yRange: [0, 19] },
      { x: 27, yRange: [0, 19] },
    ],
    outerHighlandY: [   // Y0, Y19 整行
      { y: 0, xRange: [0, 27] },
      { y: 19, xRange: [0, 27] },
    ],
    platform: { xRange: [10, 17], yRange: [2, 5] },
    platformWalls: [
      { xRange: [8, 9], yRange: [2, 5], note: '西护墙' },
      { xRange: [18, 19], yRange: [2, 5], note: '东护墙' },
      { xRange: [10, 17], x: 1, note: '北护墙' },  // Y=1
    ],
    slopes: [
      { x: 9, y: 6, w: 1, h: 1, id: 'slope_west' },
      { x: 13, y: 6, w: 2, h: 1, id: 'slope_central' },
      { x: 18, y: 6, w: 1, h: 1, id: 'slope_east' },
    ],
  },

  // ---- 水域 ----
  water: {
    spring: { x: 13, y: 7 },
    mainStream: [
      { x: 13, y: 8 }, { x: 13, y: 9 }, { x: 13, y: 10, bridge: 'central' },
      { x: 13, y: 11 }, { x: 13, y: 12 }, { x: 13, y: 13 },
      { x: 13, y: 14 }, { x: 13, y: 15 }, { x: 13, y: 16 },
      { x: 13, y: 17 }, { x: 13, y: 18 },
    ],
    westBranch: [
      { x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 },
      { x: 9, y: 10, bridge: 'west' }, { x: 8, y: 10 }, { x: 7, y: 10 },
      { x: 6, y: 10 }, { x: 5, y: 10 },
      { x: 5, y: 11 }, { x: 5, y: 12 }, { x: 5, y: 13 },
      { x: 5, y: 14 }, { x: 5, y: 15 }, { x: 5, y: 16 },
      { x: 5, y: 17 }, { x: 5, y: 18 },
    ],
    eastBranch: [
      { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 },
      { x: 17, y: 10, bridge: 'east' }, { x: 18, y: 10 }, { x: 19, y: 10 },
      { x: 20, y: 10 }, { x: 21, y: 10 },
      { x: 21, y: 11 }, { x: 21, y: 12 }, { x: 21, y: 13 },
      { x: 21, y: 14 }, { x: 21, y: 15 }, { x: 21, y: 16 },
      { x: 21, y: 17 }, { x: 21, y: 18 },
    ],
  },

  // ---- 场景物件 ----
  scenery: {
    highGrass: [
      { x: 6, y: 11, w: 2, h: 2 },
      { x: 16, y: 11, w: 2, h: 1 },
      { x: 4, y: 6, w: 2, h: 2 },
      { x: 20, y: 6, w: 2, h: 2 },
      { x: 22, y: 3, w: 2, h: 2 },
    ],
    rocks: [
      { x: 5, y: 15 }, { x: 22, y: 15 },
      { x: 2, y: 5 }, { x: 24, y: 4 },
    ],
    flowerFields: [
      { x: 1, y: 13, w: 6, h: 5 },
      { x: 20, y: 13, w: 6, h: 5 },
    ],
    fences: [
      { x: 7, y: 18, w: 3, h: 1, dir: 'horizontal' },
      { x: 20, y: 8, w: 1, h: 2, dir: 'vertical' },
    ],
    bridges: [
      { x: 13, y: 10, id: 'central' },
      { x: 9, y: 10, id: 'west' },
      { x: 17, y: 10, id: 'east' },
    ],
    caveEntrance: { x: 22, y: 2, w: 2, h: 2 },
  },

  // ---- 怪物群落 ----
  monsterGroups: [
    {
      groupId: 'pack_a', name: '绿潮',
      monsters: [
        { id: 'slime_green_1', monsterId: 'green_slime', x: 2, y: 17, sizeW: 1, sizeH: 1, behavior: 'patrol_small' },
        { id: 'slime_green_2', monsterId: 'green_slime', x: 3, y: 17, sizeW: 1, sizeH: 1, behavior: 'patrol_small' },
        { id: 'slime_green_3', monsterId: 'green_slime', x: 4, y: 17, sizeW: 1, sizeH: 1, behavior: 'patrol_small' },
      ],
      behavior: 'patrol_small',
    },
    {
      groupId: 'pack_b', name: '蓝池',
      monsters: [
        { id: 'slime_blue_1', monsterId: 'blue_slime', x: 4, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_blue_2', monsterId: 'blue_slime', x: 5, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_blue_3', monsterId: 'blue_slime', x: 6, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
      ],
      behavior: 'static',
    },
    {
      groupId: 'pack_c', name: '红岩',
      monsters: [
        { id: 'slime_red_1', monsterId: 'red_slime', x: 11, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_red_2', monsterId: 'red_slime', x: 12, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_ice_1', monsterId: 'ice_slime', x: 11, y: 10, sizeW: 1, sizeH: 1, behavior: 'static' },
      ],
      behavior: 'static',
    },
    {
      groupId: 'pack_d', name: '雷云',
      monsters: [
        { id: 'slime_thunder_1', monsterId: 'thunder_slime', x: 19, y: 9, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_balloon_1', monsterId: 'balloon_slime', x: 20, y: 9, sizeW: 1, sizeH: 1, behavior: 'fly' },
      ],
      behavior: 'mixed',
    },
    {
      groupId: 'boss_guards', name: '王座护法',
      monsters: [
        { id: 'slime_king', monsterId: 'slime_king', x: 12, y: 2, sizeW: 3, sizeH: 3, behavior: 'boss' },
        { id: 'slime_light_guard', monsterId: 'light_slime', x: 10, y: 4, sizeW: 1, sizeH: 1, behavior: 'static' },
        { id: 'slime_dark_guard', monsterId: 'dark_slime', x: 16, y: 4, sizeW: 1, sizeH: 1, behavior: 'static' },
      ],
      behavior: 'boss',
    },
  ],

  // ---- 落单怪物 ----
  soloMonsters: [
    { id: 'solo_green_1', monsterId: 'green_slime', x: 6, y: 15, sizeW: 1, sizeH: 1, behavior: 'patrol_small' },
    { id: 'solo_green_2', monsterId: 'green_slime', x: 7, y: 16, sizeW: 1, sizeH: 1, behavior: 'patrol_small' },
    { id: 'solo_red_1', monsterId: 'red_slime', x: 15, y: 12, sizeW: 1, sizeH: 1, behavior: 'static' },
    { id: 'solo_blue_1', monsterId: 'blue_slime', x: 24, y: 12, sizeW: 1, sizeH: 1, behavior: 'static' },
    { id: 'solo_ice_1', monsterId: 'ice_slime', x: 2, y: 8, sizeW: 1, sizeH: 1, behavior: 'static' },
    { id: 'solo_thunder_1', monsterId: 'thunder_slime', x: 25, y: 7, sizeW: 1, sizeH: 1, behavior: 'static' },
    { id: 'solo_balloon_1', monsterId: 'balloon_slime', x: 19, y: 11, sizeW: 1, sizeH: 1, behavior: 'fly' },
    { id: 'solo_large_1', monsterId: 'giant_slime', x: 3, y: 13, sizeW: 2, sizeH: 2, behavior: 'static' },
    { id: 'solo_large_2', monsterId: 'giant_slime', x: 23, y: 13, sizeW: 2, sizeH: 2, behavior: 'static' },
    { id: 'solo_light_1', monsterId: 'light_slime', x: 14, y: 8, sizeW: 1, sizeH: 1, behavior: 'static' },
    { id: 'solo_dark_1', monsterId: 'dark_slime', x: 21, y: 3, sizeW: 1, sizeH: 1, behavior: 'static' },
  ],

  // ---- 隐藏怪 ----
  hidden: {
    slimeRainbow: {
      id: 'slime_rainbow',
      name: '彩虹史莱姆',
      size: [1, 1],
      spawnRule: 'random',
      chance: 0.1,
    },
  },
};

export default MAP;

/** 建立可走性网格：从配置计算每个格子的 walkable 状态 */
export function buildWalkableGrid(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: MAP.height }, () => Array(MAP.width).fill(true));

  // 外围高地
  for (const h of MAP.elevation.outerHighland) {
    for (let y = h.yRange[0]; y <= h.yRange[1]; y++) grid[y][h.x] = false;
  }
  for (const h of MAP.elevation.outerHighlandY) {
    for (let x = h.xRange[0]; x <= h.xRange[1]; x++) grid[h.y][x] = false;
  }
  // 高地护墙
  for (const wall of MAP.elevation.platformWalls) {
    if (wall.xRange) {
      if (wall.yRange) {
        for (let x = wall.xRange[0]; x <= wall.xRange[1]; x++)
          for (let y = wall.yRange[0]; y <= wall.yRange[1]; y++) grid[y][x] = false;
      }
    }
    if (wall.x !== undefined) {
      // Y=1 北护墙
      for (let x = (wall as any).xRange[0]; x <= (wall as any).xRange[1]; x++) grid[wall.x][x] = false;
    }
  }
  // 水域 (桥所在的格保持 walkable)
  const bridgeCells = new Set(MAP.scenery.bridges.map(b => `${b.x},${b.y}`));
  const allWater = [...MAP.water.mainStream, ...MAP.water.westBranch, ...MAP.water.eastBranch];
  for (const w of allWater) {
    if (!bridgeCells.has(`${w.x},${w.y}`)) grid[w.y][w.x] = false;
  }

  return grid;
}
