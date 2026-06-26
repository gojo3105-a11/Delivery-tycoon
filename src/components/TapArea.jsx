import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { HedgehogScene, createPhaserConfig } from '../game/HedgehogScene';
import { useGameStore } from '../store/gameStore';
import { fmtNum } from '../data/gameData';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

let phaserGame = null;

export default function TapArea() {
  const containerRef = useRef(null);
  const tap          = useGameStore(s => s.tap);
  const getDisplayRPS= useGameStore(s => s.getDisplayRPS);

  const handleTap = useCallback((px, py) => {
    tap();
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

    if (!containerRef.current) return;
    const label = document.createElement('div');
    label.className = 'float-label';
    label.textContent = '+';
    label.style.left = `${px - 10}px`;
    label.style.top  = `${py - 30}px`;
    containerRef.current.appendChild(label);
    setTimeout(() => label.remove(), 900);
  }, [tap]);

  useEffect(() => {
    if (!containerRef.current || phaserGame) return;

    const config = { ...createPhaserConfig('hog-canvas'), parent: containerRef.current };
    phaserGame = new Phaser.Game(config);

    const wire = () => {
      const scene = phaserGame?.scene?.getScene('HedgehogScene');
      if (scene) scene.onTap = handleTap;
      else setTimeout(wire, 100);
    };
    setTimeout(wire, 200);

    return () => {
      phaserGame?.destroy(true);
      phaserGame = null;
    };
  }, []);

  useEffect(() => {
    const scene = phaserGame?.scene?.getScene('HedgehogScene');
    if (scene) scene.onTap = handleTap;
  }, [handleTap]);

  const rps = getDisplayRPS();

  return (
    <div className="tap-area" ref={containerRef} id="hog-canvas">
      <div className="tap-rps-label">
        {rps > 0 ? `🪙 ${fmtNum(rps)}/초 자동 수익` : '탭해서 코인 수집!'}
      </div>
    </div>
  );
}
