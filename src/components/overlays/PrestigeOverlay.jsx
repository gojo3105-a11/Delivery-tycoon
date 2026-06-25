import { fmtNum } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function PrestigeOverlay() {
  const open = useGameStore((state) => state.prestigeOpen);
  const totalEarned = useGameStore((state) => state.totalEarned);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const prestige = useGameStore((state) => state.prestige);
  const closePrestige = useGameStore((state) => state.closePrestige);
  const ready = totalEarned >= 1e6;

  if (!open) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" type="button" onClick={closePrestige}>×</button>
        <div className="modal-icon">↻</div>
        <h2>환생</h2>
        <p>코인, 시설, 지역은 초기화되고 보석과 배달원은 유지됩니다.</p>
        <div className="stat-box">
          <span>현재 총 수익</span>
          <strong>{fmtNum(totalEarned)}</strong>
        </div>
        <div className="stat-box">
          <span>다음 영구 배수</span>
          <strong>x{(1 + (prestigeLevel + 1) * 0.05).toFixed(2)}</strong>
        </div>
        <button className="big-button" type="button" disabled={!ready} onClick={prestige}>
          {ready ? '환생하기' : '총 수익 1M 필요'}
        </button>
      </div>
    </div>
  );
}
