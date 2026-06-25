import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';
import {
  BASIC_RATES,
  FAC,
  MILESTONES,
  PREMIUM_RATES,
  RARITY,
  SAVE_KEY,
  ZONES,
  drawRarityIndex,
  facilityCost,
  facilityRps,
  makeCourier,
} from '../data/gameData';

const defaultFac = Object.fromEntries(FAC.map((fac) => [fac.id, 0]));
const now = () => Date.now();

function initialState() {
  return {
    coins: 10,
    gems: 50,
    totalEarned: 0,
    fac: { ...defaultFac },
    unlockedZones: ['alley'],
    couriers: [],
    prestigeLevel: 0,
    claimedMilestones: [],
    lastSave: now(),
    lastTick: now(),
    activeTab: 'facility',
    toast: '',
    offlineReward: 0,
    recruitResult: null,
    prestigeOpen: false,
  };
}

function sanitizeSave(raw) {
  const base = initialState();
  return {
    ...base,
    ...raw,
    fac: { ...defaultFac, ...(raw?.fac || {}) },
    unlockedZones: raw?.unlockedZones?.length ? raw.unlockedZones : ['alley'],
    couriers: Array.isArray(raw?.couriers) ? raw.couriers : [],
    claimedMilestones: Array.isArray(raw?.claimedMilestones) ? raw.claimedMilestones : [],
    lastTick: now(),
  };
}

function multipliers(state) {
  const zoneMul = state.unlockedZones.reduce((sum, id) => sum + (ZONES.find((zone) => zone.id === id)?.mul || 0), 0) || 1;
  const courierMul = 1 + state.couriers.reduce((sum, courier) => sum + (courier.bonus || RARITY[courier.rarity]?.mul * 0.02 || 0), 0);
  const prestigeMul = 1 + state.prestigeLevel * 0.05;
  return { zoneMul, courierMul, prestigeMul };
}

function calcBaseRps(state) {
  return FAC.reduce((sum, facility) => sum + facilityRps(facility, state.fac[facility.id] || 0), 0);
}

function calcTotalRps(state) {
  const baseRps = calcBaseRps(state);
  const { zoneMul, courierMul, prestigeMul } = multipliers(state);
  return baseRps * zoneMul * courierMul * prestigeMul;
}

export const useGameStore = create((set, get) => ({
  ...initialState(),

  get baseRps() {
    return calcBaseRps(get());
  },
  get totalRps() {
    return calcTotalRps(get());
  },
  get multipliers() {
    return multipliers(get());
  },

  setTab: (activeTab) => set({ activeTab }),
  setToast: (toast) => set({ toast }),
  closeOffline: () => set({ offlineReward: 0 }),
  closeRecruit: () => set({ recruitResult: null }),
  openPrestige: () => set({ prestigeOpen: true }),
  closePrestige: () => set({ prestigeOpen: false }),

  load: async () => {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });
      if (!value) return;
      const loaded = sanitizeSave(JSON.parse(value));
      const elapsed = Math.max(0, Math.min(8 * 60 * 60 * 1000, now() - (loaded.lastSave || now())));
      const offlineReward = calcTotalRps(loaded) * (elapsed / 1000) * 0.5;
      set({
        ...loaded,
        coins: loaded.coins + offlineReward,
        totalEarned: loaded.totalEarned + offlineReward,
        offlineReward,
      });
    } catch {
      set({ toast: '저장 데이터를 불러오지 못했어요.' });
    }
  },

  save: async () => {
    const state = get();
    const save = {
      coins: state.coins,
      gems: state.gems,
      totalEarned: state.totalEarned,
      fac: state.fac,
      unlockedZones: state.unlockedZones,
      couriers: state.couriers,
      prestigeLevel: state.prestigeLevel,
      claimedMilestones: state.claimedMilestones,
      lastSave: now(),
    };
    await Preferences.set({ key: SAVE_KEY, value: JSON.stringify(save) });
  },

  tick: () => {
    const state = get();
    const current = now();
    const dt = Math.min(1, Math.max(0, (current - state.lastTick) / 1000));
    const earned = calcTotalRps(state) * dt;
    const nextClaimed = [...state.claimedMilestones];
    let gems = state.gems;
    let toast = state.toast;

    for (const [target, message, reward] of MILESTONES) {
      if (state.totalEarned + earned >= target && !nextClaimed.includes(target)) {
        nextClaimed.push(target);
        gems += reward;
        toast = reward ? `${message} 보석 +${reward}` : message;
      }
    }

    set({
      coins: state.coins + earned,
      totalEarned: state.totalEarned + earned,
      gems,
      claimedMilestones: nextClaimed,
      lastTick: current,
      toast,
    });
  },

  tap: () => {
    const state = get();
    const tapValue = Math.max(1, calcTotalRps(state) * 0.05);
    set({ coins: state.coins + tapValue, totalEarned: state.totalEarned + tapValue });
  },

  buyFacility: (id) => {
    const state = get();
    const facility = FAC.find((fac) => fac.id === id);
    if (!facility) return;
    const level = state.fac[id] || 0;
    const cost = facilityCost(facility, level);
    if (state.coins < cost) {
      set({ toast: '코인이 부족해요.' });
      return;
    }
    set({ coins: state.coins - cost, fac: { ...state.fac, [id]: level + 1 } });
  },

  unlockZone: (id) => {
    const state = get();
    const zone = ZONES.find((item) => item.id === id);
    if (!zone || state.unlockedZones.includes(id)) return;
    const previous = ZONES[ZONES.findIndex((item) => item.id === id) - 1];
    if (previous && !state.unlockedZones.includes(previous.id)) {
      set({ toast: '이전 지역부터 열어야 해요.' });
      return;
    }
    if (state.coins < zone.unlockCost) {
      set({ toast: '지역 해금 코인이 부족해요.' });
      return;
    }
    set({ coins: state.coins - zone.unlockCost, unlockedZones: [...state.unlockedZones, id], toast: `${zone.name} 오픈!` });
  },

  recruit: (premium = false) => {
    const state = get();
    const cost = premium ? 300 : 500;
    if (premium ? state.gems < cost : state.coins < cost) {
      set({ toast: premium ? '보석이 부족해요.' : '코인이 부족해요.' });
      return;
    }
    const rarity = drawRarityIndex(premium ? PREMIUM_RATES : BASIC_RATES);
    const courier = makeCourier(rarity);
    set({
      coins: premium ? state.coins : state.coins - cost,
      gems: premium ? state.gems - cost : state.gems,
      couriers: [courier, ...state.couriers].slice(0, 80),
      recruitResult: courier,
      toast: `${courier.name} 합류!`,
    });
  },

  prestige: () => {
    const state = get();
    if (state.totalEarned < 1e6) {
      set({ toast: '환생은 총 수익 1M부터 가능해요.' });
      return;
    }
    set({
      coins: 10,
      totalEarned: 0,
      fac: { ...defaultFac },
      unlockedZones: ['alley'],
      prestigeLevel: state.prestigeLevel + 1,
      claimedMilestones: [],
      prestigeOpen: false,
      toast: `환생 완료! 영구 수익 +${(state.prestigeLevel + 1) * 5}%`,
    });
  },
}));

export { calcTotalRps, multipliers };
