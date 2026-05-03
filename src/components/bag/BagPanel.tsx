// ============================================
// 魔女卡牌 — 背包面板
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CardFrame, Modal, Button } from '../ui';
import type { Card } from '../../types';

export const BagPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { bag, removeCard } = useGameStore();
  const [selected, setSelected] = useState<Card | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/10" onClick={onClose} />
        <div className="relative w-96 h-full overflow-y-auto p-4 animate-fade-up"
          style={{ background: 'linear-gradient(180deg, #F4ECD8 0%, #EDE0C8 100%)', borderLeft: '2px solid rgba(212,165,116,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>🎒 背包 ({bag.length}/100)</h2>
            <button onClick={onClose} className="text-2xl opacity-50 hover:opacity-100">×</button>
          </div>

          {bag.length === 0 ? (
            <div className="text-center opacity-50 py-12">空空如也</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {bag.map(card => (
                <CardFrame key={card.id} card={card} small
                  onClick={() => setSelected(card)}
                  className={card.status === 'injured' ? 'opacity-50' : ''} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 卡片详情 */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <div className="flex justify-center mb-4">
              <CardFrame card={selected} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--ink)' }}>{selected.name}</h3>
            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {selected.factors.map(f => (
                <span key={f.id} className={`factor-tag factor-tag-${f.level}`}>{f.id}</span>
              ))}
            </div>
            {selected.stats && (
              <div className="flex justify-center gap-3 mb-3 text-sm font-mono">
                <span>⚔️{selected.stats.atk}</span>
                <span>🛡️{selected.stats.def}</span>
                <span>⚡{selected.stats.spd}</span>
                <span>❤️{selected.stats.maxHp}</span>
                <span>💧{selected.stats.maxMp}</span>
              </div>
            )}
            {selected.status === 'injured' && (
              <div className="text-center text-red-400 font-bold mb-2">💔 重伤 — 需30金币治疗</div>
            )}
            {selected.skills?.map(s => (
              <div key={s.name} className="text-xs opacity-70 mb-1">✨ {s.name}: {s.desc || s.effect}</div>
            ))}
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="danger" small onClick={() => { removeCard(selected.id); setSelected(null); }}>
                🗑️ 卖掉(20💰)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
