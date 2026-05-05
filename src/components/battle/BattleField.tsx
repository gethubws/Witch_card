// ============================================
// 魔女卡牌 — 战斗主界面 v2.1
// 拖拽攻击 + 点怪选目标 + 大面板
// ============================================
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { BattleCardView } from './BattleCardView';
import { BattleLogPanel } from './BattleLog';
import { Button } from '../ui';
import type { BattleCard, AnimType } from '../../types';

export const BattleField: React.FC = () => {
  const { battle, playerAction, enemyAction, endBattle, addLog, setPage } = useGameStore();
  const [logVisible, setLogVisible] = useState(false);
  // 交互状态 — 提到父级，让怪物卡片点击也能设目标
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  if (!battle) return null;
  const { phase, playerTeam, enemyTeam, currentTurn, activeIndex, actingSide, log, animQueue } = battle;

  // 伤害飘字
  const [dmgPopups, setDmgPopups] = useState<{ id: number; text: string; x: number; y: number; isCrit: boolean }[]>([]);
  const dmgRef = React.useRef(0);

  // 动画映射：uid → 动画类型
  const [animMap, setAnimMap] = useState<Record<string, AnimType>>({});
  useEffect(() => {
    if (animQueue.length === 0) return;
    const map: Record<string, AnimType> = {};
    for (const a of animQueue) {
      map[a.sourceId] = a.type;
      map[a.targetId] = 'shake';
    }
    setAnimMap(map);
    // 飘字
    const popups = animQueue.map(a => ({
      id: ++dmgRef.current, text: `${a.damage!}`, x: 50 + Math.random() * 20 - 10, y: 30,
      isCrit: a.isCrit || false
    }));
    setDmgPopups(popups);
    const t = setTimeout(() => { setAnimMap({}); setDmgPopups([]); }, 800);
    return () => clearTimeout(t);
  }, [animQueue]);

  if (phase === 'victory') return <VictoryScreen />;
  if (phase === 'defeat') return <DefeatScreen />;

  const activePlayer = playerTeam[activeIndex];
  const isPlayerTurn = actingSide === 'player';
  const aliveEnemies = enemyTeam.filter(e => e.currentHp > 0);

  // 拖放技能选择后直接执行
  const doAction = (skillIdx: number, targetIdx: number) => {
    playerAction(skillIdx, targetIdx);
    setSelectedSkill(null);
    setTimeout(() => enemyAction(), 600);
  };

  // 拖拽：玩家卡拖到敌人卡 → 普通攻击
  const handleDrop = (_playerIndex: number, aliveIdx: number) => {
    if (!isPlayerTurn) return;
    doAction(-1, aliveIdx);
  };

  // 点击敌人 → 选目标 + 当前有技能直接执行，否则准备选技能
  const handleEnemyTap = (aliveIdx: number) => {
    if (!isPlayerTurn) return;
    setSelectedTarget(aliveIdx);
    if (selectedSkill !== null) {
      doAction(selectedSkill, aliveIdx);
    }
  };

  return (
    <div className="fixed inset-0 battle-bg overflow-hidden flex flex-col items-center">
      {/* 伤害飘字层 */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {dmgPopups.map(p => (
          <div key={p.id} className="absolute animate-fly-damage"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              fontSize: p.isCrit ? 28 : 22,
              fontWeight: 900,
              color: p.isCrit ? '#ff4444' : '#ffe066',
              textShadow: p.isCrit ? '0 0 12px rgba(255,68,68,0.8)' : '0 0 6px rgba(0,0,0,0.5)',
              transform: 'translateX(-50%)',
            }}>
            {p.isCrit ? `💥${p.text}` : p.text}
          </div>
        ))}
      </div>
      <div className="w-full max-w-lg flex flex-col flex-1">
        {/* 顶栏 */}
        <div className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{ background: 'rgba(62,39,35,0.04)' }}>
          <Button variant="copper" small onClick={() => { endBattle(); setPage('home'); }}>🏃 逃跑</Button>
          <span className="text-sm font-bold" style={{ color: 'var(--magic)' }}>回合 {currentTurn}</span>
          <button className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(62,39,35,0.08)' }}
            onClick={() => setLogVisible(!logVisible)}>
            📜 日志
          </button>
        </div>

        {/* 上方弹性间距 */}
        <div className="flex-1 min-h-0" />

        {/* 敌方区域 */}
        <div className="flex justify-center gap-3">
          {enemyTeam.map((enemy, i) => {
            const aliveIdx = aliveEnemies.indexOf(enemy);
            const isTargeted = enemy.currentHp > 0 && aliveIdx === selectedTarget;
            return (
              <BattleCardView
                key={enemy.uid}
                bc={enemy}
                isPlayer={false}
                isActive={actingSide === 'enemy' && enemy.currentHp > 0}
                anim={animMap[enemy.uid] || undefined}
                isTargeted={isTargeted}
                onClick={() => aliveIdx >= 0 && handleEnemyTap(aliveIdx)}
                onDrop={(playerIdx) => aliveIdx >= 0 && handleDrop(playerIdx, aliveIdx)}
              />
            );
          })}
        </div>

        {/* 敌我间距 */}
        <div className="shrink-0" style={{ height: 29 }} />

        {/* 对战分隔线 */}
        <div className="relative h-0.5 mx-2 shrink-0">
          <div className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(126,87,194,0.12) 10%, rgba(126,87,194,0.22) 50%, rgba(126,87,194,0.12) 90%, transparent)',
            }}
          />
        </div>

        {/* 敌我间距 */}
        <div className="shrink-0" style={{ height: 29 }} />

        {/* 我方区域 */}
        <div className="flex justify-center gap-3">
          {playerTeam.map((bc, i) => (
            <BattleCardView
              key={bc.uid}
              bc={bc}
              isPlayer={true}
              isActive={isPlayerTurn && i === activeIndex}
              anim={animMap[bc.uid] || undefined}
              draggable={isPlayerTurn && i === activeIndex && bc.currentHp > 0}
              dragIndex={i}
            />
          ))}
        </div>

        {/* 下方弹性间距 */}
        <div className="flex-1 min-h-0" />

        {/* 操作面板 */}
        <div className="shrink-0">
          {isPlayerTurn && activePlayer && activePlayer.currentHp > 0 && (
            <ActionPanel
              bc={activePlayer}
              enemies={aliveEnemies}
              selectedSkill={selectedSkill}
              selectedTarget={selectedTarget}
              onSelectSkill={(idx) => {
                if (selectedTarget >= 0 && selectedTarget < aliveEnemies.length) {
                  doAction(idx, selectedTarget);
                } else {
                  setSelectedSkill(idx);
                }
              }}
              onSelectTarget={(idx) => {
                setSelectedTarget(idx);
                if (selectedSkill !== null) {
                  doAction(selectedSkill, idx);
                }
              }}
              onClear={() => { setSelectedSkill(null); }}
            />
          )}
          {actingSide === 'enemy' && (
            <div className="text-center py-4 text-sm opacity-50 animate-pulse">
              敌方行动中...
            </div>
          )}
        </div>
      </div>

      <BattleLogPanel log={log} visible={logVisible} onToggle={() => setLogVisible(!logVisible)} />
    </div>
  );
};

// ============ 操作面板 v2 — 大号版 ============
const ActionPanel: React.FC<{
  bc: BattleCard;
  enemies: BattleCard[];
  selectedSkill: number | null;
  selectedTarget: number;
  onSelectSkill: (idx: number) => void;
  onSelectTarget: (idx: number) => void;
  onClear: () => void;
}> = ({ bc, enemies, selectedSkill, selectedTarget, onSelectSkill, onSelectTarget, onClear }) => {
  const { blankEngraveCards, captureCards, useBattleItem, battle, playerDefend, enemyAction } = useGameStore();
  const [showItems, setShowItems] = useState(false);
  const skills = bc.card.skills || [];
  const stats = bc.card.stats || { atk: 0, mp: 0, maxMp: 0 };
  const itemUsed = battle?.itemUsedThisTurn;

  return (
    <div className="p-4 rounded-t-2xl"
      style={{
        background: 'rgba(244,236,216,0.95)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(212,165,116,0.25)',
        borderBottom: 'none',
        boxShadow: '0 -4px 24px rgba(62,39,35,0.06)',
      }}>
      {/* 行动角色名 */}
      <div className="text-center mb-3">
        <span className="font-bold text-base" style={{ color: 'var(--magic)' }}>
          🎯 {bc.card.name}
        </span>
        <span className="text-xs opacity-40 ml-2">
          MP {bc.currentMp}/{stats.maxMp}
        </span>
      </div>

      {/* 目标行 — 大按钮 */}
      <div className="mb-3">
        <div className="text-xs font-bold mb-2 opacity-50 text-center">👆 选择目标 (或直接点上方怪物)</div>
        <div className="flex gap-2 justify-center flex-wrap">
          {enemies.map((e, i) => (
            <button
              key={e.uid}
              className={`
                px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                ${selectedTarget === i
                  ? 'text-white shadow-lg scale-105'
                  : 'hover:scale-105'
                }
              `}
              style={selectedTarget === i
                ? { background: 'linear-gradient(135deg, var(--alert), #EF5350)', boxShadow: '0 4px 16px rgba(229,115,115,0.4)' }
                : { background: 'rgba(212,165,116,0.15)', color: 'var(--ink)', border: '1px solid rgba(212,165,116,0.25)' }
              }
              onClick={() => onSelectTarget(i)}
            >
              🎯 {e.card.name}
              <span className="block text-[10px] opacity-60 mt-0.5">HP {e.currentHp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 分隔 */}
      <div className="h-px mb-3 mx-4" style={{ background: 'rgba(126,87,194,0.1)' }} />

      {/* 技能行 — 大按钮 */}
      <div className="text-xs font-bold mb-2 opacity-50 text-center">⚡ 选择行动</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {/* 普通攻击 */}
        <button
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95
            ${selectedSkill === -1
              ? 'text-white shadow-lg'
              : ''
            }`}
          style={selectedSkill === -1
            ? { background: 'linear-gradient(135deg, var(--magic), #9C7CF4)', boxShadow: '0 4px 16px rgba(126,87,194,0.4)' }
            : { background: 'rgba(126,87,194,0.08)', color: 'var(--magic)', border: '1px solid rgba(126,87,194,0.2)' }
          }
          onClick={() => onSelectSkill(-1)}
        >
          <span className="block text-base mb-0.5">⚔️</span>
          普通攻击
          <span className="block text-[10px] opacity-50">ATK×1.0</span>
        </button>

        {/* 防御 */}
        <button
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95
            ${selectedSkill === -2
              ? 'text-white shadow-lg'
              : ''
            }`}
          style={selectedSkill === -2
            ? { background: 'linear-gradient(135deg, #5C9CE5, #3B7DD8)', boxShadow: '0 4px 16px rgba(92,156,229,0.4)' }
            : { background: 'rgba(92,156,229,0.08)', color: '#5C9CE5', border: '1px solid rgba(92,156,229,0.2)' }
          }
          onClick={() => { playerDefend(); onClear(); setTimeout(() => enemyAction(), 600); }}
        >
          <span className="block text-base mb-0.5">🛡️</span>
          防御
          <span className="block text-[10px] opacity-50">+5DEF +5HP +3MP</span>
        </button>

        {/* 技能 */}
        {skills.map((s, i) => (
          <button
            key={i}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200
              ${bc.currentMp < (s.mpCost || 0) ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              ${selectedSkill === i ? 'text-white shadow-lg' : ''}
            `}
            disabled={bc.currentMp < (s.mpCost || 0)}
            style={selectedSkill === i
              ? { background: 'linear-gradient(135deg, var(--magic), #9C7CF4)', boxShadow: '0 4px 16px rgba(126,87,194,0.4)' }
              : { background: 'rgba(126,87,194,0.08)', color: 'var(--magic)', border: '1px solid rgba(126,87,194,0.2)' }
            }
            onClick={() => onSelectSkill(i)}
          >
            <span className="block text-base mb-0.5">✨</span>
            {s.name}
            <span className="block text-[10px] opacity-50">{s.mpCost || 0}MP · {s.desc || s.effect}</span>
          </button>
        ))}

        {/* 取消 */}
        {selectedSkill !== null && (
          <button
            className="px-4 py-3 rounded-xl font-bold text-sm opacity-50 hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(62,39,35,0.06)', border: '1px solid rgba(62,39,35,0.1)' }}
            onClick={onClear}
          >
            ↩ 取消
          </button>
        )}
      </div>

      {/* 物品栏 */}
      <div className="h-px mb-3 mx-4" style={{ background: 'rgba(126,87,194,0.08)' }} />
      {!showItems ? (
        <div className="text-center">
          <button
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${itemUsed ? 'opacity-30' : 'hover:scale-105'}`}
            style={{ background: 'rgba(62,39,35,0.06)', border: '1px solid rgba(62,39,35,0.1)' }}
            disabled={itemUsed}
            onClick={() => setShowItems(true)}
          >
            🎒 物品栏 {itemUsed ? '(已使用)' : `(${blankEngraveCards + captureCards})`}
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs font-bold mb-2 opacity-50 text-center">🎒 使用物品 (消耗本回合攻击)</div>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            <button
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95
                ${blankEngraveCards <= 0 || itemUsed ? 'opacity-30 cursor-not-allowed' : ''}"
              disabled={blankEngraveCards <= 0 || itemUsed}
              style={{ background: 'rgba(212,165,116,0.15)', border: '1px solid rgba(212,165,116,0.3)' }}
              onClick={() => {
                useBattleItem('engrave', selectedTarget);
                setShowItems(false);
              }}
            >
              <span className="block text-base">📜</span>
              铭刻 (×{blankEngraveCards})
              <span className="block text-[10px] opacity-50">随机抽取1个因子</span>
            </button>
            <button
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95
                ${captureCards <= 0 || itemUsed ? 'opacity-30 cursor-not-allowed' : ''}`}
              disabled={captureCards <= 0 || itemUsed}
              style={{ background: 'rgba(126,87,194,0.1)', border: '1px solid rgba(126,87,194,0.25)' }}
              onClick={() => {
                useBattleItem('capture', selectedTarget);
                setShowItems(false);
              }}
            >
              <span className="block text-base">🎴</span>
              捕捉 (×{captureCards})
              <span className="block text-[10px] opacity-50">低血量时成功率更高</span>
            </button>
          </div>
          <div className="text-center">
            <button
              className="text-xs px-3 py-1 rounded-full opacity-40 hover:opacity-70"
              style={{ background: 'rgba(62,39,35,0.06)' }}
              onClick={() => setShowItems(false)}
            >↩ 关闭物品栏</button>
          </div>
        </div>
      )}

      {/* 提示 */}
      <div className="text-center mt-3">
        <span className="text-[10px] opacity-30">
          💡 拖拽卡片到怪物上 = 直接普攻 · 点怪物 = 选目标
        </span>
      </div>
    </div>
  );
};

// ============ 胜利画面 ============
const VictoryScreen: React.FC = () => {
  const { endBattle, setPage } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center battle-bg">
      <div className="glass-card text-center animate-bounce-pop max-w-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--magic)' }}>胜利!</h1>
        <p className="text-sm opacity-50 mb-4">战斗结束，卡牌完好</p>
        <Button variant="copper" onClick={() => { endBattle(); setPage('home'); }}>🧹 回小屋</Button>
      </div>
    </div>
  );
};

// ============ 失败画面 ============
const DefeatScreen: React.FC = () => {
  const { endBattle, setPage } = useGameStore();
  return (
    <div className="fixed inset-0 flex items-center justify-center battle-bg">
      <div className="glass-card text-center animate-bounce-pop max-w-sm">
        <div className="text-6xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--alert)' }}>战斗失败</h1>
        <p className="mb-4 opacity-70 text-sm">卡片重伤，需去医院花金币治疗</p>
        <Button variant="copper" onClick={() => { endBattle(); setPage('home'); }}>🧹 回小屋</Button>
      </div>
    </div>
  );
};
