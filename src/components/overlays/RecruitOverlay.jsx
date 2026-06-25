import { RARITY } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function RecruitOverlay() {
  const courier = useGameStore((state) => state.recruitResult);
  const closeRecruit = useGameStore((state) => state.closeRecruit);

  if (!courier) return null;
  const rarity = RARITY[courier.rarity];
  return (
    <div className="overlay">
      <div className="modal recruit-modal" style={{ '--rarity': rarity.color, '--rarity-bg': rarity.bg }}>
        <div className="modal-icon">🦔</div>
        <h2>{courier.name}</h2>
        <p className="rarity-label">{rarity.name} 배달원</p>
        <strong className="reward">수익 +{((courier.bonus || 0) * 100).toFixed(1)}%</strong>
        <button className="big-button" type="button" onClick={closeRecruit}>확인</button>
      </div>
    </div>
  );
}
