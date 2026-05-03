// ============================================
// 魔女卡牌 — 副本 & 战斗页面
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button, Modal } from '../ui';
import { DUNGEONS } from '../../config/shops';
import { MONSTER_MAP } from '../../config/monsters';

export const DungeonPage: React.FC = () => {
  const { unlockedAreas, startBattle, setPage } = useGameStore();
  const available = DUNGEONS.filter(d => unlockedAreas.includes(d.id));

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d1117' }}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="copper" onClick={() => setPage('home')}>← 回小屋</Button>
        <h1 className="text-2xl font-bold text-white/90">⚔️ 副本</h1>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {available.map(d => (
          <div key={d.id} className="cursor-pointer hover:scale-105 transition-transform p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => startBattle(d.id)}>
            <div className="text-lg font-bold text-white/90">{d.name}</div>
            <div className="text-xs text-white/40 mt-1">{d.description}</div>
            <div className="mt-2">
              <span className={`factor-tag factor-tag-${d.difficulty === 'SSR' ? 'SSR' : d.difficulty === 'SR' ? 'SR' : d.difficulty === 'R' ? 'R' : 'N'}`}>
                {d.difficulty}
              </span>
            </div>
            {d.bossMonster && (
              <div className="text-xs mt-1 text-red-300/80">👹 BOSS: {MONSTER_MAP[d.bossMonster]?.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BattlePage: React.FC = () => {
  const { battle, playerAction, endBattle, addLog, setPage, engraveMonster } = useGameStore();
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  if (!battle) return <div className="p-6 text-center" style={{ background: '#F4ECD8' }}><Button variant="copper" onClick={() => setPage('home')}>回小屋</Button></div>;

  if (battle.phase === 'victory') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4ECD8' }}>
      <div className="text-center animate-bounce-pop">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--magic)' }}>胜利!</h1>
        {battle.canEngrave && battle.engraveTarget && (
          <div className="mb-4">
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--magic)' }}>📜 铭刻 {battle.engraveTarget.name}（只能一次！）</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant="magic" onClick={() => { const fid = engraveMonster(battle.engraveTarget!.id, 'copper'); if (fid) addLog(`📜 铭刻: ${fid}`); }}>📜 铜 (N)</Button>
              <Button variant="magic" onClick={() => { const fid = engraveMonster(battle.engraveTarget!.id, 'silver'); if (fid) addLog(`📜 铭刻: ${fid}`); }}>📜 银 (≤R)</Button>
              <Button variant="magic" onClick={() => { const fid = engraveMonster(battle.engraveTarget!.id, 'gold'); if (fid) addLog(`📜 铭刻: ${fid}`); }}>📜 金 (≤SR)</Button>
            </div>
          </div>
        )}
        <Button variant="copper" onClick={endBattle}>回小屋</Button>
      </div>
    </div>
  );

  if (battle.phase === 'defeat') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4ECD8' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--alert)' }}>战斗失败</h1>
        <p className="mb-4 opacity-70">卡片重伤，需去医院花金币治疗</p>
        <Button variant="copper" onClick={endBattle}>回小屋</Button>
      </div>
    </div>
  );

  const active = battle.playerTeam[battle.activeIndex];
  const enemy = battle.enemyTeam[0];
  const skills = active?.card.skills || [];

  const doAction = () => {
    if (selectedSkill === null || selectedTarget === null) return;
    playerAction(selectedSkill, selectedTarget);
    setSelectedSkill(null);
    setSelectedTarget(null);
  };

  return (
    <div className="min-h-screen p-4" style={{ background: '#F4ECD8' }}>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{enemy?.card.name}</div>
        <div className="w-48 h-3 mx-auto rounded-full bg-gray-200">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, (enemy?.currentHp || 0) / (enemy?.card.stats?.maxHp || 100) * 100)}%`, background: 'var(--alert)' }} />
        </div>
        <div className="text-xs mt-1">{enemy?.currentHp}/{enemy?.card.stats?.maxHp}</div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {battle.playerTeam.map((bc, i) => (
          <div key={i} className={`glass-card text-center w-32 ${i === battle.activeIndex ? 'ring-2' : ''}`}
            style={i === battle.activeIndex ? { borderColor: 'var(--magic)', boxShadow: '0 0 12px rgba(126,87,194,0.4)' } : {}}>
            <div className="text-sm font-bold truncate">{bc.card.name}</div>
            <div className="w-full h-2 rounded-full bg-gray-200 mt-1">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, bc.currentHp / (bc.card.stats?.maxHp || 100) * 100)}%`, background: 'var(--heal)' }} />
            </div>
            <div className="text-xs">{bc.currentHp}/{bc.card.stats?.maxHp}</div>
            <div className="text-xs opacity-50">MP: {bc.currentMp}/{bc.card.stats?.maxMp}</div>
            <div className="text-xs opacity-50">{bc.position === 'front' ? '前排' : '后排'}</div>
          </div>
        ))}
      </div>

      {active && active.currentHp > 0 && (
        <div className="max-w-md mx-auto">
          <div className="text-sm font-bold mb-2">🎯 {active.card.name} — 选技能:</div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button className={`btn btn-sm ${selectedSkill === -1 ? 'btn-magic' : 'btn-copper'}`} onClick={() => setSelectedSkill(-1)}>⚔️ 普通攻击</button>
            {skills.map((s, i) => (
              <button key={i} className={`btn btn-sm ${selectedSkill === i ? 'btn-magic' : 'btn-copper'}`} disabled={active.currentMp < (s.mpCost || 0)} onClick={() => setSelectedSkill(i)}>
                ✨ {s.name} ({s.mpCost || 0}MP)
              </button>
            ))}
          </div>

          {selectedSkill !== null && (
            <>
              <div className="text-sm font-bold mb-2">选目标:</div>
              <div className="flex gap-2 mb-3">
                {battle.enemyTeam.filter(e => e.currentHp > 0).map((e, i) => (
                  <button key={i} className={`btn btn-sm ${selectedTarget === i ? 'btn-danger' : 'btn-copper'}`} onClick={() => setSelectedTarget(i)}>{e.card.name}</button>
                ))}
              </div>
            </>
          )}
          <Button variant="magic" onClick={doAction} disabled={selectedSkill === null || selectedTarget === null}>⚔️ 行动!</Button>
        </div>
      )}

      <div className="mt-6 max-w-md mx-auto">
        {battle.log.slice(-3).map((l, i) => <div key={i} className="text-xs opacity-50">{l.turn}: {l.actor} {l.action} → {l.target} {l.result}</div>)}
      </div>
    </div>
  );
};
