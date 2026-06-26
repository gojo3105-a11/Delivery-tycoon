import React, { useEffect, useRef } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useGameStore } from './store/gameStore';
import Header from './components/Header';
import TapArea from './components/TapArea';
import TabBar from './components/TabBar';
import FacilityTab from './components/tabs/FacilityTab';
import ZoneTab from './components/tabs/ZoneTab';
import CourierTab from './components/tabs/CourierTab';
import OfflineOverlay from './components/overlays/OfflineOverlay';
import PrestigeOverlay from './components/overlays/PrestigeOverlay';
import RecruitOverlay from './components/overlays/RecruitOverlay';
import Toast from './components/Toast';

const TICK_INTERVAL = 100;
const SAVE_INTERVAL = 10000;

export default function App() {
  const tick           = useGameStore(s => s.tick);
  const save           = useGameStore(s => s.save);
  const loadFromNative = useGameStore(s => s.loadFromNative);

  const lastTickRef = useRef(performance.now());
  const lastSaveRef = useRef(performance.now());
  const rafRef      = useRef(null);

  useEffect(() => {
    loadFromNative();
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#FF7128' }).catch(() => {});
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      tick(Math.min(dt, 0.5));

      if (now - lastSaveRef.current > SAVE_INTERVAL) {
        save();
        lastSaveRef.current = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        save();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', save);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', save);
    };
  }, [tick, save]);

  return (
    <div id="app">
      <Header />
      <TapArea />
      <div className="content-area">
        <FacilityTab />
        <ZoneTab />
        <CourierTab />
      </div>
      <TabBar />

      <OfflineOverlay />
      <PrestigeOverlay />
      <RecruitOverlay />
      <Toast />
    </div>
  );
}
