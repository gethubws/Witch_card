// ============================================
// 魔女卡牌 — 副本页面 v2
// 选副本 → 编队 → 战斗
// ============================================
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button } from '../ui';
import { DUNGEONS } from '../../config/shops';
import { MONSTER_MAP } from '../../config/monsters';

export const DungeonPage: React.FC = () => {
  const { unlockedAreas, selectDungeon, setPage } = useGameStore();
  const available = DUNGEONS.filter(d => unlockedAreas.includes(d.id));
  console.log('🔍 DungeonPage: unlockedAreas =', unlockedAreas, 'available =', available.length);

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d1117' }}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="copper" onClick={() => setPage('home')}>← 回小屋</Button>
        <h1 className="text-2xl font-bold text-white/90">⚔️ 副本</h1>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {available.map(d => (
          <div
            key={d.id}
            className="cursor-pointer hover:scale-105 transition-transform p-4 rounded-2xl animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => selectDungeon(d.id)}
          >
            <div className="text-lg font-bold text-white/90">{d.name}</div>
            <div className="text-xs text-white/40 mt-1">{d.description}</div>
            <div className="mt-2">
              <span className={`factor-tag factor-tag-${d.difficulty === 'SSR' ? 'SSR' : d.difficulty === 'SR' ? 'SR' : d.difficulty === 'R' ? 'R' : 'N'}`}>
                {d.difficulty}
              </span>
            </div>
            {d.bossMonster && (
              <div className="text-xs mt-1 text-red-300/80">👹 BOSS: {MONSTER_MAP[d.bossMonster]?.name}</div>
            )}
            <div className="text-xs text-white/30 mt-1">
              {d.monsters.map(mid => MONSTER_MAP[mid]?.name).filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
