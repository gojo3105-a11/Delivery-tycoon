import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';
import {
  FAC, ZONES, MILESTONES,
  getFacCost, calcTotalRPS, calcZoneMul, calcCourierMul,
  rollGacha, pickCourierName, fmtNum, PRESTIGE_THRESHOLD
} from '../data/gameData';

const SAVE_KEY = 'hdt_v5';
const MAX_OFFLINE_SECS = 8 * 3600;
const OFFLINE_EFF = 0.5;

function defaultState() {
  return {
    coins: 10,
    gems: 50,
    totalEarned: 0,
    facLevels: {},
    unlockedZones: ['alley'],
    couriers: [],
    prestigeLevel: 0,
    lastSave: Date.now(),
    seenMilestones: [],
  };
}

function loadStateSync() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveStateAsync(state) {
  const toSave = {
    coins: state.coins,
    gems: state.gems,
    totalEarned: state.totalEarned,
    facLevels: state.facLevels,
    unlockedZones: state.unlockedZones,
    couriers: state.couriers,
    prestigeLevel: state.prestigeLevel,
    lastSave: Date.now(),
    seenMilestones: state.seenMilestones,
  };
  const json = JSON.stringify(toSave);
  localStorage.setItem(SAVE_KEY, json);
  try {
    await Preferences.set({ key: SAVE_KEY, value: json });
  } catch {}
}

async function loadStateAsync() {
  try {
    const { value } = await Preferences.get({ key: SAVE_KEY });
    if (value) return JSON.parse(value);
  } catch {}
  return loadStateSync();
}

export const useGameStore = create((set, get) => {
  const saved = loadStateSync();
  const initial = { ...defaultState(), ...(saved || {}) };

  let offlineCoins = 0;
  let offlineSecs  = 0;
  if (saved?.lastSave) {
    const elapsed = Math.min((Date.now() - saved.lastSave) / 1000, MAX_OFFLINE_SECS);
    if (elapsed > 10) {
      const rps = calcTotalRPS(initial.facLevels, initial.unlockedZones, initial.couriers, initial.prestigeLevel);
      offlineCoins = rps * elapsed * OFFLINE_EFF;
      offlineSecs  = elapsed;
      initial.coins += offlineCoins;
      initial.totalEarned += offlineCoins;
    }
  }

  return {
    ...initial,

    offlineReward: offlineCoins > 0 ? { coins: offlineCoins, secs: offlineSecs } : null,
    toast: null,
    activeTab: 'fac',
    showPrestige: false,
    showRecruit: false,
    recruitIsPremium: false,
    lastRecruitResult: null,
    tapBurst: 0,

    getRPS() {
      const s = get();
      return calcTotalRPS(s.facLevels, s.unlockedZones, s.couriers, s.prestigeLevel);
    },

    getZoneMul() {
      return calcZoneMul(get().unlockedZones);
    },

    getCourierMul() {
      return calcCourierMul(get().couriers);
    },

    tick(dt) {
      set(s => {
        const rps = calcTotalRPS(s.facLevels, s.unlockedZones, s.couriers, s.prestigeLevel);
        const earned = rps * dt;
        const coins = s.coins + earned;
        const totalEarned = s.totalEarned + earned;

        let toast = s.toast;
        let seenMilestones = s.seenMilestones;
        for (const [thresh, msg, gemReward] of MILESTONES) {
          if (!seenMilestones.includes(thresh) && totalEarned >= thresh) {
            seenMilestones = [...seenMilestones, thresh];
            toast = { msg, gemReward };
            if (gemReward > 0) {
              return { coins, totalEarned, seenMilestones, toast, gems: s.gems + gemReward };
            }
          }
        }
        return { coins, totalEarned, seenMilestones, toast };
      });
    },

    tap() {
      set(s => {
        const rps = calcTotalRPS(s.facLevels, s.unlockedZones, s.couriers, s.prestigeLevel);
        const bonus = Math.max(rps * 0.1, 1);
        return {
          coins: s.coins + bonus,
          totalEarned: s.totalEarned + bonus,
          tapBurst: s.tapBurst + 1,
        };
      });
    },

    buyFac(facId) {
      const fac = FAC.find(f => f.id === facId);
      if (!fac) return;
      const s = get();
      const level = s.facLevels[facId] || 0;
      const cost = getFacCost(fac, level);
      if (s.coins < cost) return;
      set({
        coins: s.coins - cost,
        facLevels: { ...s.facLevels, [facId]: level + 1 },
      });
    },

    unlockZone(zoneId) {
      const zone = ZONES.find(z => z.id === zoneId);
      if (!zone) return;
      const s = get();
      if (s.unlockedZones.includes(zoneId)) return;
      if (s.coins < zone.unlockCost) return;
      set({
        coins: s.coins - zone.unlockCost,
        unlockedZones: [...s.unlockedZones, zoneId],
      });
    },

    recruit(isPremium) {
      const s = get();
      const cost = isPremium ? 300 : 500;
      const currency = isPremium ? 'gems' : 'coins';
      if (s[currency] < cost) return;

      const rarityIdx = rollGacha(isPremium);
      const name = pickCourierName(rarityIdx, s.couriers);
      const courier = { id: Date.now(), name, rarityIdx };

      set({
        [currency]: s[currency] - cost,
        couriers: [...s.couriers, courier],
        lastRecruitResult: courier,
      });
    },

    prestige() {
      const s = get();
      if (s.totalEarned < PRESTIGE_THRESHOLD) return;
      set({
        coins: 10,
        gems: s.gems,
        totalEarned: 0,
        facLevels: {},
        unlockedZones: ['alley'],
        couriers: s.couriers,
        prestigeLevel: s.prestigeLevel + 1,
        seenMilestones: [],
        showPrestige: false,
      });
    },

    dismissOffline() { set({ offlineReward: null }); },
    dismissToast()   { set({ toast: null }); },
    setTab(tab)      { set({ activeTab: tab }); },
    openPrestige()   { set({ showPrestige: true }); },
    closePrestige()  { set({ showPrestige: false }); },
    openRecruit(isPremium) { set({ showRecruit: true, recruitIsPremium: isPremium, lastRecruitResult: null }); },
    closeRecruit()   { set({ showRecruit: false, lastRecruitResult: null }); },

    save() {
      saveStateAsync(get());
    },

    async loadFromNative() {
      const loaded = await loadStateAsync();
      if (loaded) set({ ...defaultState(), ...loaded, offlineReward: null });
    },
  };
});
