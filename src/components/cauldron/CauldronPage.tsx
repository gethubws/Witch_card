// ============================================
// 魔女卡牌 — 坩埚融合台 v5 (重构融合界面)
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Modal, Button, CardFrame, FactorBadge } from '../ui';

const ROOM_IMG = '/assets/scenes/cauldron-room.png';
const ROOM_GLOW = '/assets/scenes/cauldron-room-glow.png';

const HEX_X = 51; const HEX_Y = 85; const HEX_W = 30; const HEX_H =20;

type FusionMode = 'hexagram' | 'forbidden';

// 小型卡槽渲染（46×66），有图片显示图片，无图显示emoji
const SlotMini: React.FC<{ card?: any; idx: number; onRemove?: () => void; color?: string }> =
  ({ card, idx, onRemove, color = 'rgba(160,130,240,0.4)' }) => {
    if (!card) return (
      <div className="w-[46px] h-[66px] rounded-md border border-dashed flex items-center justify-center opacity-25 transition-opacity hover:opacity-50"
        style={{ borderColor: color }}>
        <span className="text-xs text-white/40">{idx}</span>
      </div>
    );
    return (
      <div className="relative group">
        <div className="w-[46px] h-[66px] rounded-md overflow-hidden border border-white/15 shadow-lg cursor-pointer"
          onClick={onRemove} style={{ background: 'rgba(255,255,255,0.06)' }}>
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-xs font-bold text-white/70 truncate px-1">{card.name.slice(0,3)}</div>
          )}
          {card.factors?.[0] && (
            <div className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: card.factors[0].level === 'R' ? '#7e57c2' : card.factors[0].level === 'SR' ? '#d4a574' : '#888' }} />
          )}
        </div>
        {onRemove && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-400/90 text-white flex items-center justify-center text-[10px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}>✕</div>
        )}
      </div>
    );
  };

// 六芒星6顶点（SVG坐标，圆心150,150，半径130）
const STAR_POINTS = [
  { x: 150, y: 22 },   // 上
  { x: 262, y: 86 },   // 右上
  { x: 262, y: 214 },  // 右下
  { x: 150, y: 278 },  // 下
  { x: 38,  y: 214 },  // 左下
  { x: 38,  y: 86 },   // 左上
];

export const CauldronPage: React.FC = () => {
  const { bag, doHexagramFusion, doForbiddenFusion, addLog, setPage, diamonds } = useGameStore();
  const [hexagramGlow, setHexagramGlow] = useState(false);
  const [showFusion, setShowFusion] = useState(false);
  const [mode, setMode] = useState<FusionMode>('hexagram');
  const [slots, setSlots] = useState<(string | null)[]>(Array(6).fill(null));
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [nameEdit, setNameEdit] = useState('');

  const singleFactorCards = bag.filter(c => c.factors.length === 1 && c.status === 'normal');
  const allCards = bag.filter(c => c.status === 'normal');
  const availableCards = mode === 'hexagram' ? singleFactorCards : allCards;

  const selectCardForSlot = (cardId: string) => {
    const idx = slots.findIndex(s => s === null);
    if (idx === -1) { addLog('⚠️ 槽位已满'); return; }
    const ns = [...slots];
    const ei = slots.indexOf(cardId);
    if (ei !== -1) ns[ei] = null;
    ns[idx] = cardId;
    setSlots(ns);
  };
  const removeFromSlot = (idx: number) => { const ns = [...slots]; ns[idx] = null; setSlots(ns); };
  const doFusion = () => {
    const filled = slots.filter(Boolean).map(s => s!);
    if (filled.length === 0) { addLog('⚠️ 至少放1张卡'); return; }
    let res;
    if (mode === 'hexagram') res = doHexagramFusion(filled);
    else {
      if (filled.length !== 2) { addLog('⚠️ 禁断融合需要2张卡'); return; }
      if (diamonds < 15) { addLog('💎 需要15钻石'); return; }
      res = doForbiddenFusion(filled[0], filled[1]);
    }
    if (!res) { addLog('⚠️ 融合失败'); return; }
    setResult(res); setNameEdit(res.card.name); setShowResult(true); setSlots(Array(6).fill(null));
  };
  const getCard = (cardId: string) => bag.find(c => c.id === cardId);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a1410' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={hexagramGlow ? ROOM_GLOW : ROOM_IMG} alt="炼药屋" className="w-full h-full object-cover" />
      </div>

      <button onClick={() => setPage('home')}
        className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl font-bold text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.3)' }}>← 回小屋</button>

      {/* 六芒星热区 */}
      <div
        className="absolute z-10 cursor-pointer transition-transform duration-200 hover:scale-105"
        style={{ left: `${HEX_X}%`, top: `${HEX_Y}%`, width: `${HEX_W}%`, height: `${HEX_H}%`, transform: 'translate(-50%, -50%)', borderRadius: '50%' }}
        onMouseEnter={() => setHexagramGlow(true)}
        onMouseLeave={() => setHexagramGlow(false)}
        onClick={() => { setShowFusion(true); setSlots(Array(6).fill(null)); }}
        title="点击开始炼成">
        {hexagramGlow && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none animate-pulse">
            <div className="text-3xl">🔮</div>
            <div className="text-sm font-bold text-white mt-2 whitespace-nowrap" style={{ textShadow: '0 0 12px rgba(180,130,255,0.9)' }}>点击开始炼成</div>
          </div>
        )}
      </div>

      {/* 融合浮层 */}
      {showFusion && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFusion(false); }}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(22,14,10,0.96) 0%, rgba(35,22,16,0.96) 100%)',
              borderRadius: 28,
              border: '1.5px solid rgba(180,140,100,0.25)',
              boxShadow: '0 0 60px rgba(130,80,200,0.12), 0 0 120px rgba(130,80,200,0.06), 0 24px 48px rgba(0,0,0,0.5)',
              padding: '28px 24px 24px',
              animation: 'bouncePop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
            <button onClick={() => setShowFusion(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg">✕</button>

            {/* 模式切换 */}
            <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <button onClick={() => { setMode('hexagram'); setSlots(Array(6).fill(null)); }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'hexagram' ? 'text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                style={mode === 'hexagram' ? { background: 'linear-gradient(135deg, #7e57c2, #5c3d99)' } : {}}>⭐ 六芒星</button>
              <button onClick={() => { setMode('forbidden'); setSlots(Array(2).fill(null)); }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'forbidden' ? 'text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                style={mode === 'forbidden' ? { background: 'linear-gradient(135deg, #c0392b, #8b0000)' } : {}}>💀 禁断</button>
            </div>

            {mode === 'hexagram' ? (
              <>
                {/* 六芒星阵 */}
                <div className="relative w-72 h-72 mb-4">
                  <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
                    <defs>
                      <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(160,120,240,0.12)" />
                        <stop offset="100%" stopColor="rgba(160,120,240,0)" />
                      </radialGradient>
                    </defs>
                    <circle cx="150" cy="150" r="145" fill="url(#hexGlow)" />
                    <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(160,130,240,0.3)" strokeWidth="1.2" strokeDasharray="6 4" />
                    <circle cx="150" cy="150" r="110" fill="none" stroke="rgba(160,130,240,0.15)" strokeWidth="0.8" />
                    {/* 六芒星双三角 */}
                    <polygon points="150,20 263,215 37,215" fill="none" stroke="rgba(160,130,240,0.45)" strokeWidth="1.8" strokeLinejoin="round" />
                    <polygon points="263,85 150,280 37,85" fill="none" stroke="rgba(160,130,240,0.45)" strokeWidth="1.8" strokeLinejoin="round" />
                    {/* 中心点 */}
                    <circle cx="150" cy="150" r="4" fill="rgba(160,130,240,0.5)" />
                    {/* 6顶点小圆 */}
                    {STAR_POINTS.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="22" fill="none" stroke="rgba(160,130,240,0.25)" strokeWidth="1" />
                    ))}
                  </svg>
                  {/* 6个卡槽 */}
                  {slots.map((cardId, idx) => {
                    const p = STAR_POINTS[idx];
                    const card = cardId ? getCard(cardId) : null;
                    return (
                      <div key={idx} className="absolute" style={{ left: p.x - 23, top: p.y - 23, zIndex: 10 }}>
                        <SlotMini card={card} idx={idx + 1} onRemove={() => removeFromSlot(idx)} />
                      </div>
                    );
                  })}
                </div>

                {/* 融合按钮 */}
                <Button variant="magic" onClick={doFusion} disabled={slots.every(s => s === null)} className="mb-3">
                  🔮 炼成 ({slots.filter(Boolean).length}/6)
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-8 h-40 mb-4">
                  {[0, 1].map(idx => {
                    const card = slots[idx] ? getCard(slots[idx]!) : null;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-bold text-red-400/70">{idx === 0 ? '母卡A' : '母卡B'}</div>
                        <SlotMini card={card} idx={idx + 1} onRemove={() => removeFromSlot(idx)} color="rgba(220,80,80,0.4)" />
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-white/30 mb-3">💎 消耗 15钻石</div>
                <Button variant="danger" onClick={doFusion} disabled={slots.every(s => s === null)} className="mb-3">
                  💀 禁断融合 ({slots.filter(Boolean).length}/2)
                </Button>
              </>
            )}

            {/* 卡片选择列表 */}
            <div className="w-full mt-2 pt-3 border-t border-white/5">
              <div className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                {mode === 'hexagram' ? '📦 单因子卡' : '📦 可用卡'} · {availableCards.length}
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {(() => {
                  const gm = new Map<string, { cards: typeof availableCards; fid: string; lv: string }>();
                  for (const c of availableCards) {
                    const fid = c.factors[0]?.id || '__unknown__';
                    const g = gm.get(fid); if (g) g.cards.push(c); else gm.set(fid, { cards: [c], fid, lv: c.factors[0]?.level || 'N' });
                  }
                  const LV: Record<string, number> = { N:0,R:1,SR:2,SSR:3,UR:4 };
                  const LN = ['N','R','SR','SSR','UR'];
                  const NM: Record<string, Record<number, string>> = {
                    '火':{1:'烈焰'},'水':{1:'激流'},'风':{1:'暴风'},'雷':{1:'雷霆'},
                    '冰':{1:'极寒'},'暗':{1:'暗影'},'光':{1:'圣光'},'地':{1:'岩石'},
                  };
                  return Array.from(gm.values()).map(g => {
                    const cnt = g.cards.length, fc = g.cards[0], ins = slots.includes(fc.id);
                    const li = LV[g.lv] || 0; let sp = '';
                    if (cnt >= 6) sp = `→${NM[g.fid]?.[Math.floor(cnt/6)] || LN[Math.min(li+Math.floor(cnt/6),4)]}`;
                    else if (cnt > 0) sp = `+${6-cnt}`;
                    return (
                      <div key={g.fid}
                        className={`p-1.5 rounded-lg cursor-pointer transition-all text-center ${ins ? 'opacity-25 bg-white/3' : 'hover:bg-white/8'}`}
                        onClick={() => { const n = g.cards.find(c => !slots.includes(c.id)); if (n) selectCardForSlot(n.id); }}>
                        <div className="text-xs font-bold text-white/70 truncate">{fc.name}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <FactorBadge factorId={fc.factors[0].id} level={fc.factors[0].level} />
                          <span className={`text-[10px] ${cnt >= 6 ? 'text-amber-400' : cnt >= 4 ? 'text-purple-400/60' : cnt >= 2 ? 'text-amber-400/50' : 'text-white/25'}`}>×{cnt}{sp}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
                {availableCards.length === 0 && <div className="col-span-3 text-center text-xs text-white/20 py-6">去学院买卡或副本铭刻</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 结果弹窗 */}
      <Modal open={showResult} onClose={() => setShowResult(false)}>
        {result && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--magic)' }}>🧪 炼成完成!</h2>
            {result.stackingLog && <div className="mb-2 text-sm font-bold" style={{ color: 'var(--copper)' }}>{result.stackingLog}</div>}
            {result.conflicts?.length > 0 && <div className="mb-2 text-sm" style={{ color: 'var(--alert)' }}>⚡ {result.conflicts.join(', ')}</div>}
            {result.title && <div className="mb-2 text-sm font-bold" style={{ color: 'var(--magic)' }}>🌟 {result.title}</div>}
            <div className="flex justify-center mb-4"><CardFrame card={result.card} /></div>
            <input value={nameEdit} onChange={e => setNameEdit(e.target.value)}
              className="text-center font-bold text-lg border-b-2 bg-transparent outline-none w-full mb-4" style={{ borderColor: 'var(--magic)', color: 'var(--ink)' }} />
            <div className="flex flex-wrap justify-center gap-1 mb-4">{result.card.factors.map((f: any) => <FactorBadge key={f.id} factorId={f.id} level={f.level} />)}</div>
            <Button variant="copper" onClick={() => {
              const s = useGameStore.getState(); const c = s.bag.find(x => x.id === result.card.id); if (c) c.name = nameEdit; setShowResult(false);
            }}>✅ 确定</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
