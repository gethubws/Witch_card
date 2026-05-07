// ============================================
// 魔女卡牌 — App 主组件
// ============================================
import React, { useState, useEffect } from 'react';
import { useGameStore } from './stores/useGameStore';
import { BagPanel } from './components/bag/BagPanel';
import { CauldronPage } from './components/cauldron/CauldronPage';
import { ShopPage } from './components/shop/ShopPage';
import { DungeonPage } from './components/battle/DungeonPage';
import { TeamSelect } from './components/battle/TeamSelect';
import { BattleField } from './components/battle/BattleField';
import { HospitalPage } from './components/hospital/HospitalPage';
import { WarehousePage } from './components/warehouse/WarehousePage';
import MapPage from './components/map/MapPage';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { Modal, Button } from './components/ui';
import { ALL_FACTORS } from './config/factors';

// 地图导航
const MAP_ITEMS = [
  { id: 'map' as const, icon: '🗺️', label: '史莱姆平原', desc: '探索战斗' },
  { id: 'cauldron' as const, icon: '🧪', label: '魔药屋', desc: '六芒星炼成' },
  { id: 'dungeon' as const, icon: '⚔️', label: '副本', desc: '打怪铭刻' },
  { id: 'shop' as const, icon: '🏫', label: '学院', desc: '买卡·工具' },
  { id: 'hospital' as const, icon: '🏥', label: '医院', desc: '治疗重伤卡' },
  { id: 'warehouse' as const, icon: '📦', label: '仓库', desc: '无限存储' },
];

const App: React.FC = () => {
  const { currentPage, setPage, gold, diamonds, bag, battle, pendingDungeonId, startBattle, load, save, logMessages, tutorialDone, newGame, blankEngraveCards, captureCards,
    defeatedMapGroups, pendingMapEnemies, pendingMapEntry, triggerMapEncounter, startMapBattle, finishMapBattle } = useGameStore();

  // debug only
  (window as any).__store = useGameStore;
  (window as any).__giveFactor = (factorId: string) => {
    const s = useGameStore.getState();
    const f = ALL_FACTORS[factorId];
    if (!f) { console.log('❌ Factor not found:', factorId); return; }
    const card = {
      id: `card_${Date.now()}`,
      name: f.id,
      factors: [f],
      imageUrl: null,
      stars: 1,
      status: 'normal' as const,
    };
    useGameStore.setState({ bag: [...s.bag, card] });
    console.log('✅ Added:', f.id, f.level);
  };
  const [showBag, setShowBag] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load().then(exists => {
      if (!exists) newGame();
      setLoaded(true);
    });
  }, []);

  // 自动存档
  useEffect(() => {
    if (!loaded) return;
    const timer = setInterval(() => save(), 30000);
    return () => clearInterval(timer);
  }, [loaded]);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4ECD8' }}>
      <div className="text-2xl animate-float">🔮 加载中...</div>
    </div>;
  }

  if (battle) return <BattleField />;
  if (currentPage === 'map') return (
    <MapPage
      onReturnHome={() => setPage('home')}
      onStartBattle={(enemies, groupName, isBoss) => {
        triggerMapEncounter(enemies, groupName, groupName || undefined);
      }}
      defeatedGroups={defeatedMapGroups}
    />
  );
  if (currentPage === 'cauldron') return <CauldronPage />;
  if (currentPage === 'shop') return <ShopPage />;
  if (currentPage === 'dungeon') return <DungeonPage />;
  if (currentPage === 'teamSelect') return pendingMapEntry ? (
    <TeamSelect
      dungeonId="slime_plains"
      onBack={() => { useGameStore.setState({ pendingMapEntry: false }); setPage('home'); }}
      onStart={(_team) => {
        useGameStore.setState({ pendingMapEntry: false });
        setPage('map');
      }}
    />
  ) : pendingMapEnemies ? (
    <TeamSelect
      dungeonId={pendingMapEnemies.length > 0 ? 'slime_plains' : pendingDungeonId || 'slime_plains'}
      onBack={() => setPage('map')}
      onStart={(team) => startMapBattle(team)}
    />
  ) : (
    <TeamSelect
      dungeonId={pendingDungeonId || 'slime_plains'}
      onBack={() => setPage('dungeon')}
      onStart={(team) => startBattle(team)}
    />
  );
  if (currentPage === 'hospital') return <HospitalPage />;
  if (currentPage === 'warehouse') return <WarehousePage />;

  // === 主界面：魔女的小屋 ===
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* 场景背景 */}
      <div className="absolute inset-0">
        <img src="/assets/scenes/home-room.png" alt="魔女小屋" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 100%)' }} />
      </div>
      {/* 顶部栏 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30" style={{
        display: 'flex', gap: 16, padding: '10px 24px',
        background: 'rgba(244,236,216,0.85)', backdropFilter: 'blur(12px)',
        borderRadius: 24, border: '1.5px solid rgba(212,165,116,0.3)',
        boxShadow: '0 4px 20px rgba(62,39,35,0.08)',
      }}>
        <span className="flex items-center gap-1 font-bold text-sm" style={{ color: 'var(--copper)' }}>💰 {gold}</span>
        <span className="flex items-center gap-1 font-bold text-sm" style={{ color: 'var(--magic)' }}>💎 {diamonds}</span>
        <span className="text-xs opacity-60">|</span>
        <span className="text-xs" title="空白铭刻卡">📜{blankEngraveCards}</span>
        <span className="text-xs" title="空白卡(捕捉)">🎴{captureCards}</span>
        <span className="flex items-center gap-1 font-bold text-sm opacity-50">🃏 {bag.length}/100</span>
      </div>

      {/* 主视觉 — 半透明叠加在小屋场景上 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-7xl mb-2 animate-float drop-shadow-lg">🧙‍♀️</div>
        <h1 className="text-3xl font-bold mb-1 text-current" style={{ fontFamily: 'Cinzel, serif' }}>
          魔女卡牌
        </h1>
        <p className="text-xs opacity-50 mb-6">Witch Card — 六芒星炼成</p>

        <div className="text-center max-w-sm mb-6 px-6 py-3 rounded-2xl"
          style={{ background: 'rgba(244,236,216,0.85)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(212,165,116,0.3)' }}>
          <p className="text-sm opacity-75">
            {bag.length === 0 ? '去学院买几张元素卡,然后用六芒星炼成你的第一张卡吧！' :
            bag.length < 6 ? `你有 ${bag.length} 张卡，凑齐6张单因子卡就可以炼成了~` :
            '材料够了，去魔药屋开始炼成！'}
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <Button variant="magic" onClick={() => setPage('cauldron')}>🧪 去魔药屋</Button>
          <Button variant="copper" onClick={() => setPage('dungeon')}>⚔️ 去打副本</Button>
        </div>
        <div className="flex gap-4">
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors" onClick={() => setShowIntro(true)}>📖 游戏介绍</button>
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors" onClick={() => setShowTutorial(true)}>🎓 新手教程</button>
        </div>
      </div>

      {/* 右下角按钮区 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        <button className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(244,236,216,0.85)', border: '2px solid rgba(212,165,116,0.3)', boxShadow: '0 4px 16px rgba(62,39,35,0.1)' }}
          onClick={() => setShowBag(!showBag)}>
          🎒
        </button>
        <button className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(244,236,216,0.85)', border: '2px solid rgba(212,165,116,0.3)', boxShadow: '0 4px 16px rgba(62,39,35,0.1)' }}
          onClick={() => setShowMap(!showMap)}>
          🗺️
        </button>
      </div>

      {/* 背包浮层 */}
      {showBag && <BagPanel onClose={() => setShowBag(false)} />}

      {/* 地图浮层 */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/10" onClick={() => setShowMap(false)} />
          <div className="relative w-64 p-4 animate-fade-up" style={{
            background: 'rgba(244,236,216,0.95)', borderLeft: '1.5px solid rgba(212,165,116,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--ink)' }}>🗺️ 地图</h2>
            {MAP_ITEMS.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 mb-2 transition-all"
                onClick={() => {
                  if (item.id === 'map') {
                    const s = useGameStore.getState();
                    if (s.bag.filter(c => c.status === 'normal').length === 0) {
                      s.addLog('⚠️ 没有可用的卡片，先去融合几张吧');
                    } else {
                      useGameStore.setState({ pendingMapEntry: true });
                      setPage('teamSelect');
                    }
                  } else {
                    setPage(item.id);
                  }
                  setShowMap(false);
                }}>
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs opacity-50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 控制台日志 */}
      <div className="fixed bottom-24 left-4 max-w-xs z-20 opacity-40 hover:opacity-100 transition-opacity">
        {logMessages.slice(-3).map((m, i) => (
          <div key={i} className="text-xs mb-1">{m}</div>
        ))}
      </div>

      {/* 游戏介绍弹窗 */}
      <Modal open={showIntro} onClose={() => setShowIntro(false)}>
        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--magic)' }}>🧙 魔女卡牌</h2>
        <div className="text-sm space-y-2 opacity-70">
          <p>你是一位见习魔女，唯一的本事是<strong>炼成卡片</strong>。</p>
          <p><strong>获取因子</strong>: 从学院买元素卡，或带铭刻卡去副本抽取怪物因子。</p>
          <p><strong>六芒星炼成</strong>: 6张单因子卡放入六芒星阵 → 产出成品卡。对立因子会融合成稀有词！</p>
          <p><strong>禁断融合</strong>: 2张成品卡赌继承（后续版本开放）。</p>
          <p><strong>战斗</strong>: 带3张卡组队，手动回合制战斗。</p>
          <p className="font-bold" style={{ color: 'var(--alert)' }}>🌟 试试看：买6张元素卡 → 去魔药屋炼成！</p>
        </div>
      </Modal>

      {/* 新手教程 */}
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default App;
