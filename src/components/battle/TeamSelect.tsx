// ============================================
// 魔女卡牌 — 编队选择页面
// 进入副本前：选3张卡 + 分配前后排
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button, CardFrame } from '../ui';
import { DUNGEONS } from '../../config/shops';
import { MONSTER_MAP } from '../../config/monsters';
import type { Card, TeamPosition } from '../../types';

interface Props {
  dungeonId: string;
  onBack: () => void;
  onStart: (team: { cardId: string; position: TeamPosition }[]) => void;
}

const POS_SLOTS: TeamPosition[] = ['supportA', 'front', 'supportB'];
const POS_LABELS: Record<TeamPosition, string> = { supportA: '辅助A', front: '前排主力', supportB: '辅助B' };
const POS_ICONS: Record<TeamPosition, string> = { supportA: '🛡️', front: '⚔️', supportB: '💊' };

export const TeamSelect: React.FC<Props> = ({ dungeonId, onBack, onStart }) => {
  const { bag } = useGameStore();
  const [team, setTeam] = useState<{ cardId: string | null; position: TeamPosition }[]>([
    { position: 'supportA', cardId: null },
    { position: 'front', cardId: null },
    { position: 'supportB', cardId: null },
  ]);

  const dungeon = DUNGEONS.find(d => d.id === dungeonId);
  const available = bag.filter(c => c.status === 'normal');
  const selectedIds = new Set(team.map(t => t.cardId).filter(Boolean) as string[]);

  // 点背包卡 → 放入第一个空位
  const selectCard = (card: Card) => {
    if (selectedIds.has(card.id)) {
      // 已选 → 取消
      setTeam(prev => prev.map(t => t.cardId === card.id ? { ...t, cardId: null } : t));
      return;
    }
    const empty = team.findIndex(t => t.cardId === null);
    if (empty === -1) return;
    setTeam(prev => prev.map((t, i) => i === empty ? { ...t, cardId: card.id } : t));
  };

  // 从编队移除
  const removeFromTeam = (pos: TeamPosition) => {
    setTeam(prev => prev.map(t => t.position === pos ? { ...t, cardId: null } : t));
  };

  // 换位
  const swapSlots = (posA: TeamPosition, posB: TeamPosition) => {
    setTeam(prev => {
      const a = prev.find(t => t.position === posA)!;
      const b = prev.find(t => t.position === posB)!;
      return prev.map(t => {
        if (t.position === posA) return { ...t, cardId: b.cardId };
        if (t.position === posB) return { ...t, cardId: a.cardId };
        return t;
      });
    });
  };

  const canStart = team.some(t => t.cardId !== null);

  const doStart = () => {
    const valid = team.filter(t => t.cardId !== null) as { cardId: string; position: TeamPosition }[];
    if (valid.length === 0) return;
    onStart(valid);
  };

  // 预览副本怪物
  const previewMonsters = dungeon ? [
    ...dungeon.monsters.map(mid => MONSTER_MAP[mid]).filter(Boolean),
  ] : [];

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: 'var(--parchment)' }}>
      <div className="w-full max-w-lg space-y-5">
        {/* 顶栏 */}
        <div className="flex items-center justify-between">
          <Button variant="copper" onClick={onBack}>← 回副本列表</Button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>📋 编队选择</h1>
          <div className="w-20" />
        </div>
        {/* 副本信息 */}
        {dungeon && (
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-3">
              <span className={`factor-tag factor-tag-${dungeon.difficulty === 'SSR' ? 'SSR' : dungeon.difficulty === 'SR' ? 'SR' : dungeon.difficulty === 'R' ? 'R' : 'N'}`}>
                {dungeon.difficulty}
              </span>
              <span className="font-bold text-lg">{dungeon.name}</span>
            </div>
            <p className="text-sm opacity-60 mb-3">{dungeon.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs opacity-50">可能出现：</span>
              {previewMonsters.map(m => (
                <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-black/5">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 编队区 — 三列并排 */}
        <div className="glass-card">
          <h3 className="font-bold text-sm mb-4 text-center" style={{ color: 'var(--ink)' }}>
            ═══ 出战编队 ═══
          </h3>
          <div className="flex justify-center gap-4">
            {team.map(slot => {
              const card = bag.find(c => c.id === slot.cardId);
              return (
                <div key={slot.position} className="flex flex-col items-center">
                  <div
                    className={`team-slot ${card ? 'filled' : ''} w-36 h-56 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105`}
                    onClick={() => !card && removeFromTeam(slot.position)}
                  >
                    {card ? (
                      <div onClick={() => removeFromTeam(slot.position)} className="relative w-full h-full">
                        <CardFrame card={card} small />
                        <button
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors"
                          onClick={(e) => { e.stopPropagation(); removeFromTeam(slot.position); }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <span className="text-3xl">{POS_ICONS[slot.position]}</span>
                        <span className="text-xs font-bold">{POS_LABELS[slot.position]}</span>
                        <span className="text-[10px]">点击选卡</span>
                      </div>
                    )}
                  </div>
                  {/* 换位按钮 */}
                  {card && (
                    <div className="flex gap-1 mt-2">
                      {POS_SLOTS.filter(p => p !== slot.position).map(p => (
                        <button
                          key={p}
                          className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                          onClick={() => swapSlots(slot.position, p)}
                        >
                          ⇄ {POS_LABELS[p].slice(0, 2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 背包卡片选择 */}
        <div className="glass-card">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>
            🃏 背包 ({available.length} 张可用)
          </h3>
          {available.length === 0 ? (
            <p className="text-sm opacity-50 text-center py-4">没有可用卡片，先去融合或购买几张吧</p>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {available.map(card => {
                const isSelected = selectedIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'scale-105 brightness-110' : 'hover:scale-105'}`}
                    onClick={() => selectCard(card)}
                    style={{ opacity: isSelected ? 1 : 0.75 }}
                  >
                    <CardFrame card={card} small />
                    {isSelected && (
                      <div className="text-center mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          已编入 {POS_LABELS[team.find(t => t.cardId === card.id)?.position || 'front'].slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 出发按钮 */}
        <div className="text-center">
          <Button
            variant="magic"
            disabled={!canStart}
            onClick={doStart}
            className="text-lg px-10 py-3"
          >
            ⚔️ 出发! ({team.filter(t => t.cardId).length}/3)
          </Button>
          {!canStart && <p className="text-xs opacity-40 mt-2">至少选1张卡才能出发</p>}
        </div>
      </div>
    </div>
  );
};
