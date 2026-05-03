// ============================================
// 魔女卡牌 — 仓库页面
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button } from '../ui';
import type { Card } from '../../types';

export const WarehousePage: React.FC = () => {
  const { warehouse, bag, addCard, removeCard, setPage, addLog } = useGameStore();
  const [selected, setSelected] = useState<Card | null>(null);

  const moveToBag = (card: Card) => {
    if (bag.length >= 100) {
      addLog('⚠️ 背包已满 (100/100)');
      return;
    }
    removeCard(card.id);
    addCard({ ...card, id: card.id }); // reuse same id to avoid removeCard side effects
    addLog(`📦 ${card.name} 已取出到背包`);
  };

  const moveToWarehouse = (card: Card) => {
    const s = useGameStore.getState();
    // remove from bag, add to warehouse
    useGameStore.setState({
      bag: s.bag.filter(c => c.id !== card.id),
      warehouse: [...s.warehouse, card],
    });
    addLog(`📦 ${card.name} 已放入仓库`);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(180deg, #F4ECD8 0%, #EDE0C8 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setPage('home')} className="btn btn-copper btn-sm">← 回小屋</button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>📦 仓库</h1>
        <div className="text-xs opacity-50">无限容量</div>
      </div>

      {/* 背包中的卡 → 可存入仓库 */}
      <div className="mb-6">
        <h2 className="text-sm font-bold mb-2 opacity-60">🎒 背包 ({bag.length}/100) — 点击存入仓库</h2>
        {bag.length === 0 ? (
          <p className="text-xs opacity-30">背包空空</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {bag.map(c => (
              <div key={c.id} className="glass-card text-center cursor-pointer hover:scale-105 transition-transform p-2"
                onClick={() => moveToWarehouse(c)}>
                <div className="text-sm font-bold truncate">{c.name}</div>
                <div className="text-xs opacity-50">{c.factors.map(f => f.id).join('·')}</div>
                <div className="text-xs mt-1">⬇️ 存入</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 仓库中的卡 */}
      <div>
        <h2 className="text-sm font-bold mb-2 opacity-60">📦 仓库 ({warehouse.length}) — 点击取出</h2>
        {warehouse.length === 0 ? (
          <p className="text-xs opacity-30">仓库空空 — 背包满了会自动存到这里</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {warehouse.map(c => (
              <div key={c.id} className="glass-card text-center cursor-pointer hover:scale-105 transition-transform p-2"
                onClick={() => {
                  if (bag.length >= 100) { addLog('⚠️ 背包已满'); return; }
                  moveToBag(c);
                }}>
                <div className="text-sm font-bold truncate">{c.name}</div>
                <div className="text-xs opacity-50">{c.factors.map(f => f.id).join('·')}</div>
                <div className="text-xs mt-1">⬆️ 取出</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
