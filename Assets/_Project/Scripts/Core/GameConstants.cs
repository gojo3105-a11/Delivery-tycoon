// Assets/_Project/Scripts/Core/GameConstants.cs
// 게임 전반에 걸쳐 사용되는 전역 상수 정의

namespace HedgehogDeliveryTycoon.Core
{
    /// <summary>게임 전역 상수. 밸런스 수치는 EconomyConfig SO를 사용하세요.</summary>
    public static class GameConstants
    {
        // ── 저장 ──────────────────────────────────────────────────────────
        public const int SaveVersion = 1;
        public const string SaveFileName = "hdt_save.dat";
        public const float AutoSaveIntervalSeconds = 30f;

        // ── 오프라인 ──────────────────────────────────────────────────────
        public const float DefaultOfflineMaxHours = 8f;
        public const float DefaultOfflineEfficiencyRate = 0.5f;   // 오프라인 효율 50%

        // ── 광고 ──────────────────────────────────────────────────────────
        public const float RewardedAdCooldownSeconds = 600f;       // 10분 쿨타임
        public const float DefaultAdRewardMultiplier = 3f;

        // ── 경제 ──────────────────────────────────────────────────────────
        public const double MaxCoinCap = 1e18;                     // 코인 최대값 (1퀸틸리언)
        public const int PrestigeMultiplierPerStar = 5;            // 프레스티지 스타 1개당 +5%

        // ── 시설 ──────────────────────────────────────────────────────────
        public const int DefaultFacilityMaxLevel = 50;
        public const float DefaultFacilityCostGrowthRate = 1.15f;
        public const float DefaultFacilityRevenueGrowthRate = 1.10f;

        // ── 캐릭터 ────────────────────────────────────────────────────────
        public const int CommonShardsToMerge = 30;
        public const int LegendaryShardsToMerge = 100;

        // ── UI ────────────────────────────────────────────────────────────
        public const float PopupAnimDuration = 0.25f;
        public const float HUDUpdateInterval = 0.5f;              // HUD 갱신 주기 (초)

        // ── 분석 ──────────────────────────────────────────────────────────
        public const string AnalyticsUserId = "player_id";

        // ── 씬 이름 ───────────────────────────────────────────────────────
        public const string SceneBoot = "BootScene";
        public const string SceneLoading = "LoadingScene";
        public const string SceneMain = "MainGameScene";

        // ── 희귀도 배율 ──────────────────────────────────────────────────
        public static readonly float[] RarityMultipliers = { 1.0f, 1.5f, 2.5f, 4.0f, 7.0f };
        // 인덱스: 0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Mythic
    }
}
