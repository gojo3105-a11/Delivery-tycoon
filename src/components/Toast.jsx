import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Toast() {
  const toast   = useGameStore(s => s.toast);
  const dismiss = useGameStore(s => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div className="toast">
      {toast.msg}
      {toast.gemReward > 0 && ` +💎${toast.gemReward}`}
    </div>
  );
}
