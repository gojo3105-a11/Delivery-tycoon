import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { ZONES, fmtNum } from '../../data/gameData';

export default function ZoneTab() {
  const coins         = useGameStore(s => s.coins);
  const unlockedZones = useGameStore(s => s.unlockedZones);
  const unlockZone    = useGameStore(s => s.unlockZone);
  const activeTab     = useGameStore(s => s.activeTab);

  return (
    <div className={`tab-panel${activeTab === 'zone' ? ' active' : ''}`} id="tab-zone">
      <p className="section-heading">배달 구역</p>
      {ZONES.map((zone, i) => {
        const unlocked = unlockedZones.includes(zone.id);
        const prevUnlocked = i === 0 || unlockedZones.includes(ZONES[i - 1].id);
        const canUnlock = !unlocked && prevUnlocked && coins >= zone.unlockCost;
        const isNext = !unlocked && prevUnlocked;

        return (
          <div key={zone.id} className={`card zone-card${!unlocked ? ' locked' : ''}`}>
            <span className="zone-emoji">{zone.emoji}</span>
            <div className="zone-info">
              <div className="zone-name">{zone.name}</div>
              <div className="zone-mul">수익 배율: ×{zone.mul.toFixed(0)}</div>
            </div>
            {unlocked ? (
              <span style={{ fontSize: 22 }}>✅</span>
            ) : (
              <button
                className="btn-3d btn-gold"
                disabled={!canUnlock}
                onClick={() => unlockZone(zone.id)}
                style={{ minWidth: 90, fontSize: 12 }}
              >
                🪙 {fmtNum(zone.unlockCost)}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
