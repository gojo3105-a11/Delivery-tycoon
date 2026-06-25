import { fmtNum } from '../data/gameData.js';
import { useGameStore } from '../store/gameStore.js';

export default function Header() {
  const coins = useGameStore((state) => state.coins);
  const gems = useGameStore((state) => state.gems);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const openPrestige = useGameStore((state) => state.openPrestige);
  const rps = useGameStore((state) => state.totalRps);

  return (
    <header className="topbar">
      <div className="brand">
        <strong>고슴도치 배달 타이쿤</strong>
        <span>초당 {fmtNum(rps)} 코인</span>
      </div>
      <div className="wallet">
        <span className="pill coin">🪙 {fmtNum(coins)}</span>
        <span className="pill gem">💎 {fmtNum(gems)}</span>
        <button className="icon-button prestige" type="button" onClick={openPrestige} title="환생">
          ↻ {prestigeLevel}
        </button>
      </div>
    </header>
  );
}
