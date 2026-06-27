import React, { useEffect } from 'react';
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
import CheckInOverlay from './components/overlays/CheckInOverlay';
import Toast from './components/Toast';

const SAVE_INTERVAL = 10000;

export default function App() {
  const tick           = useGameStore(s => s.tick);
  const save           = useGameStore(s => s.save);
  const loadFromNative = useGameStore(s => s.loadFromNative);

  useEffect(() => {
    loadFromNative();
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#FF7128' }).catch(() => {});
  }, []);

  useEffect(() => {
    let lastSave = performance.now();
    let raf;

    function loop(now) {
      tick();
      if (now - lastSave > SAVE_INTERVAL) {
        save();
        lastSave = now;
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    const onHide = () => save();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onHide);
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
      <CheckInOverlay />
      <Toast />
    </div>
  );
}
