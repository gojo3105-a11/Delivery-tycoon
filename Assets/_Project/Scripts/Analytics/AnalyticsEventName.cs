// Assets/_Project/Scripts/Analytics/AnalyticsEventName.cs
// Firebase Analytics 이벤트 이름 상수

namespace HedgehogDeliveryTycoon.Analytics
{
    /// <summary>
    /// Firebase Analytics에 전송되는 모든 이벤트 이름 상수.
    /// 이벤트 이름은 snake_case, 40자 이하, Firebase 명명 규칙 준수.
    /// </summary>
    public static class AnalyticsEventName
    {
        // ── 세션 ──────────────────────────────────────────────────────────
        public const string SessionStart      = "session_start";

        // ── 튜토리얼 ──────────────────────────────────────────────────────
        public const string TutorialStart     = "tutorial_start";
        public const string TutorialComplete  = "tutorial_complete";

        // ── 게임플레이 ────────────────────────────────────────────────────
        public const string FacilityUpgrade   = "facility_upgrade";
        public const string CourierRecruit    = "courier_recruit";
        public const string DeliveryComplete  = "delivery_complete";

        // ── 오프라인 보상 ─────────────────────────────────────────────────
        public const string OfflineRewardClaim = "offline_reward_claim";

        // ── 광고 ──────────────────────────────────────────────────────────
        public const string RewardedAdStart    = "rewarded_ad_start";
        public const string RewardedAdComplete = "rewarded_ad_complete";

        // ── IAP ───────────────────────────────────────────────────────────
        public const string IAPPurchaseStart    = "iap_purchase_start";
        public const string IAPPurchaseComplete = "iap_purchase_complete";

        // ── 진행 ──────────────────────────────────────────────────────────
        public const string CityUnlock         = "city_unlock";
        public const string PrestigeReset      = "prestige_reset";

        // ── 이벤트 ────────────────────────────────────────────────────────
        public const string EventJoin          = "event_join";
        public const string EventRewardClaim   = "event_reward_claim";
    }
}
