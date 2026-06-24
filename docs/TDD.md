# 고슴도치 배달 타이쿤 (Hedgehog Delivery Tycoon)
## 기술 디자인 문서 (TDD) v1.0

> 작성일: 2026-06-24 | 버전: 1.0 | 엔진: Unity 6 (LTS) | 타겟: Android / iOS

---

## Part B-1. 프로젝트 아키텍처

### 설계 원칙

| 원칙 | 설명 |
|------|------|
| 데이터 주도 설계 | 모든 게임 밸런스 수치는 ScriptableObject로 분리, 코드 수정 없이 변경 가능 |
| ScriptableObject 정적 데이터 | 캐릭터, 시설, 차량, 경제 설정을 SO로 관리 |
| JSON 저장 | 진행 데이터는 JSON 직렬화 후 로컬 파일 저장 (AES-128 암호화) |
| 매니저 기반 런타임 | 모든 시스템은 독립적인 매니저 클래스로 분리, ServiceLocator 패턴 |
| 이벤트 주도 UI | C# Action 및 UnityEvent 기반 UI 업데이트, 폴링 최소화 |
| Addressables 준비 | 에셋은 Addressables 구조로 관리, 런타임 동적 로드 대응 |
| Firebase 준비 | 분석 이벤트는 AnalyticsManager 단일 진입점으로 추상화 |
| IAP 준비 | Unity IAP 패키지 기반, IAPManager 추상화 레이어 |
| 광고 SDK 준비 | IRewardedAdProvider 인터페이스로 AdMob/MAX 교체 가능 |

---

## Part B-2. Unity 폴더 구조

```
Assets/
└── _Project/
    ├── Art/
    │   ├── Characters/         # 고슴도치 캐릭터 스프라이트, 애니메이션
    │   ├── Facilities/         # 시설 스프라이트 (레벨별)
    │   ├── UI/                 # UI 아이콘, 버튼, 패널 배경
    │   ├── Effects/            # 파티클 이펙트, VFX
    │   └── Backgrounds/        # 배경 일러스트 (구역별)
    │
    ├── Audio/
    │   ├── BGM/                # 배경음악 (구역별, 이벤트별)
    │   └── SFX/                # 효과음 (버튼 클릭, 배달 완료, 업그레이드 등)
    │
    ├── Fonts/                  # 한글 폰트, UI 폰트
    ├── Materials/              # 쉐이더 머티리얼
    │
    ├── Prefabs/
    │   ├── Characters/         # 고슴도치 캐릭터 프리팹
    │   ├── Facilities/         # 시설 프리팹 (레벨별)
    │   ├── UI/                 # UI 프리팹 (팝업, 패널, 버튼)
    │   └── Effects/            # 파티클 이펙트 프리팹
    │
    ├── Scenes/
    │   ├── Boot/               # BootScene.unity
    │   ├── Main/               # MainGameScene.unity
    │   └── Loading/            # LoadingScene.unity
    │
    ├── Scripts/
    │   ├── Core/               # 게임 코어 시스템
    │   ├── Data/               # 정적 데이터 클래스 (ScriptableObject 참조)
    │   ├── Save/               # 저장/불러오기 시스템
    │   ├── Economy/            # 통화 및 경제 계산
    │   ├── Delivery/           # 배달 주문 및 처리 시스템
    │   ├── Characters/         # 고슴도치 캐릭터 시스템
    │   ├── Facilities/         # 시설 인스턴스 및 관리
    │   ├── Offline/            # 오프라인 수익 계산
    │   ├── UI/                 # UI 뷰 및 매니저
    │   ├── Ads/                # 광고 SDK 추상화
    │   ├── IAP/                # 인앱 결제 시스템
    │   ├── Analytics/          # Firebase 분석 이벤트
    │   └── Utilities/          # 공통 유틸리티 (수식, 확장 메서드 등)
    │
    ├── ScriptableObjects/
    │   ├── Characters/         # HedgehogData SO 에셋
    │   ├── Facilities/         # FacilityData SO 에셋
    │   ├── Vehicles/           # VehicleData SO 에셋
    │   ├── Economy/            # EconomyConfig, UpgradeConfig SO 에셋
    │   └── Events/             # EventData SO 에셋
    │
    ├── Addressables/           # Addressables 그룹 설정
    ├── Resources/              # 런타임 Resources.Load 용 에셋 (최소화)
    └── StreamingAssets/        # 서버 설정 JSON 등 스트리밍 에셋
```

---

## Part B-3. 씬 구조

### BootScene
- **책임**: 게임 최초 진입점. 초기화 순서 보장.
- **수행 작업**:
  1. 퍼시스턴트 매니저 오브젝트 생성 (DontDestroyOnLoad)
  2. ServiceLocator 초기화
  3. DataManager: ScriptableObject 로드
  4. SaveManager: 저장 데이터 로드 (파일 I/O)
  5. EconomyManager, FacilityManager, CharacterManager 초기화
  6. FirebaseApp 초기화 (비동기)
  7. 초기화 완료 후 LoadingScene으로 전환
- **포함 오브젝트**: `[BootController]`, `[ServiceLocator]`
- **주의**: 모든 초기화가 완료될 때까지 LoadingScene으로 넘어가지 않음

### LoadingScene
- **책임**: 에셋 로드 진행 표시, 사용자 경험 보호
- **수행 작업**:
  1. Addressables 원격 카탈로그 업데이트 확인
  2. 핵심 에셋 프리로드 (캐릭터 스프라이트, UI 프리팹)
  3. 네트워크 연결 확인 (실패 시 오프라인 모드)
  4. 로딩 완료 후 MainGameScene으로 전환
- **포함 오브젝트**: `[LoadingUI]`, `[AssetPreloader]`

### MainGameScene
- **책임**: 핵심 게임플레이 전체. 씬 전환 없이 UI 패널 전환으로 모든 화면 처리.
- **포함 오브젝트**:
  - `[GameLoop]`: DeliveryManager 틱 실행
  - `[UIRoot]`: Canvas 및 모든 UI 패널
  - `[HubRenderer]`: 시설 그리드 렌더링
  - `[CameraController]`: 카메라 이동
  - `[AudioPlayer]`: BGM/SFX 재생
- **UI 패널 구조**:
  ```
  UIRoot (Canvas)
  ├── HUDLayer (Always Visible)
  │   ├── TopBar (코인, 젬 표시)
  │   └── BottomNavBar (탭 버튼)
  ├── MainLayer (기본 게임 화면)
  │   ├── MainHubPanel
  │   └── CityMapPanel
  ├── PopupLayer (팝업)
  │   ├── FacilityUpgradePopup
  │   ├── OfflineRewardPopup
  │   ├── CourierDetailPopup
  │   └── ...
  └── ModalLayer (전면 팝업)
      ├── ShopPanel
      ├── EventPanel
      └── SettingsPanel
  ```

---

## Part B-4. 매니저 아키텍처

모든 매니저는 MonoBehaviour를 상속하며, BootScene에서 생성되고 DontDestroyOnLoad로 유지됩니다.
ServiceLocator 패턴으로 의존성 주입 없이 접근 가능합니다.

### 초기화 순서 (중요: 순서 변경 금지)

```
1. ServiceLocator
2. DataManager
3. SaveManager
4. EconomyManager
5. FacilityManager
6. CharacterManager
7. VehicleManager
8. DeliveryManager
9. OfflineRewardManager
10. EventManager
11. UIManager
12. AdManager
13. IAPManager
14. AnalyticsManager
15. NotificationManager
```

---

### GameManager
| 항목 | 내용 |
|------|------|
| 책임 | 게임 전체 상태 관리, 씬 전환, 앱 생명주기 처리 |
| 주요 메서드 | `InitializeGame()`, `OnApplicationPause()`, `OnApplicationFocus()`, `LoadScene()` |
| 의존성 | 모든 매니저 (최상위) |
| 초기화 순서 | 1 (최초) |

### DataManager
| 항목 | 내용 |
|------|------|
| 책임 | ScriptableObject 정적 데이터 로드 및 캐싱 |
| 주요 메서드 | `GetHedgehogData(id)`, `GetFacilityData(id)`, `GetVehicleData(id)`, `GetEconomyConfig()` |
| 의존성 | 없음 |
| 초기화 순서 | 2 |

### SaveManager
| 항목 | 내용 |
|------|------|
| 책임 | 게임 진행 데이터 저장/불러오기 (로컬 JSON + 암호화) |
| 주요 메서드 | `Save()`, `Load()`, `DeleteSave()`, `MigrateSave(version)` |
| 의존성 | DataManager |
| 초기화 순서 | 3 |
| 자동 저장 | 시설 업그레이드, 캐릭터 채용, 구역 해금 시 즉시 + 30초 주기 자동 저장 |

### EconomyManager
| 항목 | 내용 |
|------|------|
| 책임 | 모든 통화 관리, 수입/지출 처리, 통화 변경 이벤트 발행 |
| 주요 메서드 | `AddCurrency(type, amount)`, `SpendCurrency(type, amount)`, `GetBalance(type)`, `CanAfford(type, amount)` |
| 의존성 | SaveManager, DataManager |
| 초기화 순서 | 4 |

### DeliveryManager
| 항목 | 내용 |
|------|------|
| 책임 | 배달 주문 생성, 택배원 배정, 배달 완료 처리, 수익 계산 |
| 주요 메서드 | `GenerateOrder(zone)`, `AssignCourier(order, courier)`, `CompleteDelivery(orderId)`, `GetActiveOrders()` |
| 의존성 | EconomyManager, CharacterManager, FacilityManager |
| 초기화 순서 | 8 |

### FacilityManager
| 항목 | 내용 |
|------|------|
| 책임 | 시설 인스턴스 관리, 업그레이드 처리, 시설 효과 계산 |
| 주요 메서드 | `UpgradeFacility(type)`, `GetFacilityLevel(type)`, `GetFacilityEffect(type)`, `CanUpgrade(type)` |
| 의존성 | EconomyManager, DataManager, SaveManager |
| 초기화 순서 | 5 |

### CharacterManager
| 항목 | 내용 |
|------|------|
| 책임 | 고슴도치 택배원 컬렉션 관리, 채용, 배치 |
| 주요 메서드 | `RecruitHedgehog(type)`, `AssignToZone(characterId, zoneId)`, `GetDeployedCouriers()`, `LevelUpCharacter(characterId)` |
| 의존성 | EconomyManager, DataManager, SaveManager |
| 초기화 순서 | 6 |

### VehicleManager
| 항목 | 내용 |
|------|------|
| 책임 | 차량 컬렉션 관리, 배치, 차량 버프 계산 |
| 주요 메서드 | `UnlockVehicle(vehicleId)`, `AssignVehicle(characterId, vehicleId)`, `GetVehicleBonus(characterId)` |
| 의존성 | EconomyManager, DataManager, SaveManager |
| 초기화 순서 | 7 |

### OfflineRewardManager
| 항목 | 내용 |
|------|------|
| 책임 | 오프라인 시간 계산, 오프라인 수익 계산, 복귀 시 팝업 트리거 |
| 주요 메서드 | `CalculateOfflineReward()`, `ClaimReward(useAd)`, `GetOfflineSeconds()` |
| 의존성 | EconomyManager, DeliveryManager, SaveManager |
| 초기화 순서 | 9 |

### UIManager
| 항목 | 내용 |
|------|------|
| 책임 | UI 패널 열기/닫기, 패널 스택 관리, HUD 업데이트 |
| 주요 메서드 | `OpenPanel(panelId)`, `ClosePanel(panelId)`, `ShowPopup(popupId, data)`, `UpdateHUD()` |
| 의존성 | 모든 View 클래스 |
| 초기화 순서 | 10 |

### AdManager
| 항목 | 내용 |
|------|------|
| 책임 | 보상형/전면 광고 로드 및 표시, 광고 보상 처리 |
| 주요 메서드 | `ShowRewardedAd(onReward)`, `ShowInterstitialAd()`, `IsRewardedAdReady()`, `LoadAds()` |
| 의존성 | AdMob/MAX SDK, EconomyManager |
| 초기화 순서 | 12 |

### IAPManager
| 항목 | 내용 |
|------|------|
| 책임 | 인앱 결제 처리, 구매 검증, 복구 |
| 주요 메서드 | `PurchaseProduct(productId)`, `RestorePurchases()`, `IsProductPurchased(productId)` |
| 의존성 | Unity IAP 패키지, EconomyManager |
| 초기화 순서 | 13 |

### AnalyticsManager
| 항목 | 내용 |
|------|------|
| 책임 | Firebase Analytics 이벤트 전송, 사용자 속성 설정 |
| 주요 메서드 | `LogEvent(eventName, parameters)`, `SetUserProperty(key, value)` |
| 의존성 | Firebase Analytics SDK |
| 초기화 순서 | 14 |

### EventManager (게임 이벤트)
| 항목 | 내용 |
|------|------|
| 책임 | 기간 한정 이벤트 상태 관리, 미션 진행도, 보상 처리 |
| 주요 메서드 | `GetActiveEvent()`, `UpdateMissionProgress(missionId)`, `ClaimEventReward(rewardId)` |
| 의존성 | DeliveryManager, EconomyManager, SaveManager |
| 초기화 순서 | 10 |

### NotificationManager
| 항목 | 내용 |
|------|------|
| 책임 | 로컬 푸시 알림 스케줄링, 알림 권한 관리 |
| 주요 메서드 | `ScheduleOfflineRewardNotification()`, `ScheduleEventEndNotification()`, `CancelAllNotifications()` |
| 의존성 | Unity Mobile Notifications 패키지 |
| 초기화 순서 | 15 |

---

## Part B-5. 런타임 플로우

### 앱 시작 플로우

```
[앱 실행]
    ↓
[BootScene 로드]
    ↓
[GameManager.Awake() - 싱글턴 초기화]
    ↓
[DataManager.Initialize() - SO 캐싱]
    ↓
[SaveManager.Load() - JSON 파일 읽기]
    ↓
[SaveManager.MigrateSave() - 버전 마이그레이션]
    ↓
[EconomyManager.Initialize() - 통화 초기화]
    ↓
[FacilityManager.Initialize() - 시설 상태 복원]
    ↓
[CharacterManager.Initialize() - 택배원 상태 복원]
    ↓
[VehicleManager.Initialize() - 차량 상태 복원]
    ↓
[DeliveryManager.StartOrderGeneration() - 주문 루프 시작]
    ↓
[OfflineRewardManager.CalculateOfflineReward() - 오프라인 수익 계산]
    ↓
[EventManager.Initialize() - 이벤트 상태 확인]
    ↓
[FirebaseApp.CheckAndFixDependenciesAsync() - 비동기 초기화]
    ↓
[LoadingScene → MainGameScene 전환]
    ↓
[UIManager.OpenMainHub() - 메인 허브 화면 열기]
    ↓
[OfflineRewardManager → OfflineRewardPopup 표시]
    ↓
[AnalyticsManager.LogEvent("session_start")]
    ↓
[게임 루프 실행]
```

### 배달 주문 처리 플로우

```
[DeliveryManager.GenerateOrder(zone)]
    ↓
[배달 주문 큐 추가]
    ↓
[CharacterManager.GetAvailableCourier(zone)]
    ↓
[DeliveryManager.AssignCourier(order, courier)]
    ↓
[배달 시간 계산 (EconomyCalculator)]
    ↓
[코루틴으로 타이머 시작]
    ↓
[타이머 완료 → DeliveryManager.CompleteDelivery(orderId)]
    ↓
[EconomyCalculator.CalculateDeliveryRevenue()]
    ↓
[EconomyManager.AddCurrency(CurrencyType.Coin, revenue)]
    ↓
[UIManager 코인 HUD 업데이트]
    ↓
[AnalyticsManager.LogEvent("delivery_complete")]
    ↓
[CharacterManager.SetCourierAvailable(courierId)]
    ↓
[다음 주문 자동 배정]
```

### 시설 업그레이드 플로우

```
[유저: 업그레이드 버튼 탭]
    ↓
[FacilityManager.CanUpgrade(type) 확인]
    ↓
[비용 부족 → 에러 피드백 표시]
[비용 충분 → 계속]
    ↓
[EconomyManager.SpendCurrency(cost)]
    ↓
[FacilityManager.UpgradeFacility(type)]
    ↓
[SaveManager.Save() 즉시 호출]
    ↓
[시설 시각적 업데이트 트리거]
    ↓
[FacilityUpgradeView 효과 표시]
    ↓
[AnalyticsManager.LogEvent("facility_upgrade")]
```

### 앱 종료/백그라운드 전환 플로우

```
[OnApplicationPause(true) / OnApplicationQuit()]
    ↓
[SaveManager.Save() 즉시 강제 저장]
    ↓
[SaveData.lastLoginUtc = DateTime.UtcNow]
    ↓
[NotificationManager.ScheduleOfflineRewardNotification()]
    ↓
[NotificationManager.ScheduleEventEndNotification()]
```

---

## Part B-6. 네트워크 및 오프라인 정책

- **기본 동작**: 오프라인 우선 설계. 네트워크 없이 완전한 플레이 가능.
- **네트워크 필요 기능**: IAP 구매 검증, 랭킹 업데이트, 이벤트 동기화, 클라우드 저장
- **시간 조작 방지**: 마지막 로그인 시간을 서버 시간과 대조 (가능 시), 비정상적인 오프라인 시간 감지 시 최대치 적용
- **저장 충돌**: 로컬과 클라우드 저장 데이터 충돌 시 최신 lastLoginUtc 데이터 우선

---

## Part B-7. 성능 목표

| 항목 | 목표 |
|------|------|
| 프레임 레이트 | 60 FPS (고급기기), 30 FPS (중저급기기) |
| 메모리 사용 | 최대 300MB RAM |
| 로딩 시간 | 앱 최초 실행 3초 이내 |
| 저장 시간 | 30ms 이내 (비동기 파일 I/O) |
| 배터리 소모 | 방치 시 60 FPS → 30 FPS 자동 전환 (백그라운드 시 완전 중단) |
| 지원 기기 | Android 8.0+, iOS 13+, RAM 2GB 이상 |

---

## Part B-8. 보안 설계

- **저장 데이터 암호화**: AES-128 암호화 적용 (키: 디바이스 고유 ID 조합)
- **통화 클라이언트 검증**: 클라이언트에서 1차 검증, 중요 거래는 서버 검증 추후 추가
- **시간 조작 방지**: DateTime.UtcNow 사용, 시스템 시간 역행 감지
- **무결성 체크**: 저장 파일 해시값 검증으로 수동 수정 감지

---

## Part B-9. 라이브옵스 확장 계획

- **원격 구성**: Firebase Remote Config로 밸런스 수치 핫픽스
- **A/B 테스트**: Firebase A/B Testing으로 UI/UX 및 밸런스 테스트
- **이벤트 서버**: 이벤트 데이터는 서버 JSON으로 관리, 앱 업데이트 없이 신규 이벤트 추가
- **에셋 번들**: Addressables로 신규 캐릭터/차량 에셋 OTA 업데이트
