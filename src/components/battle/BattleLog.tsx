// ============================================
// 魔女卡牌 — 战斗日志面板
// ============================================
import React, { useEffect, useRef } from 'react';
import type { BattleLogEntry } from '../../types';

interface Props {
  log: BattleLogEntry[];
  visible: boolean;
  onToggle: () => void;
}

export const BattleLogPanel: React.FC<Props> = ({ log, visible, onToggle }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log.length, visible]);

  if (!visible) {
    return (
      <button
        className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(62, 39, 35, 0.75)',
          color: '#F4ECD8',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onToggle}
      >
        📜 日志 ({log.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 w-72 max-h-56 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(62, 39, 35, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 165, 116, 0.2)',
      }}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(126, 87, 194, 0.15)' }}>
        <span className="text-xs font-bold" style={{ color: '#F4ECD8' }}>📜 战斗日志</span>
        <button className="text-xs opacity-50 hover:opacity-100" style={{ color: '#F4ECD8' }}
          onClick={onToggle}>✕</button>
      </div>

      {/* 日志列表 */}
      <div className="battle-log-scroll overflow-y-auto p-2 space-y-1" style={{ maxHeight: 180 }}>
        {log.length === 0 && (
          <div className="text-xs opacity-40 text-center py-4" style={{ color: '#F4ECD8' }}>战斗开始...</div>
        )}
        {log.map((entry, i) => {
          const isCrit = entry.result.includes('暴击');
          const isHeal = entry.result.startsWith('+');
          const isKill = entry.result.includes('击杀') || entry.damage && entry.damage > 50;
          const isPlayerAction = !entry.actor.includes('🟢') && !entry.actor.includes('🔵')
            && !entry.actor.includes('🔴') && !entry.actor.includes('🦇')
            && !entry.actor.includes('🗿') && !entry.actor.includes('🌿')
            && !entry.actor.includes('🔥') && !entry.actor.includes('❄️')
            && !entry.actor.includes('📖') && !entry.actor.includes('⚡')
            && !entry.actor.includes('🦄') && !entry.actor.includes('💨')
            && !entry.actor.includes('🌑') && !entry.actor.includes('👑')
            && !entry.actor.includes('🐉') && !entry.actor.includes('💀');

          return (
            <div key={i} className="flex items-start gap-1.5 text-xs animate-fade-up"
              style={{ color: '#F4ECD8', opacity: 0.85 }}>
              <span className="opacity-40 font-mono shrink-0">T{entry.turn}</span>
              <span className={isPlayerAction ? 'text-purple-300' : 'text-orange-300'}>
                {entry.actor}
              </span>
              <span className="opacity-50">{entry.action}</span>
              <span className={isPlayerAction ? 'text-orange-300' : 'text-purple-300'}>
                → {entry.target}
              </span>
              <span className={`
                ${isCrit ? 'text-yellow-300 font-bold' : ''}
                ${isHeal ? 'text-green-300' : ''}
                ${isKill ? 'text-red-300 font-bold' : ''}
              `}>
                {entry.result}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
