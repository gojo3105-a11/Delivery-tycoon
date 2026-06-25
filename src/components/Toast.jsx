import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';

export default function Toast() {
  const toast = useGameStore((state) => state.toast);
  const setToast = useGameStore((state) => state.setToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}
