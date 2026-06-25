import { ZONES, fmtNum } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function ZoneTab() {
  const coins = useGameStore((state) => state.coins);
  const unlockedZones = useGameStore((state) => state.unlockedZones);
  const unlockZone = useGameStore((state) => state.unlockZone);

  return (
    <section className="panel-list">
      {ZONES.map((zone, index) => {
        const unlocked = unlockedZones.includes(zone.id);
        const previous = index === 0 || unlockedZones.includes(ZONES[index - 1].id);
        const lockedByOrder = !previous;
        return (
          <article className={`item-card ${unlocked ? 'done' : ''}`} key={zone.id}>
            <div className="item-icon">{zone.emoji}</div>
            <div className="item-main">
              <div className="item-title">
                <strong>{zone.name}</strong>
                <span>x{zone.mul}</span>
              </div>
              <div className="item-meta">{unlocked ? '운영 중' : lockedByOrder ? '이전 지역 필요' : '새 배달권역 해금'}</div>
              <div className="progress">
                <i style={{ width: unlocked ? '100%' : `${Math.min(100, (coins / zone.unlockCost) * 100)}%` }} />
              </div>
            </div>
            <button
              className="buy-button green"
              type="button"
              disabled={unlocked || lockedByOrder || coins < zone.unlockCost}
              onClick={() => unlockZone(zone.id)}
            >
              {unlocked ? '완료' : `🪙 ${fmtNum(zone.unlockCost)}`}
            </button>
          </article>
        );
      })}
    </section>
  );
}
