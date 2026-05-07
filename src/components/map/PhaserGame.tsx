// ============================================
// PhaserGame — React 包装组件
// 管理 Phaser 生命周期 + Zustand 状态桥接
// ============================================
import { useEffect, useRef, useCallback } from 'react';
import { createGame, destroyGame, getWorldScene } from '../../game/config';
import { bridge } from '../../game/EventBridge';
import { useGameStore } from '../../stores/useGameStore';

interface Props {
  onEncounter: (enemyIds: string[], groupName?: string, isBoss?: boolean) => void;
  onExitReached: () => void;
  onCaveEnter: () => void;
  defeatedGroups?: string[];
}

export default function PhaserGame({ onEncounter, onExitReached, onCaveEnter, defeatedGroups }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || readyRef.current) return;
    readyRef.current = true;

    const parent = containerRef.current;
    const game = createGame('witch-map', 1792, 1280);
    // 把 canvas 移到我们的 div 里
    const canvas = game.canvas;
    canvas.id = 'witch-map-canvas';
    if (parent && canvas.parentElement !== parent) {
      parent.appendChild(canvas);
    }

    // 事件桥接
    const handleEncounter = (payload: { enemyIds: string[]; groupName?: string }) => {
      onEncounter(payload.enemyIds, payload.groupName);
    };
    const handleBossEncounter = (payload: { enemyIds: string[]; groupName?: string }) => {
      onEncounter(payload.enemyIds, payload.groupName, true);
    };

    bridge.on('encounter', handleEncounter);
    bridge.on('boss_encounter', handleBossEncounter);
    bridge.on('exit_reached', onExitReached);
    bridge.on('cave_enter', onCaveEnter);

    return () => {
      bridge.off('encounter', handleEncounter);
      bridge.off('boss_encounter', handleBossEncounter);
      bridge.off('exit_reached', onExitReached);
      bridge.off('cave_enter', onCaveEnter);
      destroyGame();
      readyRef.current = false;
    };
  }, []);

  // 同步 defeatedGroups 到 WorldScene
  useEffect(() => {
    const ws = getWorldScene();
    if (ws && defeatedGroups) {
      // Already handled in scene create via data param
    }
  }, [defeatedGroups]);

  return (
    <div
      ref={containerRef}
      id="witch-map"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#448844',
      }}
    />
  );
}

/** 战斗结束后通知地图 */
export function notifyBattleEnd(clearIds: string[], groupId?: string) {
  const ws = getWorldScene();
  if (ws) {
    ws.clearDefeated(clearIds, groupId);
  }
}

/** 获取当前玩家位置（用于战斗后恢复） */
export function getPlayerPosition(): [number, number] {
  const ws = getWorldScene();
  return ws ? ws.getPlayerGrid() : [2, 18];
}
