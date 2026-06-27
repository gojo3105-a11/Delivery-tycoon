import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { calcPrestigeBadges } from '../../data/gameData';

export default function PrestigeOverlay() {
  const show         = useGameStore(s => s.showPrestige);
  const close        = useGameStore(s => s.closePrestige);
  const prestige     = useGameStore(s => s.prestige);
  const prestigeLevel = useGameStore(s => s.prestigeLevel);
  const totalEarned  = useGameStore(s => s.totalEarned);
  const couriers     = useGameStore(s => s.couriers);

  if (!show) return null;

  const earnBadges = calcPrestigeBadges(totalEarned);
  const nextMul = Math.min(1 + (prestigeLevel + earnBadges) * 0.05, 10);

  return (
    <div className="overlay-backdrop" onClick={close}>
      <div className="overlay-sheet" onClick={e => e.stopPropagation()}>
        <div className="overlay-title">🏗️ 도시 재개발 (대이동)</div>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48 }}>🏅</div>
          <div style={{ fontSize: 15, color: 'var(--text2)', marginTop: 10, lineHeight: 1.6 }}>
            도토리 코인, 시설, 구역이 초기화됩니다.<br />
            배달원과 가시 크리스탈은 유지됩니다.
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginTop: 14 }}>
            🏅 가시 뱃지 +{earnBadges}개 획득
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>
            영구 배율 ×{(Math.min(1 + prestigeLevel * 0.05, 10)).toFixed(2)} → ×{nextMul.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            보유 뱃지: {prestigeLevel}개 → {prestigeLevel + earnBadges}개
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            배달원 {couriers.length}명 유지됨
          </div>
        </div>
        <div className="overlay-btn-row">
          <button className="btn-3d btn-orange" style={{ background: '#EEE', color: '#444', boxShadow: '0 4px 0 #CCC' }} onClick={close}>
            취소
          </button>
          <button className="btn-3d btn-orange" onClick={prestige}>
            재개발 시작 🏗️
          </button>
        </div>
      </div>
    </div>
  );
}
