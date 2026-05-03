// ============================================
// 魔女卡牌 — 医院页面
// ============================================
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button } from '../ui';

export const HospitalPage: React.FC = () => {
  const { bag, gold, healCard, addLog, setPage } = useGameStore();
  const injured = bag.filter(c => c.status === 'injured');

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(180deg, #F4ECD8 0%, #EDE0C8 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="copper" onClick={() => setPage('home')}>← 回小屋</Button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>🏥 医院</h1>
        <span className="font-bold" style={{ color: 'var(--ink)' }}>💰 {gold}</span>
      </div>

      {injured.length === 0 ? (
        <div className="text-center py-16 opacity-50" style={{ color: 'var(--ink)' }}>
          <div className="text-5xl mb-4">✨</div>
          <p>所有卡片都健健康康的~</p>
        </div>
      ) : (
        <div className="space-y-2 max-w-md mx-auto">
          {injured.map(c => (
            <div key={c.id} className="glass-card flex items-center justify-between p-3">
              <div>
                <span className="font-bold" style={{ color: 'var(--ink)' }}>{c.name}</span>
                <span className="text-xs opacity-50 ml-2">⚕️ 重伤</span>
              </div>
              <Button variant="copper" small onClick={() => {
                healCard(c.id);
                addLog(`🏥 ${c.name} 已治愈`);
              }}>
                治疗 30💰
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
