import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY, fmtNum } from '../../data/gameData';

export default function CourierTab() {
  const couriers    = useGameStore(s => s.couriers);
  const coins       = useGameStore(s => s.coins);
  const gems        = useGameStore(s => s.gems);
  const openRecruit = useGameStore(s => s.openRecruit);
  const activeTab   = useGameStore(s => s.activeTab);

  return (
    <div className={`tab-panel${activeTab === 'courier' ? ' active' : ''}`} id="tab-courier">
      <div className="courier-section-header">
        <span className="section-heading" style={{ margin: 0 }}>택배원 모집</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className="btn-3d btn-gold"
          style={{ flex: 1, padding: '12px 8px' }}
          disabled={coins < 500}
          onClick={() => openRecruit(false)}
        >
          🪙 일반 모집<br />
          <span style={{ fontSize: 11, opacity: .85 }}>500 코인</span>
        </button>
        <button
          className="btn-3d btn-gem"
          style={{ flex: 1, padding: '12px 8px' }}
          disabled={gems < 300}
          onClick={() => openRecruit(true)}
        >
          💎 프리미엄 모집<br />
          <span style={{ fontSize: 11, opacity: .85 }}>300 젬</span>
        </button>
      </div>

      <p className="section-heading">내 택배원 ({couriers.length}명)</p>

      {couriers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40 }}>🦔</div>
          <div style={{ marginTop: 8, fontSize: 14 }}>아직 택배원이 없습니다</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>모집해서 수익을 높여보세요!</div>
        </div>
      ) : (
        <div className="courier-grid">
          {couriers.map(c => {
            const r = RARITY[c.rarityIdx];
            return (
              <div key={c.id} className="courier-card" style={{ background: r.bg }}>
                <span style={{ fontSize: 32 }}>🦔</span>
                <div className="courier-name">{c.name}</div>
                <div className="courier-rarity" style={{ color: r.color }}>{r.name}</div>
                <div className="courier-mul">+{(r.mul * 2).toFixed(0)}% 수익</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
