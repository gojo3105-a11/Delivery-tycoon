export const FAC = [
  { id: 'packing',  name: '포장 테이블',      emoji: '📦', baseCost: 15,      baseTime: 1,    baseIncome: 0.08,   cMul: 1.15, managerCost: 500 },
  { id: 'bag',      name: '배달 가방',         emoji: '🎒', baseCost: 100,     baseTime: 4,    baseIncome: 0.6,    cMul: 1.15, managerCost: 3000 },
  { id: 'belt',     name: '분류 벨트',         emoji: '⚙️', baseCost: 1100,    baseTime: 10,   baseIncome: 5,      cMul: 1.15, managerCost: 30000 },
  { id: 'scooter',  name: '스쿠터 도크',       emoji: '🛵', baseCost: 12000,   baseTime: 25,   baseIncome: 35,     cMul: 1.15, managerCost: 350000 },
  { id: 'battery',  name: '배터리 충전기',     emoji: '🔋', baseCost: 130000,  baseTime: 60,   baseIncome: 270,    cMul: 1.15, managerCost: 4000000 },
  { id: 'snackbar', name: '스낵 바',           emoji: '🍡', baseCost: 1.4e6,   baseTime: 120,  baseIncome: 2000,   cMul: 1.15, managerCost: 50000000 },
  { id: 'dispatch', name: '배차 보드',         emoji: '📋', baseCost: 2e7,     baseTime: 240,  baseIncome: 14000,  cMul: 1.15, managerCost: 700000000 },
  { id: 'auto',     name: '자동 정산 데스크',  emoji: '🤖', baseCost: 3.5e8,   baseTime: 480,  baseIncome: 100000, cMul: 1.15, managerCost: 1e10 },
];

export const FAC_MILESTONE_LEVELS = [10, 25, 50, 100, 200, 300, 400, 500];
export const FAC_MILESTONE_MULS   = [2,   5,  10,  25,  50, 100, 200, 500];

export function getFacMilestoneMul(level) {
  let mul = 1;
  for (let i = 0; i < FAC_MILESTONE_LEVELS.length; i++) {
    if (level >= FAC_MILESTONE_LEVELS[i]) mul *= FAC_MILESTONE_MULS[i];
    else break;
  }
  return mul;
}

export function getNextMilestone(level) {
  return FAC_MILESTONE_LEVELS.find(m => level < m) ?? null;
}

export function getFacCost(fac, level) {
  return Math.ceil(fac.baseCost * Math.pow(fac.cMul, level));
}

export function getFacBulkCost(fac, level, count) {
  const r = fac.cMul;
  return Math.ceil(fac.baseCost * Math.pow(r, level) * (Math.pow(r, count) - 1) / (r - 1));
}

export function getFacMaxBuy(fac, level, coins) {
  let count = 0;
  let total = 0;
  for (let l = level; ; l++) {
    const c = getFacCost(fac, l);
    if (total + c > coins || count >= 1000) break;
    total += c;
    count++;
  }
  return { count, cost: total };
}

export function getFacIncomePerCycle(fac, level) {
  if (level === 0) return 0;
  return fac.baseIncome * level * getFacMilestoneMul(level);
}

export const ZONES = [
  { id: 'alley',       name: '골목 배달소', unlockCost: 0,     mul: 1.0,   emoji: '🏘️' },
  { id: 'residential', name: '주택가',      unlockCost: 500,   mul: 2.0,   emoji: '🏠' },
  { id: 'commercial',  name: '상업지구',    unlockCost: 5000,  mul: 4.0,   emoji: '🏪' },
  { id: 'industrial',  name: '산업단지',    unlockCost: 50000, mul: 8.0,   emoji: '🏭' },
  { id: 'newtown',     name: '신도시',      unlockCost: 5e5,   mul: 16.0,  emoji: '🏙️' },
  { id: 'downtown',    name: '도심',        unlockCost: 5e6,   mul: 30.0,  emoji: '🌆' },
  { id: 'harbor',      name: '항구',        unlockCost: 5e7,   mul: 55.0,  emoji: '⛵' },
  { id: 'airport',     name: '공항',        unlockCost: 5e8,   mul: 100.0, emoji: '✈️' },
  { id: 'global',      name: '글로벌 허브', unlockCost: 5e9,   mul: 200.0, emoji: '🌍' },
  { id: 'future',      name: '미래 도시',   unlockCost: 5e10,  mul: 400.0, emoji: '🚀' },
];

export const RARITY = [
  { name: '일반', color: '#888090', bg: 'rgba(136,128,144,.12)', mul: 1.0 },
  { name: '희귀', color: '#2080E8', bg: 'rgba(32,128,232,.12)',  mul: 1.5 },
  { name: '에픽', color: '#9C40F5', bg: 'rgba(156,64,245,.12)',  mul: 2.5 },
  { name: '전설', color: '#E8920A', bg: 'rgba(232,146,10,.12)',  mul: 4.0 },
  { name: '신화', color: '#EE3890', bg: 'rgba(238,56,144,.12)',  mul: 7.0 },
];

export const COURIER_NAMES = [
  ['쏜이', '바늘이', '고슴이', '동글이', '찌릿이'],
  ['스피디', '터보', '제트', '퀵킥', '플래시'],
  ['캡틴 바늘', '매직 고슴', '썬더', '스톰', '골든 바늘'],
  ['알파 가시', '스타', '드래곤 고슴', '나이트', '크리스탈'],
  ['우주 배달러', '고슴 신', '타임 가시', '가이아', '오메가'],
];

export const BASIC_RATES   = [0.60, 0.25, 0.10, 0.04, 0.01];
export const PREMIUM_RATES = [0,    0.30, 0.35, 0.25, 0.10];

export const COIN_MILESTONES = [
  [100,   '첫 100 코인! 🎊',      0],
  [1000,  '1,000 코인 돌파!',     5],
  [10000, '1만 코인 달성!',       10],
  [1e5,   '10만 코인! 💰',        20],
  [1e6,   '백만 코인! 💎',        50],
  [1e9,   '십억 코인! 🌟',        100],
  [1e12,  '조 코인!! 🔥',         500],
];

export const PRESTIGE_THRESHOLD = 1e6;
export const BOOST_COST         = 50;   // gems
export const BOOST_DURATION_MS  = 4 * 3600 * 1000;

export function calcZoneMul(unlockedZones) {
  return ZONES.filter(z => unlockedZones.includes(z.id)).reduce((s, z) => s + z.mul, 0);
}

export function calcCourierMul(couriers) {
  if (!couriers.length) return 1;
  return 1 + couriers.reduce((s, c) => s + RARITY[c.rarityIdx].mul * 0.02, 0);
}

export function calcGlobalMul(unlockedZones, couriers, prestigeLevel, boostActive) {
  return calcZoneMul(unlockedZones)
    * calcCourierMul(couriers)
    * (1 + prestigeLevel * 0.05)
    * (boostActive ? 2 : 1);
}

export function calcDisplayRPS(facLevels, facManagers, unlockedZones, couriers, prestigeLevel, boostActive) {
  const g = calcGlobalMul(unlockedZones, couriers, prestigeLevel, boostActive);
  return FAC.reduce((sum, fac) => {
    const lv = facLevels[fac.id] || 0;
    if (!lv || !facManagers[fac.id]) return sum;
    return sum + getFacIncomePerCycle(fac, lv) * g / fac.baseTime;
  }, 0);
}

export function fmtNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + 'K';
  return Math.floor(n).toString();
}

export function fmtTime(secs) {
  if (secs < 60)   return `${Math.ceil(secs)}초`;
  if (secs < 3600) return `${Math.floor(secs / 60)}분 ${Math.ceil(secs % 60)}초`;
  return `${Math.floor(secs / 3600)}시간 ${Math.floor((secs % 3600) / 60)}분`;
}

export function rollGacha(isPremium) {
  const rates = isPremium ? PREMIUM_RATES : BASIC_RATES;
  let cum = 0;
  const r = Math.random();
  for (let i = 0; i < rates.length; i++) {
    cum += rates[i];
    if (r < cum) return i;
  }
  return rates.length - 1;
}

export function pickCourierName(rarityIdx, existing) {
  const pool = COURIER_NAMES[rarityIdx];
  const used = new Set(existing.filter(c => c.rarityIdx === rarityIdx).map(c => c.name));
  const avail = pool.filter(n => !used.has(n));
  const names = avail.length ? avail : pool;
  return names[Math.floor(Math.random() * names.length)];
}
