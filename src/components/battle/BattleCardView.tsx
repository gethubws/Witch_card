// ============================================
// 魔女卡牌 — 战斗卡片视图 v2
// 支持拖拽攻击 + 点击选目标
// ============================================
import React from 'react';
import type { BattleCard, AnimType } from '../../types';
import { FactorBadge } from '../ui';

interface Props {
  bc: BattleCard;
  isPlayer: boolean;
  isActive: boolean;
  anim?: AnimType | null;
  className?: string;
  // 交互
  draggable?: boolean;
  dragIndex?: number;
  onClick?: () => void;
  onDrop?: (playerIndex: number) => void;
  isTargeted?: boolean;
}

export const BattleCardView: React.FC<Props> = ({
  bc, isPlayer, isActive, anim, className,
  draggable, dragIndex, onClick, onDrop, isTargeted,
}) => {
  const { card, currentHp, currentMp, position } = bc;
  const stats = card.stats || { atk: 0, def: 0, spd: 0, hp: 0, maxHp: 100, mp: 0, maxMp: 100, crit: 0, dodge: 0 };
  const hpPct = Math.max(0, (currentHp / stats.maxHp) * 100);
  const mpPct = stats.maxMp > 0 ? (currentMp / stats.maxMp) * 100 : 0;
  const isDead = currentHp <= 0;
  const highestLevel = card.factors?.reduce((max: string, f: any) => {
    const o: Record<string, number> = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4 };
    return o[f.level] > (o[max] || 0) ? f.level : max;
  }, 'N') || 'N';

  let animClass = '';
  if (anim === 'strike') animClass = isPlayer ? 'animate-card-strike' : 'animate-card-strike-down';
  else if (anim === 'shake') animClass = 'animate-card-shake animate-hit-flash';
  else if (anim === 'crit') animClass = 'animate-crit-impact';
  else if (anim === 'defeat') animClass = 'animate-card-defeat';
  else if (anim === 'heal') animClass = 'animate-heal-glow';

  // 拖拽
  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || dragIndex === undefined) return;
    e.dataTransfer.setData('text/plain', String(dragIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (onDrop) e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onDrop) return;
    const idx = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(idx)) onDrop(idx);
  };

  return (
    <div
      className={`
        relative flex flex-col items-center
        ${isPlayer ? 'animate-card-deal' : ''}
        ${animClass}
        ${isActive && !isDead ? 'animate-turn-pulse' : ''}
        ${isDead ? 'opacity-40 grayscale' : ''}
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${onClick && !isDead ? 'cursor-pointer' : ''}
        ${isTargeted ? 'scale-105' : ''}
        transition-all duration-300
      `}
      style={isTargeted ? { filter: 'drop-shadow(0 0 12px rgba(229,115,115,0.5))' } : undefined}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onClick}
    >
      {/* 卡框 */}
      <div
        className={`card-frame ${isPlayer ? `card-rarity-${highestLevel}` : `card-rarity-${highestLevel}`}`}
        style={{
          width: isPlayer ? 140 : 160,
          height: isPlayer ? 218 : 248,
          cursor: 'inherit',
          transform: isActive && !isDead ? 'translateY(-4px)' : undefined,
        }}
      >
        <div className="flex flex-col h-full relative" style={{ zIndex: 2 }}>
          {/* 名称 */}
          <div className="text-xs font-bold text-center truncate px-1 pt-2" style={{ color: 'var(--ink)' }}>
            {card.name}
          </div>

          {/* 立绘区 */}
          <div className="flex-1 flex items-center justify-center text-3xl" style={{ minHeight: 60 }}>
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain rounded" />
            ) : isPlayer ? (
              <span className="opacity-30">🧙‍♀️</span>
            ) : (
              <span className="opacity-40">{card.name.slice(0, 2)}</span>
            )}
          </div>

          {/* 血条 */}
          <div className="px-2 mb-1">
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span>❤️</span>
              <span className="font-mono text-[10px]">{currentHp}/{stats.maxHp}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${hpPct}%`,
                  background: hpPct > 50 ? 'var(--heal)' : hpPct > 25 ? '#FFB74D' : 'var(--alert)',
                }}
              />
            </div>
          </div>

          {/* MP条 */}
          {stats.maxMp > 0 && (
            <div className="px-2 mb-1">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span>💠</span>
                <span className="font-mono text-[10px]">{currentMp}/{stats.maxMp}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${mpPct}%`, background: 'var(--magic)' }}
                />
              </div>
            </div>
          )}

          {/* 属性速览 */}
          <div className="flex justify-center gap-1.5 px-2 pb-2">
            <span className="stat-row text-[10px]" title="ATK">⚔{stats.atk}</span>
            <span className="stat-row text-[10px]" title="DEF">🛡{stats.def}</span>
            <span className="stat-row text-[10px]" title="SPD">⚡{stats.spd}</span>
          </div>

          {/* 因子标签 */}
          {card.factors && card.factors.length > 0 && (
            <div className="flex flex-wrap gap-0.5 px-2 pb-1 justify-center">
              {card.factors.slice(0, 3).map(f => (
                <FactorBadge key={f.id} factorId={f.id} level={f.level} />
              ))}
              {card.factors.length > 3 && (
                <span className="text-[10px] text-gray-400">+{card.factors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 被选中目标的指示器 */}
      {isTargeted && (
        <div className="absolute -bottom-1 text-xs text-red-500 font-bold animate-bounce">
          ▼ 目标
        </div>
      )}
    </div>
  );
};
