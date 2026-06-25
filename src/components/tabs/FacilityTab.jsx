import React, { useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { FAC, getFacCost, getFacRPS, fmtNum, PRESTIGE_THRESHOLD } from '../../data/gameData';

export default function FacilityTab() {
  const coins        = useGameStore(s => s.coins);
  const facLevels    = useGameStore(s => s.facLevels);
  const buyFac       = useGameStore(s => s.buyFac);
  const totalEarned  = useGameStore(s => s.totalEarned);
  const openPrestige = useGameStore(s => s.openPrestige);
  const prestigeLevel = useGameStore(s => s.prestigeLevel);

  const canPrestige = totalEarned >= PRESTIGE_THRESHOLD;

  const activeTab = useGameStore(s => s.activeTab);

  return (
    <div className={`tab-panel${activeTab === 'fac' ? ' active' : ''}`} id="tab-fac">
      {canPrestige && (
        <div className="prestige-banner">
          <h3>✨ 명성 전환 가능!</h3>
          <p>수익 보너스 +{(prestigeLevel + 1) * 5}%를 영구 획득합니다</p>
          <button className="btn-3d btn-orange" style={{ marginTop: 10, width: '100%' }} onClick={openPrestige}>
            명성 전환하기
          </button>
        </div>
      )}

      <p className="section-heading">시설 업그레이드</p>
      {FAC.map(fac => {
        const level = facLevels[fac.id] || 0;
        const cost  = getFacCost(fac, level);
        const rps   = level > 0 ? getFacRPS(fac, level) : 0;
        const canBuy = coins >= cost;
        const progress = level > 0
          ? ((coins / getFacCost(fac, level)) * 100)
          : (coins / cost * 100);
        const pct = Math.min(progress, 100);

        return (
          <div key={fac.id} className="card">
            <div className="fac-card">
              <span className="fac-emoji">{fac.emoji}</span>
              <div className="fac-info">
                <div className="fac-name">{fac.name}</div>
                <div className="fac-rps">
                  {level > 0 ? `${fmtNum(rps)}/s` : '구매시 활성화'}
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="fac-level-badge">Lv.{level}</div>
              </div>
              <button
                className={`btn-3d ${canBuy ? 'btn-orange' : 'btn-orange'}`}
                disabled={!canBuy}
                onClick={() => buyFac(fac.id)}
                style={{ minWidth: 80 }}
              >
                🪙 {fmtNum(cost)}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
