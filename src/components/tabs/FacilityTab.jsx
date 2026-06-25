import { FAC, facilityCost, facilityRps, fmtNum } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function FacilityTab() {
  const fac = useGameStore((state) => state.fac);
  const coins = useGameStore((state) => state.coins);
  const buyFacility = useGameStore((state) => state.buyFacility);

  return (
    <section className="panel-list">
      {FAC.map((facility) => {
        const level = fac[facility.id] || 0;
        const cost = facilityCost(facility, level);
        const canBuy = coins >= cost;
        const progress = Math.min(100, (coins / cost) * 100);
        return (
          <article className="item-card" key={facility.id}>
            <div className="item-icon">{facility.emoji}</div>
            <div className="item-main">
              <div className="item-title">
                <strong>{facility.name}</strong>
                <span>Lv.{level}</span>
              </div>
              <div className="item-meta">초당 +{fmtNum(facilityRps(facility, level))}</div>
              <div className="progress">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button className="buy-button" type="button" disabled={!canBuy} onClick={() => buyFacility(facility.id)}>
              🪙 {fmtNum(cost)}
            </button>
          </article>
        );
      })}
    </section>
  );
}
