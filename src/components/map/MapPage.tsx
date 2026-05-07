// ============================================
// 地图探索页面 — 组合 Phaser 地图 + HUD
// ============================================
import { useState, useCallback } from 'react';
import PhaserGame, { notifyBattleEnd, getPlayerPosition } from './PhaserGame';
import MapHUD from './MapHUD';
import { buildMonster } from '../../engine/MonsterEngine';
import { MONSTERS, MONSTER_MAP } from '../../config/monsters';
import { useGameStore } from '../../stores/useGameStore';

interface Props {
  onReturnHome: () => void;
  onStartBattle: (enemies: ReturnType<typeof buildMonster>[], groupName?: string, isBoss?: boolean) => void;
  defeatedGroups: string[];
}

export default function MapPage({ onReturnHome, onStartBattle, defeatedGroups }: Props) {
  const store = useGameStore();

  const handleEncounter = useCallback((enemyIds: string[], groupName?: string, isBoss?: boolean) => {
    const enemies = enemyIds
      .map(id => MONSTER_MAP[id])
      .filter(Boolean)
      .map(m => buildMonster(m));
    if (enemies.length > 0) {
      onStartBattle(enemies, groupName, isBoss);
    }
  }, [onStartBattle]);

  const handleExitReached = useCallback(() => {
    alert('🎉 恭喜通关！史莱姆王已被击败。\n出口已解锁，后续关卡开发中...');
    onReturnHome();
  }, [onReturnHome]);

  const handleCaveEnter = useCallback(() => {
    // 暂时用 alert，等 CaveScene 完善后直接切换场景
    alert('🕳️ 前方是幽暗洞窟。\n（洞窟副本开发中，敬请期待）');
  }, []);

  // 判断当前区域名
  const getAreaName = () => {
    const [gx, gy] = getPlayerPosition();
    if (gx >= 10 && gx <= 17 && gy >= 2 && gy <= 5) return '北部高地平台 · 王座';
    if (gx <= 8 && gy <= 9) return '西北溪岸';
    if (gx >= 18 && gy <= 9) return '东北幽径';
    if (gx >= 10 && gx <= 16 && gy >= 7) return '中央阳光谷地';
    if (gx <= 6 && gy >= 13) return '西南花田';
    if (gx >= 20 && gy >= 11) return '东南湿地';
    return '史莱姆平原';
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <PhaserGame
        onEncounter={handleEncounter}
        onExitReached={handleExitReached}
        onCaveEnter={handleCaveEnter}
        defeatedGroups={defeatedGroups}
      />
      <MapHUD
        sceneName="史莱姆平原 · 溪谷高地"
        areaName="阳光草甸"
        onReturnHome={onReturnHome}
      />
    </div>
  );
}
