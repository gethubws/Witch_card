// ============================================
// 史莱姆平原 · 溪谷高地 — Tile 渲染地图
// 16张 tileset 切块 → 逐格拼图，同色板天然统一
// ============================================
import * as Phaser from 'phaser';
import MAP, { buildWalkableGrid } from '../data/mapData';
import { triggerEncounter, triggerBossEncounter, triggerExitReached, triggerCaveEnter } from '../game/EventBridge';

const CELL = 64;
const HALF = CELL / 2;

// 怪物精灵路径
const MONSTER_SPRITE: Record<string, string> = {
  green_slime: '/monsters/green_slime.png',
  red_slime: '/monsters/red_slime.png',
  blue_slime: '/monsters/blue_slime.png',
  balloon_slime: '/monsters/balloon_slime.png',
  thunder_slime: '/monsters/thunder_slime.png',
  ice_slime: '/monsters/ice_slime.png',
  giant_slime: '/monsters/giant_slime.png',
  light_slime: '/monsters/light_slime.png',
  dark_slime: '/monsters/dark_slime.png',
  slime_king: '/monsters/slime_king.png',
};

// 场景物件
const OBJ_SPRITES: Record<string, string> = {
  rock: '/assets/map/tiles/rock_mossy.png',
  highgrass: '/assets/map/tiles/flower_patch.png',
  cave: '/assets/map/tiles/cave_entrance.png',
};

interface MonsterSprite {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  data: { id: string; monsterId: string; groupId?: string; behavior: string; sizeW: number; sizeH: number; gridX: number; gridY: number };
  tween?: Phaser.Tweens.Tween;
}

// 伪随机(种子固定)
function sr(x: number, y: number, seed = 42): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerGridX = 0;
  private playerGridY = 0;
  private moving = false;
  private walkableGrid!: boolean[][];
  private monsterSprites: MonsterSprite[] = [];
  private exitLocked = true;
  private exitSprite!: Phaser.GameObjects.Rectangle;
  private defeatedGroups: Set<string> = new Set();

  constructor() { super({ key: 'WorldScene' }); }

  preload() {
    // 加载16张tiles
    const tileNames = [
      'grass_low','grass_low2','grass_low3','grass_low_dark',
      'grass_high','grass_high2','grass_high_dark','grass_edge',
      'water_deep','water_shallow','water_shore','bridge_h',
      'path_dirt','rock_mossy','flower_patch','cave_entrance',
    ];
    for (const tn of tileNames) {
      this.load.image(`tile_${tn}`, `/assets/map/tiles/${tn}.png`);
    }
    // 怪物
    for (const [id, path] of Object.entries(MONSTER_SPRITE))
      this.load.image(id, path);
    // 物件 (复用tile)
    // 艾芙
    this.load.image('eve_walk', '/assets/map/eve_walk.png');
  }

  create(data?: { defeatedGroups?: string[] }) {
    this.walkableGrid = buildWalkableGrid();
    if (data?.defeatedGroups) this.defeatedGroups = new Set(data.defeatedGroups);

    const W = MAP.width * CELL;
    const H = MAP.height * CELL;

    // ═══ 1. 逐格铺 tile ═══
    this.drawTiles();

    // ═══ 2. 场景物件 (代码画桥/栅栏) ═══
    this.drawScenery();

    // ═══ 3. 怪物 ═══
    this.spawnMonsters();

    // ═══ 4. 出口 ═══
    this.exitSprite = this.add.rectangle(
      MAP.exit.x * CELL + HALF, MAP.exit.y * CELL + HALF,
      CELL * 1.2, CELL * 1.2, 0xe8d060, 0.3,
    ).setStrokeStyle(2, 0xc4a020).setDepth(50);
    this.add.text(MAP.exit.x * CELL + HALF, MAP.exit.y * CELL + HALF - 10, '→出口', {
      fontSize: '10px', color: '#8a6a20',
    }).setOrigin(0.5).setDepth(51);

    // ═══ 5. 玩家 ═══
    this.playerGridX = MAP.playerStart.x;
    this.playerGridY = MAP.playerStart.y;
    const px = this.playerGridX * CELL + HALF;
    const py = this.playerGridY * CELL + HALF;

    const ring = this.add.circle(px, py, 20, 0xffffff, 0.25).setDepth(99);
    this.player = this.add.rectangle(px, py, 2, 2, 0, 0).setDepth(100);

    const eve = this.add.image(px, py, 'eve_walk');
    eve.setDisplaySize(56, 64).setOrigin(0.5, 0.85).setDepth(101);
    const label = this.add.text(px, py - 48, '艾芙', {
      fontSize: '11px', color: '#5a3a1a', fontStyle: 'bold',
      stroke: '#fff', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(102);

    (this as any)._eveRing = ring;
    (this as any)._eveSprite = eve;
    (this as any)._eveLabel = label;

    // ═══ 6. 相机 ═══
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(200, 150);

    // ═══ 7. 输入 ═══
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.moving) return;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
      else return;
      this.tryMove(dx, dy);
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.moving) return;
      const gx = Math.floor(pointer.worldX / CELL);
      const gy = Math.floor(pointer.worldY / CELL);
      if (gx === this.playerGridX && gy === this.playerGridY) return;
      this.tryMove(Math.sign(gx - this.playerGridX), Math.sign(gy - this.playerGridY));
    });
  }

  // ═══════════════════════════════
  //  TILE 渲染
  // ═══════════════════════════════

  private tileAt(x: number, y: number): string {
    // 水域
    const allWater = [...MAP.water.mainStream, ...MAP.water.westBranch, ...MAP.water.eastBranch];
    const isBridge = MAP.scenery.bridges.some(b => b.x === x && b.y === y);
    if (isBridge) return 'water_deep'; // 桥下垫水

    const isW = allWater.some(w => w.x === x && w.y === y);
    if (isW) {
      // 水域邻格检查 → 岸边
      const hasLandNeighbor = [[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dy]) => {
        const nx=x+dx, ny=y+dy;
        return nx>=0 && nx<MAP.width && ny>=0 && ny<MAP.height
          && !allWater.some(w=>w.x===nx&&w.y===ny);
      });
      if (hasLandNeighbor) return 'water_shore';
      return sr(x,y,13) > 0.5 ? 'water_deep' : 'water_shallow';
    }

    // 高地平台
    const plat = MAP.elevation.platform;
    if (x >= plat.xRange[0] && x <= plat.xRange[1] && y >= plat.yRange[0] && y <= plat.yRange[1]) {
      if (MAP.elevation.platformWalls.some(w => {
        if (w.xRange && w.yRange) return x >= w.xRange[0] && x <= w.xRange[1] && y >= w.yRange[0] && y <= w.yRange[1];
        return false;
      })) return 'grass_edge';
      return sr(x,y,71) > 0.5 ? 'grass_high' : 'grass_high2';
    }

    // 外围高地
    if (MAP.elevation.outerHighland.some(h => x === h.x && y >= h.yRange[0] && y <= h.yRange[1]))
      return 'grass_high_dark';
    if (MAP.elevation.outerHighlandY.some(h => y === h.y && x >= h.xRange[0] && x <= h.xRange[1]))
      return 'grass_high_dark';

    // 护墙区域 (独立walls not in platform area)
    const isWall = MAP.elevation.platformWalls.some(w => {
      if (w.xRange && w.yRange)
        return x >= w.xRange[0] && x <= w.xRange[1] && y >= w.yRange[0] && y <= w.yRange[1];
      return false;
    });
    if (isWall) return 'grass_edge';

    // 普通谷底草地
    const r = sr(x, y, 17);
    if (r < 0.33) return 'grass_low';
    if (r < 0.66) return 'grass_low2';
    return 'grass_low3';
  }

  private drawTiles() {
    for (let y = 0; y < MAP.height; y++) {
      for (let x = 0; x < MAP.width; x++) {
        const tile = this.tileAt(x, y);
        const sprite = this.add.image(x * CELL + HALF, y * CELL + HALF, `tile_${tile}`);
        sprite.setDisplaySize(CELL, CELL);
        // 不可走区域加暗色叠层
        if (!this.walkableGrid[y][x]) {
          sprite.setTint(0x889966);
        }
      }
    }
  }

  // ═══════════════════════════════
  //  场景物件
  // ═══════════════════════════════

  private drawScenery() {
    // 桥梁 — 代码画木桥 (因为tileset桥没画好)
    for (const b of MAP.scenery.bridges) {
      const cx = b.x * CELL + HALF;
      const cy = b.y * CELL + HALF;
      const g = this.add.graphics();
      // 桥面
      g.fillStyle(0xc4a470, 0.9);
      g.fillRect(cx - HALF + 4, cy - 10, CELL - 8, 20);
      // 木板线
      g.lineStyle(1, 0x9a7a48, 0.6);
      for (let i = 0; i < 4; i++) {
        const lx = cx - HALF + 8 + i * 14;
        g.lineBetween(lx, cy - 8, lx, cy + 8);
      }
      // 桥墩
      g.fillStyle(0x8a6a40, 0.8);
      g.fillRect(cx - HALF + 2, cy - 12, 6, 24);
      g.fillRect(cx + HALF - 8, cy - 12, 6, 24);
      g.setDepth(10);
    }

    // 高草丛 — 用 flower_patch tile
    for (const hg of MAP.scenery.highGrass) {
      const sx = hg.x * CELL + (hg.w * CELL) / 2;
      const sy = hg.y * CELL + (hg.h * CELL) / 2;
      this.add.image(sx, sy, 'tile_flower_patch')
        .setDisplaySize(hg.w * CELL * 0.9, hg.h * CELL * 0.9)
        .setOrigin(0.5, 0.7)
        .setDepth(5);
      for (let dy = 0; dy < hg.h; dy++)
        for (let dx = 0; dx < hg.w; dx++)
          this.walkableGrid[hg.y + dy][hg.x + dx] = false;
    }

    // 岩石
    for (const r of MAP.scenery.rocks) {
      this.add.image(r.x * CELL + HALF, r.y * CELL + HALF, 'tile_rock_mossy')
        .setDisplaySize(CELL * 0.85, CELL * 0.85)
        .setDepth(5);
      this.walkableGrid[r.y][r.x] = false;
    }

    // 栅栏 — 代码画
    for (const f of MAP.scenery.fences) {
      const g = this.add.graphics();
      g.lineStyle(3, 0xb89870, 0.9);
      if (f.dir === 'horizontal') {
        const fy = f.y * CELL + HALF;
        g.lineBetween(f.x * CELL + 4, fy, (f.x + f.w) * CELL - 4, fy);
        for (let i = 0; i <= f.w; i++) {
          g.lineBetween(f.x * CELL + i * CELL, fy - 6, f.x * CELL + i * CELL, fy + 6);
        }
        for (let dy = 0; dy < f.h; dy++)
          for (let dx = 0; dx < f.w; dx++)
            this.walkableGrid[f.y + dy][f.x + dx] = false;
      }
      g.setDepth(10);
    }

    // 洞窟入口
    const cave = MAP.scenery.caveEntrance;
    this.add.image(
      cave.x * CELL + cave.w * CELL / 2,
      cave.y * CELL + cave.h * CELL / 2,
      'tile_cave_entrance',
    ).setDisplaySize(cave.w * CELL * 0.95, cave.h * CELL * 0.95).setDepth(5);
    this.walkableGrid[cave.y][cave.x] = true; // 入口可踩
  }

  // ═══════════════════════════════
  //  怪物 ═══════════════════════
  // ═══════════════════════════════

  private spawnMonsters() {
    const spawnOne = (m: typeof MAP.soloMonsters[0], groupId?: string) => {
      if (this.defeatedGroups.has(m.id)) return;
      const cx = m.x * CELL + (m.sizeW * CELL) / 2;
      const cy = m.y * CELL + (m.sizeH * CELL) / 2;
      const w = m.sizeW * CELL * 0.85;
      const h = m.sizeH * CELL * 0.85;
      const path = MONSTER_SPRITE[m.monsterId];
      if (!path) return;

      const sprite = this.add.sprite(cx, cy, path);
      sprite.setDisplaySize(w, h).setOrigin(0.5, 0.8).setDepth(20);

      const shadow = this.add.ellipse(cx, cy + h * 0.35, w * 0.6, 10, 0x000000, 0.15);

      const names: Record<string, string> = {
        green_slime: '🟢绿', red_slime: '🔴红', blue_slime: '🔵蓝',
        thunder_slime: '⚡雷', ice_slime: '❄️冰', balloon_slime: '🎈气球',
        giant_slime: '🪨大型', light_slime: '✨光', dark_slime: '🌑暗',
        slime_king: '👑王',
      };
      this.add.text(cx, cy - h/2 - 16, names[m.monsterId] || '?', {
        fontSize: '10px', color: '#3a2a1a', stroke: '#fff', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(21);

      const ms: MonsterSprite = { sprite, data: { ...m, groupId, gridX: m.x, gridY: m.y } };
      if (m.behavior === 'fly') {
        ms.tween = this.tweens.add({
          targets: sprite, y: cy - 14, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
      this.monsterSprites.push(ms);
    };

    for (const g of MAP.monsterGroups) {
      if (this.defeatedGroups.has(g.groupId)) continue;
      for (const m of g.monsters) spawnOne(m, g.groupId);
    }
    for (const m of MAP.soloMonsters) spawnOne(m);
  }

  // ═══════════════════════════════
  //  移动 & 交互
  // ═══════════════════════════════

  private tryMove(dx: number, dy: number) {
    const nx = this.playerGridX + dx;
    const ny = this.playerGridY + dy;
    if (nx < 0 || nx >= MAP.width || ny < 0 || ny >= MAP.height) return;
    if (!this.walkableGrid[ny][nx]) return;
    if (this.getMonsterAt(nx, ny)) return;

    this.moving = true;
    this.playerGridX = nx;
    this.playerGridY = ny;
    const tx = nx * CELL + HALF;
    const ty = ny * CELL + HALF;

    this.tweens.add({
      targets: this.player,
      x: tx, y: ty, duration: 180, ease: 'Power1',
      onUpdate: () => {
        const ring = (this as any)._eveRing;
        const eve = (this as any)._eveSprite;
        const lbl = (this as any)._eveLabel;
        if (ring) ring.setPosition(this.player.x, this.player.y);
        if (eve) eve.setPosition(this.player.x, this.player.y);
        if (lbl) lbl.setPosition(this.player.x, this.player.y - 48);
      },
      onComplete: () => {
        this.moving = false;
        this.updateDepth();
        this.checkEncounter();
        this.checkExit();
        this.checkCave();
      },
    });
  }

  private getMonsterAt(gx: number, gy: number): MonsterSprite | null {
    for (const ms of this.monsterSprites) {
      const d = ms.data;
      for (let dy = 0; dy < d.sizeH; dy++)
        for (let dx = 0; dx < d.sizeW; dx++)
          if (d.gridX + dx === gx && d.gridY + dy === gy) return ms;
    }
    return null;
  }

  private checkEncounter() {
    const ms = this.getMonsterAt(this.playerGridX, this.playerGridY);
    if (!ms) return;
    const d = ms.data;
    if (d.groupId) {
      const group = MAP.monsterGroups.find(g => g.groupId === d.groupId);
      if (group) {
        const ids = group.monsters.filter(m => !this.defeatedGroups.has(m.id)).map(m => m.monsterId);
        if (ids.length > 0) {
          (group.groupId === 'boss_guards' ? triggerBossEncounter : triggerEncounter)(ids, group.name);
          return;
        }
      }
    }
    if (!this.defeatedGroups.has(d.id)) {
      triggerEncounter([d.monsterId], d.monsterId);
    }
  }

  private checkExit() {
    if (!this.exitLocked && this.playerGridX === MAP.exit.x && this.playerGridY === MAP.exit.y)
      triggerExitReached();
  }

  private checkCave() {
    const c = MAP.scenery.caveEntrance;
    if (this.playerGridX >= c.x && this.playerGridX < c.x + c.w &&
        this.playerGridY >= c.y && this.playerGridY < c.y + c.h)
      triggerCaveEnter();
  }

  private updateDepth() {
    if (this.player) this.player.setDepth(this.player.y);
    const eve = (this as any)._eveSprite;
    const lbl = (this as any)._eveLabel;
    const ring = (this as any)._eveRing;
    if (eve) eve.setDepth(this.player.y + 1);
    if (lbl) lbl.setDepth(this.player.y + 2);
    if (ring) ring.setDepth(this.player.y - 1);
    for (const ms of this.monsterSprites) {
      const y = ms.data.behavior === 'fly' ? ms.sprite.y - 20 : ms.sprite.y;
      ms.sprite.setDepth(y);
    }
  }

  // ═══ 外部接口 ═══
  public clearDefeated(ids: string[], groupId?: string) {
    for (const id of ids) this.defeatedGroups.add(id);
    if (groupId) this.defeatedGroups.add(groupId);
    for (const id of ids) {
      const idx = this.monsterSprites.findIndex(m => m.data.id === id);
      if (idx >= 0) {
        const ms = this.monsterSprites[idx];
        ms.tween?.destroy();
        ms.sprite.destroy();
        this.monsterSprites.splice(idx, 1);
      }
    }
    if (groupId === 'boss_guards' || ids.includes('slime_king')) {
      this.exitLocked = false;
      this.exitSprite.setFillStyle(0x60c060, 0.6);
      this.exitSprite.setStrokeStyle(2, 0x40a040);
    }
  }

  public setPlayerPosition(gx: number, gy: number) {
    this.playerGridX = gx;
    this.playerGridY = gy;
    this.player.setPosition(gx * CELL + HALF, gy * CELL + HALF);
    const eve = (this as any)._eveSprite;
    const lbl = (this as any)._eveLabel;
    const ring = (this as any)._eveRing;
    if (eve) eve.setPosition(this.player.x, this.player.y);
    if (lbl) lbl.setPosition(this.player.x, this.player.y - 48);
    if (ring) ring.setPosition(this.player.x, this.player.y);
    this.updateDepth();
  }

  public getPlayerGrid(): [number, number] {
    return [this.playerGridX, this.playerGridY];
  }
}
