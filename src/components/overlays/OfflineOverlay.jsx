import { fmtNum } from '../../data/gameData.js';
import { useGameStore } from '../../store/gameStore.js';

export default function OfflineOverlay() {
  const offlineReward = useGameStore((state) => state.offlineReward);
  const closeOffline = useGameStore((state) => state.closeOffline);

  if (!offlineReward) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-icon">🌙</div>
        <h2>쉬는 동안 배달했어요</h2>
        <p>오프라인 보상 50%가 정산되었습니다.</p>
        <strong className="reward">🪙 {fmtNum(offlineReward)}</strong>
        <button className="big-button" type="button" onClick={closeOffline}>받기</button>
      </div>
    </div>
  );
}
