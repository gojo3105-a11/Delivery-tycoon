export const FAC = [
  { id: 'packing',  name: '포장 테이블',      emoji: '📦', baseCost: 15,     baseRPS: 0.1,   cMul: 1.15, rMul: 1.10 },
  { id: 'bag',      name: '배달 가방',         emoji: '🎒', baseCost: 110,    baseRPS: 0.5,   cMul: 1.15, rMul: 1.10 },
  { id: 'belt',     name: '분류 벨트',         emoji: '⚙️', baseCost: 1200,   baseRPS: 4,     cMul: 1.15, rMul: 1.10 },
  { id: 'scooter',  name: '스쿠터 도크',       emoji: '🛵', baseCost: 13000,  baseRPS: 28,    cMul: 1.15, rMul: 1.10 },
  { id: 'battery',  name: '배터리 충전기',     emoji: '🔋', baseCost: 140000, baseRPS: 200,   cMul: 1.15, rMul: 1.10 },
  { id: 'snackbar', name: '스낵 바',           emoji: '🍡', baseCost: 1.5e6,  baseRPS: 1400,  cMul: 1.15, rMul: 1.10 },
  { id: 'dispatch', name: '배차 보드',         emoji: '📋', baseCost: 2e7,    baseRPS: 10000, cMul: 1.15, rMul: 1.10 },
  { id: 'auto',     name: '자동 정산 데스크',  emoji: '🤖', baseCost: 3.5e8,  baseRPS: 80000, cMul: 1.15, rMul: 1.10 },
];

export const ZONES = [
  { id: 'alley',       name: '골목 배달소', unlockCost: 0,     mul: 1.0,   emoji: '🏘️' },
  { id: 'residential', name: '주택가',      unlockCost: 2000,  mul: 2.0,   emoji: '🏠' },
  { id: 'commercial',  name: '상업지구',    unlockCost: 20000, mul: 4.0,   emoji: '🏪' },
  { id: 'industrial',  name: '산업단지',    unlockCost: 200000,mul: 8.0,   emoji: '🏭' },
  { id: 'newtown',     name: '신도시',      unlockCost: 2e6,   mul: 16.0,  emoji: '🏙️' },
  { id: 'downtown',    name: '도심',        unlockCost: 2e7,   mul: 30.0,  emoji: '🌆' },
  { id: 'harbor',      name: '항구',        unlockCost: 2e8,   mul: 55.0,  emoji: '⛵' },
  { id: 'airport',     name: '공항',        unlockCost: 2e9,   mul: 100.0, emoji: '✈️' },
  { id: 'global',      name: '글로벌 허브', unlockCost: 2e10,  mul: 200.0, emoji: '🌍' },
  { id: 'future',      name: '미래 도시',   unlockCost: 2e11,  mul: 400.0, emoji: '🚀' },
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

export const MILESTONES = [
  [100,   '첫 100 코인! 🎊',      0],
  [1000,  '1,000 코인 돌파!',     5],
  [10000, '1만 코인 달성!',       10],
  [1e5,   '10만 코인! 💰',        20],
  [1e6,   '백만 코인! 💎',        50],
  [1e9,   '십억 코인! 🌟',        100],
  [1e12,  '조 코인!! 🔥',         500],
];

export const PRESTIGE_THRESHOLD = 1e6;

export function getFacCost(fac, level) {
  return Math.floor(fac.baseCost * Math.pow(fac.cMul, level));
}

export function getFacRPS(fac, level) {
  return fac.baseRPS * Math.pow(fac.rMul, level);
}

export function calcZoneMul(unlockedZones) {
  return ZONES
    .filter(z => unlockedZones.includes(z.id))
    .reduce((sum, z) => sum + z.mul, 0);
}

export function calcCourierMul(couriers) {
  if (!couriers.length) return 1;
  return 1 + couriers.reduce((sum, c) => sum + RARITY[c.rarityIdx].mul * 0.02, 0);
}

export function calcTotalRPS(facLevels, unlockedZones, couriers, prestigeLevel) {
  const facRPS = FAC.reduce((sum, fac) => {
    const lvl = facLevels[fac.id] || 0;
    return sum + (lvl > 0 ? getFacRPS(fac, lvl) : 0);
  }, 0);
  const zoneMul    = calcZoneMul(unlockedZones);
  const courierMul = calcCourierMul(couriers);
  const pMul       = 1 + prestigeLevel * 0.05;
  return facRPS * zoneMul * courierMul * pMul;
}

export function fmtNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export function rollGacha(isPremium) {
  const rates = isPremium ? PREMIUM_RATES : BASIC_RATES;
  const rand = Math.random();
  let cum = 0;
  for (let i = 0; i < rates.length; i++) {
    cum += rates[i];
    if (rand < cum) return i;
  }
  return rates.length - 1;
}

export function pickCourierName(rarityIdx, existing) {
  const pool = COURIER_NAMES[rarityIdx];
  const used = new Set(existing.filter(c => c.rarityIdx === rarityIdx).map(c => c.name));
  const avail = pool.filter(n => !used.has(n));
  const names = avail.length > 0 ? avail : pool;
  return names[Math.floor(Math.random() * names.length)];
}
