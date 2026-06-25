import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { HedgehogScene, createPhaserConfig } from '../game/HedgehogScene';
import { useGameStore } from '../store/gameStore';
import { fmtNum, calcZoneMul, calcCourierMul } from '../data/gameData';

let phaserGame = null;

export default function TapArea() {
  const containerRef = useRef(null);
  const labelsRef    = useRef([]);
  const tap          = useGameStore(s => s.tap);
  const zones        = useGameStore(s => s.unlockedZones);
  const couriers     = useGameStore(s => s.couriers);
  const prestige     = useGameStore(s => s.prestigeLevel);

  const zoneMul    = calcZoneMul(zones);
  const courierMul = calcCourierMul(couriers);
  const pMul       = 1 + prestige * 0.05;

  const handleTap = useCallback((px, py) => {
    tap();

    if (!containerRef.current) return;
    const label = document.createElement('div');
    label.className = 'float-label';
    label.textContent = '+tap!';
    label.style.left = `${px}px`;
    label.style.top  = `${py - 20}px`;
    containerRef.current.appendChild(label);
    setTimeout(() => label.remove(), 900);
  }, [tap]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (phaserGame) {
      phaserGame.destroy(true);
      phaserGame = null;
    }

    const config = {
      ...createPhaserConfig('hog-canvas'),
      parent: containerRef.current,
    };
    phaserGame = new Phaser.Game(config);

    const tryWire = () => {
      const scene = phaserGame.scene.getScene('HedgehogScene');
      if (scene) {
        scene.onTap = handleTap;
      } else {
        setTimeout(tryWire, 100);
      }
    };
    setTimeout(tryWire, 200);

    return () => {
      if (phaserGame) {
        phaserGame.destroy(true);
        phaserGame = null;
      }
    };
  }, []);

  useEffect(() => {
    const scene = phaserGame?.scene?.getScene('HedgehogScene');
    if (scene) scene.onTap = handleTap;
  }, [handleTap]);

  return (
    <div className="tap-area" ref={containerRef} id="hog-canvas">
      <div className="mul-chips">
        <div className="mul-chip">🗺️ ×{zoneMul.toFixed(0)}</div>
        <div className="mul-chip">🦔 ×{courierMul.toFixed(2)}</div>
        {prestige > 0 && <div className="mul-chip">✨ ×{pMul.toFixed(2)}</div>}
      </div>
    </div>
  );
}
