// ============================================
// 地图 HUD — 场景名 + 底部信息栏
// (React 叠层, 固定定位不随 Phaser 相机滚动)
// ============================================

interface Props {
  sceneName: string;
  areaName: string;
  onReturnHome: () => void;
}

export default function MapHUD({ sceneName, areaName, onReturnHome }: Props) {
  return (
    <>
      {/* 顶部场景名 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 1000, pointerEvents: 'none',
        display: 'flex', justifyContent: 'center',
        padding: '8px 0',
      }}>
        <div style={{
          background: 'rgba(255,255,240,0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '0 0 12px 12px',
          padding: '4px 24px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#5a4a3a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          letterSpacing: '1px',
        }}>
          ✦ {sceneName}
        </div>
      </div>

      {/* 底部区域名 + 返回 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '8px 16px',
      }}>
        <div style={{
          background: 'rgba(255,255,240,0.8)',
          borderRadius: '12px 12px 0 0',
          padding: '4px 16px',
          fontSize: '13px',
          color: '#6a5a4a',
        }}>
          📍 {areaName}
        </div>
        <button
          onClick={onReturnHome}
          style={{
            background: 'rgba(255,255,240,0.85)',
            border: '1px solid #c4b494',
            borderRadius: '12px 12px 0 0',
            padding: '4px 16px',
            fontSize: '13px',
            color: '#5a4a3a',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          🏠 回家
        </button>
      </div>

      {/* 操作提示 */}
      <div style={{
        position: 'fixed', bottom: 40, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000, pointerEvents: 'none',
        fontSize: '11px', color: '#5a4a3a',
        background: 'rgba(255,255,240,0.6)',
        padding: '2px 12px', borderRadius: '8px',
      }}>
        🎮 方向键/WASD 移动 ｜ 点击格子行走
      </div>
    </>
  );
}
