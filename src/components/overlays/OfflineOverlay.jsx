import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { fmtNum } from '../../data/gameData';

export default function OfflineOverlay() {
  const reward  = useGameStore(s => s.offlineReward);
  const dismiss = useGameStore(s => s.dismissOffline);

  if (!reward) return null;

  const hours = Math.floor(reward.secs / 3600);
  const mins  = Math.floor((reward.secs % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;

  return (
    <div className="overlay-backdrop" onClick={dismiss}>
      <div className="overlay-sheet" onClick={e => e.stopPropagation()}>
        <div className="overlay-title">오프라인 수익 💤</div>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48 }}>📦</div>
          <div style={{ fontSize: 16, marginTop: 10, color: 'var(--text2)' }}>
            {timeStr} 동안 쉬는 사이…
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', marginTop: 8 }}>
            +🪙 {fmtNum(reward.coins)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            효율 50% 적용됨
          </div>
        </div>
        <div className="overlay-btn-row">
          <button className="btn-3d btn-orange" onClick={dismiss}>
            수령하기 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
