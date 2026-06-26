import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY, BASIC_RATES, PREMIUM_RATES, fmtNum } from '../../data/gameData';

export default function RecruitOverlay() {
  const show        = useGameStore(s => s.showRecruit);
  const isPremium   = useGameStore(s => s.recruitIsPremium);
  const result      = useGameStore(s => s.lastRecruitResult);
  const close       = useGameStore(s => s.closeRecruit);
  const recruit     = useGameStore(s => s.recruit);
  const coins       = useGameStore(s => s.coins);
  const gems        = useGameStore(s => s.gems);

  if (!show) return null;

  const rates   = isPremium ? PREMIUM_RATES : BASIC_RATES;
  const cost    = isPremium ? 300 : 500;
  const canBuy  = isPremium ? gems >= cost : coins >= cost;

  return (
    <div className="overlay-backdrop" onClick={close}>
      <div className="overlay-sheet" onClick={e => e.stopPropagation()}>
        <div className="overlay-title">
          {isPremium ? '💎 프리미엄 스카우트' : '🪙 일반 스카우트'}
        </div>

        {result ? (
          <div className="recruit-result">
            <span className="r-emoji">🦔</span>
            <div className="r-name" style={{ color: RARITY[result.rarityIdx].color }}>
              {result.name}
            </div>
            <div className="r-rarity" style={{ color: RARITY[result.rarityIdx].color }}>
              [{RARITY[result.rarityIdx].name}]
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>
              수익 +{(RARITY[result.rarityIdx].mul * 2).toFixed(0)}%
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, textAlign: 'center' }}>
              배달원 출현 확률
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {RARITY.map((r, i) => (
                rates[i] > 0 && (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: r.bg }}>
                    <span style={{ fontSize: 20 }}>🦔</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: r.color }}>{r.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>
                      {(rates[i] * 100).toFixed(0)}%
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div className="overlay-btn-row">
          <button
            className="btn-3d btn-orange"
            style={{ background: '#EEE', color: '#444', boxShadow: '0 4px 0 #CCC' }}
            onClick={close}
          >
            닫기
          </button>
          <button
            className={`btn-3d ${isPremium ? 'btn-gem' : 'btn-gold'}`}
            disabled={!canBuy}
            onClick={() => recruit(isPremium)}
          >
            {isPremium ? `💎 ${cost}` : `🪙 ${fmtNum(cost)}`} 스카우트
          </button>
        </div>
      </div>
    </div>
  );
}
