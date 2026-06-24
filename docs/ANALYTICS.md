# 고슴도치 배달 타이쿤 - Firebase Analytics 이벤트 설계서

> 구현 위치: `Assets/_Project/Scripts/Analytics/AnalyticsManager.cs`
> 이벤트 상수: `Assets/_Project/Scripts/Analytics/AnalyticsEventName.cs`

---

## 이벤트 표

### 세션 관련

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `session_start` | 앱 실행 완료 시 | `session_duration` (이전 세션), `player_level` | DAU/WAU/MAU 측정, 세션 길이 분석 |

---

### 튜토리얼

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `tutorial_start` | 첫 게임 실행 시 | `device_model`, `os_version` | 신규 유저 진입 추적 |
| `tutorial_complete` | 튜토리얼 마지막 단계 완료 | `completion_time_seconds` | 튜토리얼 완료율 측정 |

---

### 게임플레이 핵심

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `facility_upgrade` | 시설 업그레이드 완료 시 | `facility_type`, `level` (업그레이드 후), `cost_coins` | 어떤 시설을 얼마나 업그레이드하는지 파악 |
| `courier_recruit` | 새 택배원 채용 완료 시 | `rarity`, `character_id`, `recruit_type` (basic/premium/x10) | 채용 패턴 및 수익화 기여 분석 |
| `delivery_complete` | 배달 주문 1건 완료 시 | `zone_id`, `revenue` (코인), `courier_rarity` | 구역별 수익 흐름 분석 |

---

### 오프라인 보상

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `offline_reward_claim` | 오프라인 보상 수령 버튼 클릭 시 | `reward_coins`, `offline_seconds`, `used_ad` (true/false) | 오프라인 수익 규모 및 광고 전환율 분석 |

---

### 광고

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `rewarded_ad_start` | 보상형 광고 시청 시작 시 | `placement` (offline_reward/delivery_boost/snack_bonus) | 광고 위치별 노출 수 분석 |
| `rewarded_ad_complete` | 보상형 광고 시청 완료 시 | `placement`, `success` (true/false) | 광고 완료율 및 수익 추적 |

---

### IAP (인앱 결제)

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `iap_purchase_start` | 상품 구매 버튼 클릭 시 | `product_id`, `price_krw` | 구매 퍼널 진입 추적 |
| `iap_purchase_complete` | 구매 완료 및 보상 지급 시 | `product_id`, `value`, `currency` | 수익 추적, ARPU/ARPPU 계산 |

---

### 진행 마일스톤

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `city_unlock` | 새 배달 구역 해금 시 | `zone_id`, `zone_index`, `total_play_time_seconds` | 진행 속도 및 이탈 구간 분석 |
| `prestige_reset` | 프레스티지 리셋 수행 시 | `prestige_level` (리셋 후), `coins_at_reset` | 장기 잔존율 및 하드코어 유저 분석 |

---

### 이벤트 (라이브)

| 이벤트 | 트리거 | 파라미터 | 목적 |
|--------|--------|----------|------|
| `event_join` | 기간 한정 이벤트 첫 참여 시 | `event_id`, `event_type` | 이벤트 참여율 측정 |
| `event_reward_claim` | 이벤트 보상 수령 시 | `event_id`, `reward_type`, `rank` | 이벤트 참여 심도 및 보상 효율 분석 |

---

## 사용자 속성 (User Properties)

| 속성 | 값 예시 | 설명 |
|------|---------|------|
| `player_prestige_level` | "0", "1", "5" | 프레스티지 레벨 (코호트 분석) |
| `has_no_ads` | "true"/"false" | 광고 제거 구매 여부 |
| `is_vip` | "true"/"false" | VIP 구독 여부 |
| `highest_zone_index` | "0" ~ "9" | 최고 진행 구역 |
| `total_courier_count` | "1", "10", "50" | 보유 택배원 수 |

---

## KPI 대시보드 구성 권장

### 핵심 지표

| KPI | 계산 방법 |
|-----|---------|
| DAU | session_start 기준 일별 유니크 유저 |
| ARPU | 총 수익 / DAU |
| ARPPU | 총 수익 / 결제 유저 수 |
| 결제 전환율 | iap_purchase_complete 유저 / DAU |
| 광고 ARPDAU | 광고 수익 / DAU |
| D1/D7/D30 잔존율 | session_start 기준 코호트 분석 |
| 튜토리얼 완료율 | tutorial_complete / tutorial_start |
| 구역별 도달 분포 | city_unlock zone_index 분포 |

### 이탈 구간 분석
- 구역 인덱스별 city_unlock 이벤트 수 급감 구간 → 밸런스 조정 필요
- tutorial_complete 이후 첫 facility_upgrade 없이 이탈한 유저 비율

---

## Firebase Remote Config 연동 권장 값

```json
{
  "offline_max_hours": 8,
  "offline_efficiency_rate": 0.5,
  "rewarded_ad_multiplier": 3.0,
  "base_order_value": 10.0,
  "premium_recruit_gem_cost": 300,
  "starter_pack_visible_days": 3
}
```
