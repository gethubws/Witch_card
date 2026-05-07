// ============================================
// 幽暗洞窟 — 占位场景
// ============================================
import * as Phaser from 'phaser';
import { triggerEncounter } from '../game/EventBridge';

export class CaveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaveScene' });
  }

  create() {
    const W = 800;
    const H = 600;

    // 深色背景
    this.add.rectangle(W / 2, H / 2, W, H, 0x2a2a3a);
    this.add.rectangle(W / 2, H / 2, W, H, 0x3a3a4a, 0.3);

    this.add.text(W / 2, 60, '🕳️ 幽暗洞窟', {
      fontSize: '24px', color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(W / 2, 120, '（正在施工中...）', {
      fontSize: '14px', color: '#666688',
    }).setOrigin(0.5);

    // 碎石精 × 2
    const g = this.add.graphics();
    g.fillStyle(0x888877, 0.8);
    g.fillRoundedRect(280, 250, 80, 80, 12);
    g.fillRoundedRect(440, 280, 80, 80, 12);
    g.fillStyle(0x666655);
    g.fillRoundedRect(290, 260, 60, 60, 10);
    g.fillRoundedRect(450, 290, 60, 60, 10);

    this.add.text(320, 330, '碎石精', { fontSize: '11px', color: '#999' }).setOrigin(0.5);
    this.add.text(480, 360, '碎石精', { fontSize: '11px', color: '#999' }).setOrigin(0.5);

    // 返回按钮
    const btn = this.add.rectangle(W / 2, 480, 160, 40, 0x555566)
      .setStrokeStyle(2, 0x888899)
      .setInteractive({ useHandCursor: true });
    this.add.text(W / 2, 480, '← 返回平原', {
      fontSize: '14px', color: '#ccc',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x666677));
    btn.on('pointerout', () => btn.setFillStyle(0x555566));
    btn.on('pointerup', () => {
      this.scene.start('WorldScene');
    });

    // 按 Esc 也可返回
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('WorldScene');
    });
  }
}
