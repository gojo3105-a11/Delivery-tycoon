import { useGameStore } from '../store/gameStore.js';

const tabs = [
  ['facility', '🏪', '시설'],
  ['zone', '🗺️', '지역'],
  ['courier', '🦔', '배달원'],
];

export default function TabBar() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);

  return (
    <nav className="tabbar">
      {tabs.map(([id, icon, label]) => (
        <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setTab(id)}>
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}
