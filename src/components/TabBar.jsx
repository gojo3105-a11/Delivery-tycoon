import React from 'react';
import { useGameStore } from '../store/gameStore';

const TABS = [
  { id: 'fac',     icon: '🏭', label: '시설' },
  { id: 'zone',    icon: '🗺️', label: '구역' },
  { id: 'courier', icon: '🦔', label: '배달원' },
];

export default function TabBar() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab    = useGameStore(s => s.setTab);

  return (
    <nav className="tab-bar">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-btn${activeTab === t.id ? ' on' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
