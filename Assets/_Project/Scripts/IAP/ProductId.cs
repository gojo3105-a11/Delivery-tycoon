// Assets/_Project/Scripts/IAP/ProductId.cs
// 인앱 결제 상품 ID 상수 정의

namespace HedgehogDeliveryTycoon.IAP
{
    /// <summary>
    /// Google Play / Apple App Store에 등록된 상품 ID 상수.
    /// 실제 스토어 등록 ID와 정확히 일치해야 합니다.
    /// </summary>
    public static class ProductId
    {
        // ── 젬 패키지 (소모성) ─────────────────────────────────────────────
        public const string GemSmall    = "com.studio.hdt.gem_small";     // 젬 80개
        public const string GemMedium   = "com.studio.hdt.gem_medium";    // 젬 500개
        public const string GemLarge    = "com.studio.hdt.gem_large";     // 젬 1200개
        public const string GemXLarge   = "com.studio.hdt.gem_xlarge";    // 젬 2500개 + 보너스
        public const string GemMega     = "com.studio.hdt.gem_mega";      // 젬 6500개 + 보너스

        // ── 한정 패키지 (소모성) ──────────────────────────────────────────
        public const string StarterPack          = "com.studio.hdt.starter_pack";      // 1회 한정
        public const string GrowthPack           = "com.studio.hdt.growth_pack";
        public const string LegendaryCourierPack = "com.studio.hdt.legendary_pack";

        // ── 구독 (비소모성 / 구독) ────────────────────────────────────────
        public const string NoAds        = "com.studio.hdt.no_ads";        // 비소모성
        public const string MonthlyPass  = "com.studio.hdt.monthly_pass";  // 월간 구독
        public const string SeasonPass   = "com.studio.hdt.season_pass";   // 2주 시즌 구독
        public const string VipPass      = "com.studio.hdt.vip_pass";      // 월간 VIP 구독

        // ── 스킨 (비소모성) ───────────────────────────────────────────────
        public const string SkinVehicleDrone  = "com.studio.hdt.skin_drone";
        public const string SkinVehicleRocket = "com.studio.hdt.skin_rocket";
        // 추가 스킨 ID는 스킨 데이터 기준으로 동적 생성: "com.studio.hdt.skin_{skinId}"
    }

    /// <summary>상품 카테고리 분류 (분석 및 UI 표시용)</summary>
    public enum ProductCategory
    {
        GemPack,
        LimitedPack,
        Subscription,
        Skin,
    }
}
