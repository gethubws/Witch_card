// ============================================
// 魔女卡牌 — 学院商店
// ============================================
import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button } from '../ui';
import { SHOP_ITEMS } from '../../config/shops';

const ICONS: Record<string, string> = { '火':'🔥','水':'💧','风':'🌬️','雷':'⚡','冰':'❄️','暗':'🌑','光':'✨','地':'🪨' };

export const ShopPage: React.FC = () => {
  const { gold, diamonds, buyItem, addLog, setPage } = useGameStore();

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(180deg, #F4ECD8 0%, #EDE0C8 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="copper" onClick={() => setPage('home')}>← 回小屋</Button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>🏫 学院商店</h1>
        <div className="flex gap-4 text-sm font-bold" style={{ color: 'var(--ink)' }}>
          <span>💰 {gold}</span>
          <span>💎 {diamonds}</span>
        </div>
      </div>

      <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--ink)' }}>📜 元素因子卡</h2>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {SHOP_ITEMS.filter(e => e.type === 'factor_card').map(e => (
          <div key={e.id} className="glass-card text-center cursor-pointer hover:scale-105 transition-transform p-3"
            onClick={() => buyItem(e.id)}>
            <div className="text-3xl mb-2">{ICONS[e.factorId ?? '']}</div>
            <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{e.factorId}</div>
            <div className="text-xs opacity-50">{e.price} 💰</div>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--ink)' }}>🛠️ 工具 & 消耗品</h2>
      <div className="space-y-2">
        {SHOP_ITEMS.filter(e => e.type !== 'factor_card').map(e => (
          <div key={e.id} className="glass-card flex items-center justify-between p-3">
            <div>
              <span className="font-bold" style={{ color: 'var(--ink)' }}>{e.name}</span>
              <span className="text-xs opacity-50 ml-2">{e.description}</span>
            </div>
            <Button variant="copper" small onClick={() => buyItem(e.id)}>
              {e.price} {e.currency === 'gold' ? '💰' : '💎'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
