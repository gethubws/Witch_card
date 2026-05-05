// ============================================
// 魔女卡牌 — UI 通用组件
// ============================================
import React from 'react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`glass-card ${className || ''}`}>{children}</div>
);

export const Button: React.FC<{
  children: React.ReactNode; onClick?: () => void; variant?: 'magic'|'copper'|'danger';
  disabled?: boolean; small?: boolean; className?: string;
}> = ({ children, onClick, variant='magic', disabled, small, className }) => (
  <button className={`btn btn-${variant} ${small ? 'btn-sm' : ''} ${className||''}`}
    onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="game-modal-overlay" onClick={onClose}>
      <div className="game-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const FactorBadge: React.FC<{ factorId: string; level?: string }> = ({ factorId, level }) => {
  const lvl = level || 'N';
  return <span className={`factor-tag factor-tag-${lvl}`}>{factorId}</span>;
};

export const CardFrame: React.FC<{
  card: any; onClick?: () => void; className?: string; small?: boolean;
}> = ({ card, onClick, className, small }) => {
  const highestLevel = card.factors?.reduce((max: string, f: any) => {
    const o: Record<string,number> = { N:0, R:1, SR:2, SSR:3, UR:4 };
    return o[f.level] > (o[max]||0) ? f.level : max;
  }, 'N') || 'N';
  const w = small ? 120 : 180;
  const h = small ? 186 : 280;
  const stars = card.stars || 1;
  const starBorderColor = stars >= 6 ? 'rgba(255,215,0,0.6)' : stars >= 4 ? 'rgba(212,165,116,0.5)' : stars >= 3 ? 'rgba(192,192,192,0.4)' : stars >= 2 ? 'rgba(180,120,80,0.3)' : 'transparent';
  
  return (
    <div className={`card-frame card-rarity-${highestLevel} ${className||''}`}
      style={{ width: w, height: h, position: 'relative' }} onClick={onClick}>
      {/* 升星装饰圈 */}
      {stars > 1 && (
        <div className="absolute inset-0 pointer-events-none rounded-lg z-10" style={{
          border: `2px solid ${starBorderColor}`,
          boxShadow: `0 0 ${6+stars*2}px ${starBorderColor}, inset 0 0 ${3+stars}px ${starBorderColor}`,
        }} />
      )}
      {/* 升星角标 */}
      {stars > 1 && (
        <div className="absolute top-1 right-1 z-20 flex items-center gap-0"
          style={{ fontSize: stars >= 5 ? 11 : 9, fontWeight: 700, color: starBorderColor, textShadow: '0 0 4px rgba(0,0,0,0.5)' }}>
          {'★'.repeat(Math.min(stars, 6))}
        </div>
      )}
      {/* 卡面内容 */}
      <div className="flex flex-col h-full" style={{ zIndex: 2, position: 'relative' }}>
        {/* 因子标签（顶部） */}
        <div className="flex flex-wrap gap-1 p-2 pb-0">
          {card.factors?.slice(0, small ? 2 : 4).map((f: any) => (
            <FactorBadge key={f.id} factorId={f.id} level={f.level} />
          ))}
          {card.factors?.length > (small ? 2 : 4) && (
            <span className="text-xs font-bold text-[#8D6E63]">+{card.factors.length - (small ? 2 : 4)}</span>
          )}
        </div>
        {/* 立绘占位区 */}
        <div className="flex-1 flex items-center justify-center text-4xl" style={{ minHeight: 80 }}>
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />
          ) : (
            <span className="opacity-30">🧙‍♀️</span>
          )}
        </div>
        {/* 名称 + 属性（底部） */}
        <div className="p-2 pt-0">
          <div className="text-xs font-bold text-center truncate text-[#3E2723] mb-1">{card.name}</div>
          {card.stats && (
            <div className="flex justify-center gap-1">
              <span className="stat-row" title="ATK">⚔️{card.stats.atk}</span>
              <span className="stat-row" title="DEF">🛡️{card.stats.def}</span>
              <span className="stat-row" title="SPD">⚡{card.stats.spd}</span>
              <span className="stat-row" title="HP">❤️{card.stats.maxHp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Toast: React.FC<{
  messages: string[]; visible: boolean;
}> = ({ messages, visible }) => {
  if (!visible || messages.length === 0) return null;
  const last = messages[messages.length - 1];
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-pop">
      <div className="px-6 py-3 rounded-2xl font-bold text-sm shadow-lg"
        style={{ background: 'rgba(62,39,35,0.9)', color: '#F4ECD8', backdropFilter: 'blur(8px)' }}>
        {last}
      </div>
    </div>
  );
};
