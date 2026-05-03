// ============================================
// 魔女卡牌 — 新手引导
// ============================================
import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Button } from '../ui';

const STEPS = [
  {
    title: '🧙‍♀️ 欢迎，见习魔女！',
    content: '你欠了学院 300 铜币的材料费。唯一的本事是「炼成卡片」——把元素、怪物魂魄、魔法词缀扔进坩埚，融合成全新的魔法卡牌。',
  },
  {
    title: '🏫 第一步：获取因子',
    content: '去学院购买几张元素卡（火/水/风/雷等 8 种自选）。每张卡只含 1 个因子，是炼成的基础材料。也可以去副本铭刻怪物获得稀有因子。',
  },
  {
    title: '🧪 第二步：六芒星炼成',
    content: '收集 6 张单因子卡，去魔药屋放入六芒星阵。全因子必定继承，产出一张成品卡。如果碰巧放入了对立因子（如火+水），它们会融合成稀有因子！',
  },
  {
    title: '⚔️ 第三步：组队战斗',
    content: '带 3 张卡组队进入副本。前排（主力）承受 60% 火力，后排两位辅助输出/治疗。全手动回合制——选技能、选目标、看效果。',
  },
  {
    title: '📜 第四步：铭刻怪物',
    content: '买铭刻卡 → 进副本击败怪物 → 铭刻抽因子。每次铭刻消耗 1 张铭刻卡，随机获取怪物的 1 个因子。铜/银/金铭刻卡对应不同等级。',
  },
  {
    title: '🌟 进阶提示',
    content: '· 背包满了会自动存仓库 · 战斗失败不撕卡，去医院花金币治疗 · 因子组合会产生隐藏技能 · 同卡升星可以自选新因子 · 禁断融合是赌狗路线（高风险高回报）',
  },
];

export const TutorialOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onClose();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 animate-bounce-pop" style={{
        background: 'rgba(244,236,216,0.97)',
        borderRadius: 20,
        border: '2px solid rgba(212,165,116,0.4)',
        boxShadow: '0 16px 48px rgba(62,39,35,0.25)',
        padding: 32,
      }}>
        {/* 进度 */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: i <= step ? 'var(--magic)' : 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>

        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--magic)' }}>
          {STEPS[step].title}
        </h2>
        
        <p className="text-sm opacity-70 leading-relaxed mb-6">
          {STEPS[step].content}
        </p>

        <div className="flex justify-between items-center">
          <button className="text-xs opacity-40 hover:opacity-70" onClick={prev} disabled={step === 0}>
            ← 上一步
          </button>
          <div className="text-xs opacity-40">{step + 1}/{STEPS.length}</div>
          <Button variant="magic" onClick={next}>
            {step < STEPS.length - 1 ? '下一步 →' : '🎉 开始冒险！'}
          </Button>
        </div>

        <button className="block mx-auto mt-3 text-xs opacity-30 hover:opacity-60" onClick={onClose}>
          跳过教程
        </button>
      </div>
    </div>
  );
};
