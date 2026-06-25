import React from 'react';
import { useGameStore } from '../store/gameStore';
import { fmtNum } from '../data/gameData';

export default function Header() {
  const coins  = useGameStore(s => s.coins);
  const gems   = useGameStore(s => s.gems);
  const getRPS = useGameStore(s => s.getRPS);

  const rps = getRPS();

  return (
    <header className="header">
      <div className="currency-pill">
        <span>🪙</span>
        <span className="val">{fmtNum(coins)}</span>
      </div>
      <div className="currency-pill" style={{ background: 'rgba(156,64,245,.35)' }}>
        <span>💎</span>
        <span className="val">{fmtNum(gems)}</span>
      </div>
      <div className="rps-chip">
        {fmtNum(rps)}/s
      </div>
    </header>
  );
}
