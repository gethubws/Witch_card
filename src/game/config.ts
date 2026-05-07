// ============================================
// Phaser 游戏实例管理
// ============================================
import * as Phaser from 'phaser';
import { WorldScene } from '../scenes/WorldScene';
import { CaveScene } from '../scenes/CaveScene';

let game: Phaser.Game | null = null;

export function createGame(parent: string, width: number, height: number): Phaser.Game {
  if (game) return game;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width, height,
    parent,
    backgroundColor: '#448844',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [WorldScene, CaveScene],
  });
  return game;
}

export function destroyGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

export function getGame() { return game; }
export function getWorldScene(): WorldScene | null {
  return game?.scene.getScene('WorldScene') as WorldScene || null;
}
