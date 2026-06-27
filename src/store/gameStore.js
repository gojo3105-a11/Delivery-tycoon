import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';
import {
  FAC, ZONES, COIN_MILESTONES, PRESTIGE_THRESHOLD, BOOST_COST, BOOST_DURATION_MS,
  AD_BOOST_DURATION_MS, AD_BOOST_COOLDOWN_MS, CHECKIN_REWARDS, todayKey,
  getFacCost, getFacBulkCost, getFacMaxBuy, getFacIncomePerCycle,
  calcGlobalMul, calcDisplayRPS, calcPrestigeBadges,
  rollGacha, pickCourierName,
} from '../data/gameData';

const SAVE_KEY = 'hdt_v6';
const MAX_OFFLINE_SECS = 8 * 3600;
const OFFLINE_EFF = 0.5;

function defaultState() {
  return {
    coins: 10,
    gems: 50,
    totalEarned: 0,
    facLevels:    {},
    facCycleStart:{},  // ms timestamp when cycle started
    facReady:     {},  // true = waiting to be collected
    facManagers:  {},
    unlockedZones: ['alley'],
    couriers: [],
    prestigeLevel: 0,          // 누적 가시 뱃지 수
    boostEndTime: 0,
    adBoostCooldownEnd: 0,     // 스폰서 배달 부스트 쿨다운 종료 시각
    lastCheckIn: '',           // 마지막 출근 도장 날짜 키
    checkInStreak: 0,          // 연속 출석 (1~7 주기)
    lastSave: Date.now(),
    seenMilestones: [],
  };
}

function loadStateSync() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveStateAsync(state) {
  const payload = {
    coins: state.coins, gems: state.gems, totalEarned: state.totalEarned,
    facLevels: state.facLevels, facCycleStart: state.facCycleStart,
    facReady: state.facReady, facManagers: state.facManagers,
    unlockedZones: state.unlockedZones, couriers: state.couriers,
    prestigeLevel: state.prestigeLevel, boostEndTime: state.boostEndTime,
    adBoostCooldownEnd: state.adBoostCooldownEnd,
    lastCheckIn: state.lastCheckIn, checkInStreak: state.checkInStreak,
    lastSave: Date.now(), seenMilestones: state.seenMilestones,
  };
  const json = JSON.stringify(payload);
  localStorage.setItem(SAVE_KEY, json);
  try { await Preferences.set({ key: SAVE_KEY, value: json }); } catch {}
}

async function loadStateAsync() {
  try {
    const { value } = await Preferences.get({ key: SAVE_KEY });
    if (value) return JSON.parse(value);
  } catch {}
  return loadStateSync();
}

function calcOffline(saved) {
  if (!saved?.lastSave) return { coins: 0, secs: 0 };
  const secs = Math.min((Date.now() - saved.lastSave) / 1000, MAX_OFFLINE_SECS);
  if (secs < 10) return { coins: 0, secs: 0 };
  const g = calcGlobalMul(saved.unlockedZones || ['alley'], saved.couriers || [], saved.prestigeLevel || 0, false);
  let coins = 0;
  for (const fac of FAC) {
    const lv = (saved.facLevels || {})[fac.id] || 0;
    if (!lv || !(saved.facManagers || {})[fac.id]) continue;
    coins += getFacIncomePerCycle(fac, lv) * g * (secs / fac.baseTime) * OFFLINE_EFF;
  }
  return { coins, secs };
}

export const useGameStore = create((set, get) => {
  const saved   = loadStateSync();
  const offline = calcOffline(saved);
  const initial = {
    ...defaultState(),
    ...(saved || {}),
    coins:       (saved?.coins       || 10) + offline.coins,
    totalEarned: (saved?.totalEarned || 0)  + offline.coins,
  };

  return {
    ...initial,
    offlineReward: offline.coins > 0.1 ? offline : null,
    toast:         null,
    activeTab:     'fac',
    showPrestige:  false,
    showRecruit:   false,
    recruitIsPremium: false,
    lastRecruitResult: null,
    showCheckIn:   (initial.lastCheckIn || '') !== todayKey(),
    buyCount:      1,   // 1 | 10 | 100 | 'max'

    isBoostActive: () => Date.now() < get().boostEndTime,

    getDisplayRPS() {
      const s = get();
      return calcDisplayRPS(s.facLevels, s.facManagers, s.unlockedZones, s.couriers, s.prestigeLevel, s.isBoostActive());
    },

    getGlobalMul() {
      const s = get();
      return calcGlobalMul(s.unlockedZones, s.couriers, s.prestigeLevel, s.isBoostActive());
    },

    tick() {
      const now = Date.now();
      set(s => {
        const g = calcGlobalMul(s.unlockedZones, s.couriers, s.prestigeLevel, now < s.boostEndTime);
        let coinsEarned = 0;
        let changed = false;
        const newCycleStart = { ...s.facCycleStart };
        const newReady      = { ...s.facReady };

        for (const fac of FAC) {
          const lv = s.facLevels[fac.id] || 0;
          if (!lv) continue;

          if (newReady[fac.id]) {
            if (s.facManagers[fac.id]) {
              coinsEarned += getFacIncomePerCycle(fac, lv) * g;
              newReady[fac.id] = false;
              newCycleStart[fac.id] = now;
              changed = true;
            }
          } else {
            const start   = newCycleStart[fac.id] || now;
            const elapsed = (now - start) / 1000;
            if (elapsed >= fac.baseTime) {
              if (s.facManagers[fac.id]) {
                coinsEarned += getFacIncomePerCycle(fac, lv) * g;
                newCycleStart[fac.id] = now;
              } else {
                newReady[fac.id] = true;
              }
              changed = true;
            }
          }
        }

        if (!changed && coinsEarned === 0) return {};

        const coins       = s.coins + coinsEarned;
        const totalEarned = s.totalEarned + coinsEarned;
        let   gems        = s.gems;
        let   toast       = s.toast;
        let   seen        = s.seenMilestones;

        for (const [thresh, msg, reward] of COIN_MILESTONES) {
          if (!seen.includes(thresh) && totalEarned >= thresh) {
            seen  = [...seen, thresh];
            gems += reward;
            toast = { msg, gemReward: reward };
          }
        }

        return { coins, totalEarned, gems, seenMilestones: seen, toast, facCycleStart: newCycleStart, facReady: newReady };
      });
    },

    collectFac(facId) {
      set(s => {
        if (!s.facReady[facId]) return {};
        const fac = FAC.find(f => f.id === facId);
        const lv  = s.facLevels[facId] || 0;
        const g   = calcGlobalMul(s.unlockedZones, s.couriers, s.prestigeLevel, Date.now() < s.boostEndTime);
        const income = getFacIncomePerCycle(fac, lv) * g;
        return {
          coins:       s.coins + income,
          totalEarned: s.totalEarned + income,
          facReady:      { ...s.facReady,      [facId]: false },
          facCycleStart: { ...s.facCycleStart, [facId]: Date.now() },
        };
      });
    },

    collectAll() {
      set(s => {
        const now = Date.now();
        const g   = calcGlobalMul(s.unlockedZones, s.couriers, s.prestigeLevel, now < s.boostEndTime);
        let coins = s.coins, earned = s.totalEarned;
        const newReady = { ...s.facReady }, newStart = { ...s.facCycleStart };
        for (const fac of FAC) {
          if (!newReady[fac.id]) continue;
          const lv = s.facLevels[fac.id] || 0;
          if (!lv) continue;
          const inc = getFacIncomePerCycle(fac, lv) * g;
          coins += inc; earned += inc;
          newReady[fac.id] = false; newStart[fac.id] = now;
        }
        return { coins, totalEarned: earned, facReady: newReady, facCycleStart: newStart };
      });
    },

    buyFac(facId) {
      set(s => {
        const fac  = FAC.find(f => f.id === facId);
        if (!fac) return {};
        const lv   = s.facLevels[facId] || 0;
        let count  = s.buyCount;
        let cost;

        if (count === 'max') {
          const r = getFacMaxBuy(fac, lv, s.coins);
          count = r.count; cost = r.cost;
          if (!count) return {};
        } else {
          cost = getFacBulkCost(fac, lv, count);
          if (s.coins < cost) return {};
        }

        const wasZero = lv === 0;
        return {
          coins:     s.coins - cost,
          facLevels: { ...s.facLevels, [facId]: lv + count },
          facCycleStart: wasZero
            ? { ...s.facCycleStart, [facId]: Date.now() }
            : s.facCycleStart,
        };
      });
    },

    buyManager(facId) {
      set(s => {
        const fac = FAC.find(f => f.id === facId);
        if (!fac || s.facManagers[facId] || s.coins < fac.managerCost) return {};
        return {
          coins:       s.coins - fac.managerCost,
          facManagers: { ...s.facManagers, [facId]: true },
        };
      });
    },

    activateBoost() {
      set(s => {
        if (s.gems < BOOST_COST) return {};
        return { gems: s.gems - BOOST_COST, boostEndTime: Date.now() + BOOST_DURATION_MS };
      });
    },

    tap() {
      set(s => {
        const g = calcGlobalMul(s.unlockedZones, s.couriers, s.prestigeLevel, Date.now() < s.boostEndTime);
        let income = FAC.reduce((sum, fac) => {
          const lv = s.facLevels[fac.id] || 0;
          if (!lv) return sum;
          return sum + getFacIncomePerCycle(fac, lv) * g / fac.baseTime * 2;
        }, 0);
        income = Math.max(income, 1);
        return { coins: s.coins + income, totalEarned: s.totalEarned + income };
      });
    },

    unlockZone(zoneId) {
      set(s => {
        const zone = ZONES.find(z => z.id === zoneId);
        if (!zone || s.unlockedZones.includes(zoneId) || s.coins < zone.unlockCost) return {};
        return { coins: s.coins - zone.unlockCost, unlockedZones: [...s.unlockedZones, zoneId] };
      });
    },

    recruit(isPremium) {
      set(s => {
        const cost     = isPremium ? 300 : 500;
        const currency = isPremium ? 'gems' : 'coins';
        if (s[currency] < cost) return {};
        const rarityIdx = rollGacha(isPremium);
        const name      = pickCourierName(rarityIdx, s.couriers);
        const courier   = { id: Date.now(), name, rarityIdx };
        return { [currency]: s[currency] - cost, couriers: [...s.couriers, courier], lastRecruitResult: courier };
      });
    },

    prestige() {
      set(s => {
        if (s.totalEarned < PRESTIGE_THRESHOLD) return {};
        const earnedBadges = calcPrestigeBadges(s.totalEarned);
        return {
          coins: 10, gems: s.gems, totalEarned: 0,
          facLevels: {}, facCycleStart: {}, facReady: {}, facManagers: {},
          unlockedZones: ['alley'], couriers: s.couriers,
          prestigeLevel: s.prestigeLevel + earnedBadges, seenMilestones: [], showPrestige: false,
        };
      });
    },

    // 스폰서 배달 보너스 (광고 리워드) — 무료 ×2 부스트, 쿨다운제
    isAdBoostReady: () => Date.now() >= get().adBoostCooldownEnd,
    activateAdBoost() {
      set(s => {
        const now = Date.now();
        if (now < s.adBoostCooldownEnd) return {};
        return {
          boostEndTime:       Math.max(s.boostEndTime, now) + AD_BOOST_DURATION_MS,
          adBoostCooldownEnd: now + AD_BOOST_COOLDOWN_MS,
        };
      });
    },

    // 야간 배송 정산 2배 — 스폰서 광고로 보너스(원금과 동일) 추가 수령
    claimOfflineDouble() {
      set(s => {
        if (!s.offlineReward) return {};
        const bonus = s.offlineReward.coins;
        return {
          coins:       s.coins + bonus,
          totalEarned: s.totalEarned + bonus,
          offlineReward: null,
        };
      });
    },

    // 오늘의 출근 도장
    claimCheckIn() {
      set(s => {
        const today = todayKey();
        if (s.lastCheckIn === today) return { showCheckIn: false };
        const streak = (s.checkInStreak % 7) + 1;       // 1~7 주기
        const reward = CHECKIN_REWARDS[streak - 1];
        const now    = Date.now();
        return {
          gems:          s.gems + reward.gems,
          boostEndTime:  reward.boost ? Math.max(s.boostEndTime, now) + BOOST_DURATION_MS : s.boostEndTime,
          lastCheckIn:   today,
          checkInStreak: streak,
          showCheckIn:   false,
          toast:         { msg: `출근 도장 ${streak}일차! ${reward.label}`, gemReward: reward.gems },
        };
      });
    },
    closeCheckIn() { set({ showCheckIn: false }); },

    setBuyCount(n)   { set({ buyCount: n }); },
    setTab(tab)      { set({ activeTab: tab }); },
    openPrestige()   { set({ showPrestige: true }); },
    closePrestige()  { set({ showPrestige: false }); },
    openRecruit(p)   { set({ showRecruit: true, recruitIsPremium: p, lastRecruitResult: null }); },
    closeRecruit()   { set({ showRecruit: false, lastRecruitResult: null }); },
    dismissOffline() { set({ offlineReward: null }); },
    dismissToast()   { set({ toast: null }); },

    save() { saveStateAsync(get()); },
    async loadFromNative() {
      const loaded  = await loadStateAsync();
      if (!loaded) return;
      const offline = calcOffline(loaded);
      set({
        ...defaultState(), ...loaded,
        coins:       (loaded.coins       || 10) + offline.coins,
        totalEarned: (loaded.totalEarned || 0)  + offline.coins,
        offlineReward: offline.coins > 0.1 ? offline : null,
        showCheckIn:  (loaded.lastCheckIn || '') !== todayKey(),
      });
    },
  };
});
