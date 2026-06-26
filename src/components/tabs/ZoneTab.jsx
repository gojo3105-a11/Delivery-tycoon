import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ZONES, fmtNum } from '../../data/gameData';

const GRADE_MAP   = ['D', 'C', 'C', 'B', 'B', 'A', 'A', 'S', 'S', 'SS'];
const GRADE_COLOR = { D: '#8A8090', C: '#3A9A28', B: '#2080E8', A: '#9C40F5', S: '#E8920A', SS: '#EE3890' };
const ZONE_DESC   = [
  '기본 배달 구역. 소규모 주문 처리 시작.',
  '주택가 배달망으로 안정적인 수익 확보.',
  '상업지구 유입으로 다양한 주문 처리.',
  '산업단지 특수화물 전문 배달 서비스.',
  '신도시 물류 허브로 빠른 배달망 구축.',
  '도심 프리미엄 배달 서비스 운영.',
  '항구 컨테이너 물류 네트워크 확장.',
  '공항 특급 배달 서비스 시스템 도입.',
  '글로벌 물류 플랫폼 통합 운영.',
  '미래형 드론·자율주행 배달 시스템.',
];

function StarRow({ mul }) {
  const filled = Math.min(5, Math.max(1, Math.round(Math.log2(Math.max(mul, 1)) * 0.7 + 1)));
  return (
    <div className="zcc-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= filled ? '#E8920A' : '#DDD0C8', fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

export default function ZoneTab() {
  const coins         = useGameStore(s => s.coins);
  const unlockedZones = useGameStore(s => s.unlockedZones);
  const unlockZone    = useGameStore(s => s.unlockZone);
  const activeTab     = useGameStore(s => s.activeTab);
  const [confirm, setConfirm] = useState(null);

  return (
    <div className={`tab-panel${activeTab === 'zone' ? ' active' : ''}`} id="tab-zone">
      <p className="section-heading">배달 구역 계약</p>

      {ZONES.map((zone, i) => {
        const unlocked     = unlockedZones.includes(zone.id);
        const prevUnlocked = i === 0 || unlockedZones.includes(ZONES[i - 1].id);
        const canAfford    = coins >= zone.unlockCost;
        const grade        = GRADE_MAP[i];

        return (
          <div
            key={zone.id}
            className={`zone-company-card${unlocked ? ' contracted' : ''}${!prevUnlocked ? ' unavailable' : ''}`}
          >
            <div className="zcc-icon">
              <span style={{ fontSize: 28 }}>{zone.emoji}</span>
              {unlocked && <div className="zcc-checkmark">✓</div>}
            </div>

            <div className="zcc-body">
              <div className="zcc-header">
                <span className="zcc-name">{zone.name}</span>
                <span className="zcc-grade" style={{ background: GRADE_COLOR[grade] }}>{grade}</span>
              </div>
              <StarRow mul={zone.mul} />
              <div className="zcc-desc">{ZONE_DESC[i]}</div>
              <div className="zcc-mul">수익 배율 ×{zone.mul.toFixed(0)}</div>
            </div>

            <div className="zcc-action">
              {unlocked ? (
                <div className="zcc-active">계약 중</div>
              ) : !prevUnlocked ? (
                <div className="zcc-locked">🔒</div>
              ) : (
                <button
                  className="zcc-contract-btn"
                  disabled={!canAfford}
                  onClick={() => setConfirm({ zone, idx: i })}
                >
                  계약하기
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Contract detail popup */}
      {confirm && (
        <div className="contract-backdrop" onClick={() => setConfirm(null)}>
          <div className="contract-sheet" onClick={e => e.stopPropagation()}>
            <div className="cs-title">임대 계약</div>

            <div className="cs-company-row">
              <span style={{ fontSize: 40 }}>{confirm.zone.emoji}</span>
              <div>
                <div className="cs-company-name">{confirm.zone.name}</div>
                <span
                  className="cs-grade-badge"
                  style={{ background: GRADE_COLOR[GRADE_MAP[confirm.idx]] }}
                >
                  {GRADE_MAP[confirm.idx]}
                </span>
              </div>
            </div>

            <div className="cs-fee-row">
              <span className="cs-fee-label">수익 배율</span>
              <span className="cs-fee-val">×{confirm.zone.mul.toFixed(0)}</span>
            </div>
            <div className="cs-fee-row">
              <span className="cs-fee-label">계약금</span>
              <span className="cs-fee-val">🪙 {fmtNum(confirm.zone.unlockCost)}</span>
            </div>

            <div className="cs-btn-row">
              <button className="cs-cancel" onClick={() => setConfirm(null)}>취소</button>
              <button
                className="cs-confirm"
                disabled={coins < confirm.zone.unlockCost}
                onClick={() => { unlockZone(confirm.zone.id); setConfirm(null); }}
              >
                계약 체결
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
