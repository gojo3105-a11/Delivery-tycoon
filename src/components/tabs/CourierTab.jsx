import { RARITY, fmtNum } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function CourierTab() {
  const couriers = useGameStore((state) => state.couriers);
  const coins = useGameStore((state) => state.coins);
  const gems = useGameStore((state) => state.gems);
  const recruit = useGameStore((state) => state.recruit);

  return (
    <section className="courier-panel">
      <div className="recruit-row">
        <button className="big-button" type="button" disabled={coins < 500} onClick={() => recruit(false)}>
          일반 모집 <span>🪙 500</span>
        </button>
        <button className="big-button gem-button" type="button" disabled={gems < 300} onClick={() => recruit(true)}>
          프리미엄 <span>💎 300</span>
        </button>
      </div>
      <div className="collection-head">
        <strong>보유 배달원</strong>
        <span>{couriers.length}/80</span>
      </div>
      <div className="courier-grid">
        {couriers.length === 0 && <div className="empty">배달원을 모집하면 수익 배수가 올라가요.</div>}
        {couriers.map((courier) => {
          const rarity = RARITY[courier.rarity];
          return (
            <article className="courier-card" key={courier.id} style={{ '--rarity': rarity.color, '--rarity-bg': rarity.bg }}>
              <div className="courier-face">🦔</div>
              <strong>{courier.name}</strong>
              <span>{rarity.name}</span>
              <em>+{fmtNum((courier.bonus || 0) * 100)}%</em>
            </article>
          );
        })}
      </div>
    </section>
  );
}
