import React, { useState, useEffect, useCallback, memo } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  FAC, FAC_MILESTONE_LEVELS, FAC_MILESTONE_MULS,
  getFacCost, getFacBulkCost, getFacMaxBuy, getFacIncomePerCycle,
  getFacMilestoneMul, getNextMilestone,
  fmtNum, fmtTime, PRESTIGE_THRESHOLD, BOOST_COST,
} from '../../data/gameData';

/* ── Buy-count selector ─────────────────────────────── */
const BUY_OPTS = [
  { label: '×1',   value: 1 },
  { label: '×10',  value: 10 },
  { label: '×100', value: 100 },
  { label: 'Max',  value: 'max' },
];

function BuySelector({ buyCount, setBuyCount }) {
  return (
    <div className="buy-selector">
      {BUY_OPTS.map(o => (
        <button
          key={o.value}
          className={`buy-opt${buyCount === o.value ? ' on' : ''}`}
          onClick={() => setBuyCount(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Individual facility card ───────────────────────── */
const FacCard = memo(function FacCard({ fac, level, cycleStart, ready, hasManager, coins, globalMul, buyCount, onBuy, onCollect, onBuyManager }) {
  const [progress, setProgress] = useState(ready ? 1 : 0);

  useEffect(() => {
    if (ready) { setProgress(1); return; }
    if (!level || !cycleStart) { setProgress(0); return; }

    let raf;
    function update() {
      const elapsed = (Date.now() - cycleStart) / 1000;
      const p = Math.min(elapsed / fac.baseTime, 1.0);
      setProgress(p);
      if (p < 1.0) raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [ready, level, cycleStart, fac.baseTime]);

  const incomePerCycle = level > 0 ? getFacIncomePerCycle(fac, level) * globalMul : 0;
  const nextMilestone  = getNextMilestone(level);
  const nextIdx        = FAC_MILESTONE_LEVELS.indexOf(nextMilestone);
  const nextMul        = nextIdx >= 0 ? FAC_MILESTONE_MULS[nextIdx] : null;

  let btnCost = 0;
  let canBuy  = false;
  if (buyCount === 'max') {
    const r = getFacMaxBuy(fac, level, coins);
    btnCost = r.cost; canBuy = r.count > 0;
  } else {
    btnCost = getFacBulkCost(fac, level, buyCount);
    canBuy  = coins >= btnCost;
  }

  const timeLeft = level > 0 && !ready && cycleStart
    ? Math.max(0, fac.baseTime - (Date.now() - cycleStart) / 1000)
    : 0;

  return (
    <div className={`fac-card2${ready ? ' ready' : ''}`}>
      <div className="fac2-left">
        <div className="fac2-emoji">{fac.emoji}</div>
      </div>

      <div className="fac2-body">
        <div className="fac2-top-row">
          <span className="fac2-name">{fac.name}</span>
          <span className="fac2-lv">Lv.{level}</span>
        </div>

        {level > 0 ? (
          <>
            <div className="fac2-income">
              🪙 {fmtNum(incomePerCycle)} / {fmtTime(fac.baseTime)}
            </div>
            <div className="fac2-timer-wrap">
              <div className="fac2-timer-bar" style={{ width: `${progress * 100}%` }} />
            </div>
            {!ready && timeLeft > 0 && (
              <div className="fac2-timeleft">{fmtTime(timeLeft)}</div>
            )}
          </>
        ) : (
          <div className="fac2-income" style={{ color: 'var(--muted)' }}>
            구매 시 활성화 • {fmtTime(fac.baseTime)}/사이클
          </div>
        )}

        {nextMilestone && (
          <div className="fac2-milestone">
            다음 마일스톤: <strong>{nextMilestone}레벨 ×{nextMul}</strong>
            {' '}({nextMilestone - level}회 남음)
          </div>
        )}

        {!hasManager && level > 0 && (
          <button
            className="fac2-manager-btn"
            disabled={coins < fac.managerCost}
            onClick={onBuyManager}
          >
            👔 팀장 고슴도치 임명 · 🪙 {fmtNum(fac.managerCost)}
          </button>
        )}
        {hasManager && (
          <div className="fac2-manager-active">👔 팀장 고슴도치 활동 중</div>
        )}
      </div>

      <div className="fac2-right">
        {ready ? (
          <button className="fac2-collect-btn" onClick={onCollect}>
            수집!
          </button>
        ) : (
          <button
            className="fac2-buy-btn"
            disabled={!canBuy}
            onClick={onBuy}
          >
            {buyCount === 'max' ? 'Max' : `×${buyCount}`}
            <span className="fac2-cost">🪙 {fmtNum(btnCost)}</span>
          </button>
        )}
      </div>
    </div>
  );
});

/* ── Main tab ───────────────────────────────────────── */
export default function FacilityTab() {
  const activeTab    = useGameStore(s => s.activeTab);
  const coins        = useGameStore(s => s.coins);
  const gems         = useGameStore(s => s.gems);
  const facLevels    = useGameStore(s => s.facLevels);
  const facCycleStart= useGameStore(s => s.facCycleStart);
  const facReady     = useGameStore(s => s.facReady);
  const facManagers  = useGameStore(s => s.facManagers);
  const buyCount     = useGameStore(s => s.buyCount);
  const totalEarned  = useGameStore(s => s.totalEarned);
  const prestigeLevel= useGameStore(s => s.prestigeLevel);
  const boostEndTime = useGameStore(s => s.boostEndTime);
  const setBuyCount  = useGameStore(s => s.setBuyCount);
  const buyFac       = useGameStore(s => s.buyFac);
  const collectFac   = useGameStore(s => s.collectFac);
  const collectAll   = useGameStore(s => s.collectAll);
  const buyManager   = useGameStore(s => s.buyManager);
  const openPrestige = useGameStore(s => s.openPrestige);
  const activateBoost= useGameStore(s => s.activateBoost);
  const getGlobalMul = useGameStore(s => s.getGlobalMul);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const globalMul   = getGlobalMul();
  const boostActive = now < boostEndTime;
  const boostSecs   = boostActive ? Math.ceil((boostEndTime - now) / 1000) : 0;
  const anyReady    = FAC.some(f => facReady[f.id]);
  const canPrestige = totalEarned >= PRESTIGE_THRESHOLD;

  return (
    <div className={`tab-panel${activeTab === 'fac' ? ' active' : ''}`} id="tab-fac">

      {/* Boost & Prestige row */}
      <div className="fac2-top-bar">
        {boostActive ? (
          <div className="boost-active-chip">⚡ ×2 부스트 {fmtTime(boostSecs)}</div>
        ) : (
          <button
            className="btn-3d btn-gem boost-btn"
            disabled={gems < BOOST_COST}
            onClick={activateBoost}
          >
            ⚡ ×2 부스트 · 💎{BOOST_COST}
          </button>
        )}
        {canPrestige && (
          <button className="btn-3d btn-orange prestige-btn" onClick={openPrestige}>
            🏗️ 도시 재개발
          </button>
        )}
      </div>

      {/* Buy count selector */}
      <BuySelector buyCount={buyCount} setBuyCount={setBuyCount} />

      {/* Collect all button */}
      {anyReady && (
        <button className="collect-all-btn" onClick={collectAll}>
          📦 전체 수집!
        </button>
      )}

      {/* Facility cards */}
      {FAC.map(fac => (
        <FacCard
          key={fac.id}
          fac={fac}
          level={facLevels[fac.id] || 0}
          cycleStart={facCycleStart[fac.id] || null}
          ready={!!facReady[fac.id]}
          hasManager={!!facManagers[fac.id]}
          coins={coins}
          globalMul={globalMul}
          buyCount={buyCount}
          onBuy={() => buyFac(fac.id)}
          onCollect={() => collectFac(fac.id)}
          onBuyManager={() => buyManager(fac.id)}
        />
      ))}

      {/* Multiplier info */}
      <div className="mul-info-card">
        <div className="mul-info-row">
          <span>🗺️ 전체 배율</span><span>×{globalMul.toFixed(1)}</span>
        </div>
        {prestigeLevel > 0 && (
          <div className="mul-info-row">
            <span>🏅 가시 뱃지 보너스</span><span>×{(1 + prestigeLevel * 0.05).toFixed(2)}</span>
          </div>
        )}
        {boostActive && (
          <div className="mul-info-row" style={{ color: 'var(--gem)' }}>
            <span>⚡ 부스트</span><span>×2.0</span>
          </div>
        )}
      </div>
    </div>
  );
}
