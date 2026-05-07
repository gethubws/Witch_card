// ============================================
// Phaser ↔ React 事件桥接
// ============================================
import * as Phaser from 'phaser';

export type GameEvent = 'encounter' | 'boss_encounter' | 'exit_reached' | 'cave_enter';

export interface EncounterPayload {
  enemyIds: string[];
  groupName?: string;
}

class EventBridge extends Phaser.Events.EventEmitter {
  private static instance: EventBridge;
  static getInstance() {
    if (!EventBridge.instance) EventBridge.instance = new EventBridge();
    return EventBridge.instance;
  }
}

export const bridge = EventBridge.getInstance();

/** 从 Phaser 侧触发切换到战斗 */
export function triggerEncounter(enemyIds: string[], groupName?: string) {
  bridge.emit('encounter', { enemyIds, groupName } as EncounterPayload);
}

export function triggerBossEncounter(enemyIds: string[]) {
  bridge.emit('boss_encounter', { enemyIds, groupName: '王座护法' } as EncounterPayload);
}

export function triggerExitReached() {
  bridge.emit('exit_reached');
}

export function triggerCaveEnter() {
  bridge.emit('cave_enter');
}
