import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { CHECKIN_REWARDS } from '../../data/gameData';

export default function CheckInOverlay() {
  const show     = useGameStore(s => s.showCheckIn);
  const streak   = useGameStore(s => s.checkInStreak);
  const claim    = useGameStore(s => s.claimCheckIn);
  const close    = useGameStore(s => s.closeCheckIn);

  if (!show) return null;

  const todayDay = (streak % 7) + 1;   // 오늘 받을 일차 (1~7)

  return (
    <div className="overlay-backdrop" onClick={close}>
      <div className="overlay-sheet" onClick={e => e.stopPropagation()}>
        <div className="overlay-title">📅 오늘의 출근 도장</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginBottom: 12 }}>
          매일 출근하고 가시 크리스탈을 받으세요!
        </div>

        <div className="checkin-grid">
          {CHECKIN_REWARDS.map(r => {
            const claimed = r.day < todayDay;
            const isToday = r.day === todayDay;
            return (
              <div
                key={r.day}
                className={`checkin-cell${claimed ? ' claimed' : ''}${isToday ? ' today' : ''}${r.boost ? ' special' : ''}`}
              >
                <div className="ci-day">{r.day}일차</div>
                <div className="ci-emoji">{r.boost ? '🎁' : '💎'}</div>
                <div className="ci-amt">{r.gems}</div>
                {claimed && <div className="ci-check">✓</div>}
              </div>
            );
          })}
        </div>

        <div className="overlay-btn-row">
          <button className="btn-3d btn-gem" style={{ flex: 1 }} onClick={claim}>
            🦔 {todayDay}일차 도장 받기
          </button>
        </div>
      </div>
    </div>
  );
}
