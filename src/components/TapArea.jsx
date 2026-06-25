import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import HedgehogScene from '../game/HedgehogScene.js';
import { fmtNum } from '../data/gameData.js';
import { useGameStore } from '../store/gameStore.js';

export default function TapArea() {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const tap = useGameStore((state) => state.tap);
  const rps = useGameStore((state) => state.totalRps);
  const multipliers = useGameStore((state) => state.multipliers);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined;
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 720,
      height: 360,
      backgroundColor: '#FFF3DA',
      transparent: false,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [HedgehogScene],
    });
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleTap = () => {
    tap();
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    const scene = gameRef.current?.scene?.getScene('HedgehogScene');
    scene?.burst?.();
  };

  return (
    <section className="tap-zone">
      <button className="canvas-button" type="button" onPointerDown={handleTap} aria-label="배달하기">
        <div ref={hostRef} className="phaser-host" />
      </button>
      <div className="mul-row">
        <span>지역 x{multipliers.zoneMul.toFixed(1)}</span>
        <span>배달원 x{multipliers.courierMul.toFixed(2)}</span>
        <span>환생 x{multipliers.prestigeMul.toFixed(2)}</span>
        <strong>+{fmtNum(Math.max(1, rps * 0.05))}/탭</strong>
      </div>
    </section>
  );
}
