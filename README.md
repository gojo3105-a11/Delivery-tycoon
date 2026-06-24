# 고슴도치 배달 타이쿤 (Hedgehog Delivery Tycoon)

## 프로젝트 개요

귀여운 고슴도치 택배원들을 고용하고, 배달 허브를 업그레이드하며, 물류 자동화로
작은 골목 배달소에서 글로벌 배달 제국을 건설하는 모바일 방치형 타이쿤 게임.

- **엔진**: Unity 6 (LTS)
- **플랫폼**: Android 8.0+, iOS 13+
- **장르**: Mobile Idle Tycoon / Casual Simulation

---

## 문서 목록

| 문서 | 경로 | 내용 |
|------|------|------|
| GDD | `docs/GDD.md` | 게임 디자인 문서 전체 |
| TDD | `docs/TDD.md` | 기술 디자인 문서 전체 |
| 경제 공식 | `docs/ECONOMY.md` | 모든 수익/비용 계산 공식 |
| 분석 이벤트 | `docs/ANALYTICS.md` | Firebase Analytics 이벤트 설계 |
| MVP 로드맵 | `docs/MVP_ROADMAP.md` | 3개월 개발 계획 |
| QA 체크리스트 | `docs/QA_CHECKLIST.md` | 출시 전 QA 항목 |

---

## Unity 스크립트 구조

```
Assets/_Project/Scripts/
├── Core/         GameManager, ServiceLocator, IService, GameConstants
├── Data/         HedgehogData, FacilityData, VehicleData, EconomyConfig, DataManager
├── Save/         SaveData, SaveManager
├── Economy/      CurrencyType, EconomyManager, EconomyCalculator
├── Delivery/     DeliveryOrder, DeliveryManager
├── Characters/   HedgehogRarity, HedgehogCharacter, CharacterManager
├── Facilities/   FacilityType, FacilityInstance, FacilityManager
├── Offline/      OfflineRewardManager
├── UI/           UIView, UIManager, MainHubView, FacilityUpgradeView, OfflineRewardPopup
├── Ads/          IRewardedAdProvider, AdManager
├── IAP/          ProductId, IAPManager
└── Analytics/    AnalyticsEventName, AnalyticsManager
```

---

## 핵심 게임 루프

```
주문 발생 → 택배원 배달 처리 → 코인 획득 → 시설 업그레이드
→ 효율 증가 → 더 많은 주문 처리 → 새 구역 해금 → 더 좋은 택배원 채용
→ 오프라인 수익 증가 → 복귀 후 재투자
```

---

## 네임스페이스

```
HedgehogDeliveryTycoon.Core / Data / Save / Economy
HedgehogDeliveryTycoon.Delivery / Characters / Facilities / Offline
HedgehogDeliveryTycoon.UI / Ads / IAP / Analytics
```