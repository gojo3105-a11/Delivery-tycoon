# 고슴도치 배달 타이쿤 - 경제 공식 설계서

> 모든 공식의 구현 위치: `Assets/_Project/Scripts/Economy/EconomyCalculator.cs`

---

## 공식 1: 시설 업그레이드 비용

**공식**
```
cost(level) = baseCost × costGrowthRate^currentLevel
```

**예시** (포장 테이블: baseCost=100, growthRate=1.15)

| 현재 레벨 | 업그레이드 비용 |
|----------|--------------|
| 0 (1레벨로 업) | 100 |
| 1 (2레벨로 업) | 115 |
| 5 (6레벨로 업) | 201 |
| 10 (11레벨로 업) | 404 |
| 20 (21레벨로 업) | 1,637 |
| 30 (31레벨로 업) | 6,621 |
| 50 (51레벨로 업 — MAX 초과) | — |

**구현 파일**: `EconomyCalculator.CalculateFacilityUpgradeCost(FacilityData, int)`

**설계 의도**:
- 1.15 성장률은 빠른 초반 진행을 유지하면서도 후반 의미 있는 코인 소모를 만듦
- 시설마다 baseCost와 growthRate를 FacilityData SO로 개별 조정 가능

---

## 공식 2: 시설 수익 (초당)

**공식**
```
revenue(level) = baseRevenue × revenueGrowthRate^(level-1)
```

**예시** (포장 테이블: baseRevenue=10, growthRate=1.10)

| 레벨 | 초당 수익 |
|------|----------|
| 1 | 10.0 |
| 5 | 14.6 |
| 10 | 23.6 |
| 20 | 61.2 |
| 30 | 158.6 |
| 50 | 1,062.2 |

**구현 파일**: `EconomyCalculator.CalculateFacilityRevenue(FacilityData, int)`

**설계 의도**:
- 수익 성장률(1.10)이 비용 성장률(1.15)보다 낮아 업그레이드 후 즉시 수익보다 장기 누적 이득이 더 중요
- ROI(투자 회수 시간) = UpgradeCost / (NextRevenue - CurrentRevenue)

---

## 공식 3: 택배원 효율

**공식**
```
efficiency = baseSpeed × rarityMultiplier × levelMultiplier × vehicleBonus

levelMultiplier = levelStatGrowthRate^(level - 1)
```

**희귀도 배율 테이블**

| 희귀도 | 배율 |
|--------|------|
| 일반 (Common) | ×1.0 |
| 희귀 (Rare) | ×1.5 |
| 에픽 (Epic) | ×2.5 |
| 전설 (Legendary) | ×4.0 |
| 신화 (Mythic) | ×7.0 |

**예시** (에픽 캐릭터: baseSpeed=10, rarity=×2.5, lv=10, levelGrowth=1.05, vehicleBonus=1.2)
```
efficiency = 10 × 2.5 × (1.05^9) × 1.2
           = 10 × 2.5 × 1.551 × 1.2
           = 46.5
```

**구현 파일**: `EconomyCalculator.CalculateCourierEfficiency()`

---

## 공식 4: 배달 수익

**공식**
```
deliveryRevenue = baseOrderValue × zoneMultiplier × facilityMultiplier × courierBonus × prestigeMultiplier
```

**변수 설명**

| 변수 | 소스 | 범위 |
|------|------|------|
| baseOrderValue | EconomyConfig.baseOrderValue | 기본 10 코인 |
| zoneMultiplier | DeliveryZoneData.zoneRevenueMultiplier | 1.0 ~ 100.0 |
| facilityMultiplier | FacilityManager.GetFacilityEffectMultiplier(PackingTable) | 1.0 ~ 50.0 |
| courierBonus | HedgehogCharacter.CurrentRevenueBonus | 1.0 ~ 10.0 |
| prestigeMultiplier | EconomyConfig.GetPrestigeMultiplier(level) | 1.0 + |

**예시** (구역 5: zoneMultiplier=10, facility=3.0, courier=2.0, prestige=1.15)
```
revenue = 10 × 10 × 3.0 × 2.0 × 1.15
        = 690 코인/배달
```

**구현 파일**: `EconomyCalculator.CalculateDeliveryRevenue()`

---

## 공식 5: 오프라인 보상

**공식**
```
offlineSeconds = (현재 UTC) - (마지막 로그인 UTC)
cappedSeconds  = min(offlineSeconds, offlineMaxHours × 3600)
offlineReward  = averageRevenuePerSecond × cappedSeconds × offlineEfficiencyRate
```

**기본 파라미터**

| 파라미터 | 기본값 | 최대값 |
|----------|--------|--------|
| offlineMaxHours | 8시간 | 자동 정산 데스크 업그레이드로 최대 16시간 |
| offlineEfficiencyRate | 0.5 (50%) | 자동 정산 데스크 업그레이드로 최대 0.75 (75%) |

**예시** (초당 평균 수익 1,000코인, 오프라인 10시간)
```
cappedSeconds = min(36000, 8×3600) = 28800초
offlineReward = 1000 × 28800 × 0.5 = 14,400,000 코인
```

**시간 조작 방지**:
- `offlineSeconds < 0` 이면 0으로 처리
- 극단적으로 긴 오프라인 시간(>24시간)은 최대값으로 캡

**구현 파일**: `OfflineRewardManager.CalculateOfflineReward()`

---

## 공식 6: 광고 보상 배율

**공식**
```
finalReward = baseReward × rewardedAdMultiplier
```

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| rewardedAdMultiplier | 3.0 | EconomyConfig에서 조정 가능 |

**적용 시나리오**:
- 오프라인 보상: baseReward = offlineReward
- 배달 수익 즉시 배수: baseReward = 마지막 60초 수익
- 스낵 토큰 추가: baseReward = 스낵 토큰 1개 생산량

**구현 파일**: `EconomyCalculator.ApplyAdMultiplier()`

---

## 공식 7: 프레스티지 배율

**공식**
```
prestigeMultiplier = 1.0 + (prestigeLevel × prestigeMultiplierPerStar)
```

| 프레스티지 레벨 | 수익 배율 |
|---------------|----------|
| 0 | ×1.0 |
| 1 | ×1.05 |
| 5 | ×1.25 |
| 10 | ×1.5 |
| 20 | ×2.0 |

**구현 파일**: `EconomyConfig.GetPrestigeMultiplier(int)`

---

## 공식 8: 구역 해금 비용

**공식**
```
zoneCost(index) = baseZoneCost × unlockCostGrowthRate^zoneIndex
```

**예시** (baseZoneCost=10,000, growthRate=3.0)

| 구역 | 해금 비용 |
|------|----------|
| 0 (골목 배달소) | 0 (무료) |
| 1 (주택가) | 10,000 |
| 2 (상업지구) | 30,000 |
| 3 (산업단지) | 90,000 |
| 4 (신도시) | 270,000 |
| 5 (도심) | 810,000 |
| 6 (항구) | 2,430,000 |
| 7 (공항) | 7,290,000 |
| 8 (글로벌 허브) | 21,870,000 |
| 9 (미래 도시) | 65,610,000 |

---

## 공식 9: 초당 평균 수익 추정 (DeliveryManager)

```
totalFacilityRevenue = Σ facilityRevenue(level) for all unlocked facilities
courierContribution  = totalFacilityRevenue × (avgCourierEfficiency × 0.1)
revenuePerSecond     = (totalFacilityRevenue + courierContribution) × prestigeMultiplier
```

**구현 파일**: `EconomyCalculator.EstimateRevenuePerSecond()`

---

## 밸런스 체크리스트

- [ ] 레벨 1~10: 30분 이내 첫 구역 확장 가능
- [ ] 레벨 10~30: 1~2시간 세션에서 2~3개 구역 추가 해금
- [ ] 오프라인 8시간 보상이 세션 30분 수익의 2~3배를 넘지 않음 (복귀 동기 유지)
- [ ] 프레스티지 1회: 20~30시간 적극 플레이 후 가능
- [ ] 광고 3배 보상이 유료 구매 없이도 충분한 진행감 제공
