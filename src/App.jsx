import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import TapArea from './components/TapArea.jsx';
import Toast from './components/Toast.jsx';
import OfflineOverlay from './components/overlays/OfflineOverlay.jsx';
import PrestigeOverlay from './components/overlays/PrestigeOverlay.jsx';
import RecruitOverlay from './components/overlays/RecruitOverlay.jsx';
import CourierTab from './components/tabs/CourierTab.jsx';
import FacilityTab from './components/tabs/FacilityTab.jsx';
import ZoneTab from './components/tabs/ZoneTab.jsx';
import { useGameStore } from './store/gameStore.js';

export default function App() {
  const load = useGameStore((state) => state.load);
  const save = useGameStore((state) => state.save);
  const tick = useGameStore((state) => state.tick);
  const activeTab = useGameStore((state) => state.activeTab);

  useEffect(() => {
    load();
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#FF7128' }).catch(() => {});
  }, [load]);

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const saveTimer = setInterval(save, 8000);
    const onHide = () => save();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(saveTimer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onHide);
      save();
    };
  }, [save, tick]);

  return (
    <div className="app-shell">
      <Header />
      <TapArea />
      <main className="content-area">
        {activeTab === 'facility' && <FacilityTab />}
        {activeTab === 'zone' && <ZoneTab />}
        {activeTab === 'courier' && <CourierTab />}
      </main>
      <TabBar />
      <OfflineOverlay />
      <PrestigeOverlay />
      <RecruitOverlay />
      <Toast />
    </div>
  );
}
