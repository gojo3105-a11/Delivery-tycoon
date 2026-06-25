export const FAC = [
  { id: 'packing', name: '포장 테이블', emoji: '📦', baseCost: 15, baseRPS: 0.1, cMul: 1.15, rMul: 1.1 },
  { id: 'bag', name: '배달 가방', emoji: '🎒', baseCost: 110, baseRPS: 0.5, cMul: 1.15, rMul: 1.1 },
  { id: 'belt', name: '분류 벨트', emoji: '⚙️', baseCost: 1200, baseRPS: 4, cMul: 1.15, rMul: 1.1 },
  { id: 'scooter', name: '스쿠터 링크', emoji: '🛵', baseCost: 13000, baseRPS: 28, cMul: 1.15, rMul: 1.1 },
  { id: 'battery', name: '배터리 충전기', emoji: '🔋', baseCost: 140000, baseRPS: 200, cMul: 1.15, rMul: 1.1 },
  { id: 'snackbar', name: '간식 바', emoji: '🍩', baseCost: 1.5e6, baseRPS: 1400, cMul: 1.15, rMul: 1.1 },
  { id: 'dispatch', name: '배차 보드', emoji: '📋', baseCost: 2e7, baseRPS: 10000, cMul: 1.15, rMul: 1.1 },
  { id: 'auto', name: '자동 정산 시스템', emoji: '🤖', baseCost: 3.5e8, baseRPS: 80000, cMul: 1.15, rMul: 1.1 },
];

export const ZONES = [
  { id: 'alley', name: '골목 배달존', unlockCost: 0, mul: 1, emoji: '🏘️' },
  { id: 'residential', name: '주택가', unlockCost: 2000, mul: 2, emoji: '🏡' },
  { id: 'commercial', name: '상업지구', unlockCost: 20000, mul: 4, emoji: '🏬' },
  { id: 'industrial', name: '산업단지', unlockCost: 200000, mul: 8, emoji: '🏭' },
  { id: 'newtown', name: '신도시', unlockCost: 2e6, mul: 16, emoji: '🌆' },
  { id: 'downtown', name: '도심', unlockCost: 2e7, mul: 30, emoji: '🏙️' },
  { id: 'harbor', name: '항구', unlockCost: 2e8, mul: 55, emoji: '⚓' },
  { id: 'airport', name: '공항', unlockCost: 2e9, mul: 100, emoji: '✈️' },
  { id: 'global', name: '글로벌 허브', unlockCost: 2e10, mul: 200, emoji: '🌍' },
  { id: 'future', name: '미래 도시', unlockCost: 2e11, mul: 400, emoji: '🚀' },
];

export const RARITY = [
  { name: '일반', color: '#6B7280', bg: 'rgba(107,114,128,.12)', mul: 1 },
  { name: '희귀', color: '#2080E8', bg: 'rgba(32,128,232,.12)', mul: 1.5 },
  { name: '에픽', color: '#9C40F5', bg: 'rgba(156,64,245,.12)', mul: 2.5 },
  { name: '전설', color: '#E8920A', bg: 'rgba(232,146,10,.12)', mul: 4 },
  { name: '신화', color: '#EE3890', bg: 'rgba(238,56,144,.12)', mul: 7 },
];

export const COURIER_NAMES = [
  ['데이지', '바늘이', '고도치', '도토리', '찰리'],
  ['스피디', '터보', '라이트', '통통', '플래시'],
  ['캡틴 바늘', '매직 고슴', '라이더', '스노우', '골든 바늘'],
  ['알파 가시', '스텔라', '드래곤 고슴', '네온', '프리즘'],
  ['우주 배달왕', '고슴 신', '타임 가시', '갤럭시아', '오메가'],
];

export const BASIC_RATES = [0.6, 0.25, 0.1, 0.04, 0.01];
export const PREMIUM_RATES = [0, 0.3, 0.35, 0.25, 0.1];

export const MILESTONES = [
  [100, '첫 100 코인 달성!', 0],
  [1000, '1,000 코인 돌파!', 5],
  [10000, '1만 코인 달성!', 10],
  [1e5, '10만 코인!', 20],
  [1e6, '백만 코인!', 50],
  [1e9, '10억 코인!', 100],
  [1e12, '조 단위 배달왕!', 500],
];

export const SAVE_KEY = 'hdt_v5';

export function fmtNum(value) {
  if (!Number.isFinite(value)) return '0';
  if (value < 1000) return value.toFixed(value < 10 ? 1 : 0);
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let unit = 0;
  let n = value;
  while (n >= 1000 && unit < units.length - 1) {
    n /= 1000;
    unit += 1;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)}${units[unit]}`;
}

export function facilityCost(facility, level) {
  return Math.floor(facility.baseCost * Math.pow(facility.cMul, level));
}

export function facilityRps(facility, level) {
  return facility.baseRPS * level * Math.pow(facility.rMul, Math.max(0, level - 1));
}

export function drawRarityIndex(rates) {
  const roll = Math.random();
  let acc = 0;
  for (let i = 0; i < rates.length; i += 1) {
    acc += rates[i];
    if (roll <= acc) return i;
  }
  return rates.length - 1;
}

export function makeCourier(rarityIndex) {
  const names = COURIER_NAMES[rarityIndex];
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    rarity: rarityIndex,
    name: names[Math.floor(Math.random() * names.length)],
    bonus: RARITY[rarityIndex].mul * 0.02,
  };
}
