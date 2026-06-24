// Assets/_Project/Scripts/Data/EconomyConfig.cs
// 경제 시스템 전체 설정 ScriptableObject (밸런스 수치 중앙 관리)

using UnityEngine;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 게임 경제 시스템의 핵심 설정값을 담는 ScriptableObject.
    /// Firebase Remote Config 값으로 덮어쓸 수 있도록 필드명을 명시적으로 관리합니다.
    /// Assets/_Project/ScriptableObjects/Economy/EconomyConfig.asset 에 저장합니다.
    /// </summary>
    [CreateAssetMenu(fileName = "EconomyConfig", menuName = "HDT/Economy/Economy Config")]
    public class EconomyConfig : ScriptableObject
    {
        [Header("오프라인 수익 설정")]
        [Tooltip("오프라인 최대 적용 시간 (시간 단위)")]
        [Range(1f, 24f)]
        public float offlineMaxHours = 8f;

        [Tooltip("오프라인 수익 효율 (0.5 = 온라인 수익의 50%)")]
        [Range(0.1f, 1.0f)]
        public float offlineEfficiencyRate = 0.5f;

        [Header("광고 보상 배율")]
        [Tooltip("보상형 광고 시청 시 수익 배율")]
        [Range(1f, 10f)]
        public float rewardedAdMultiplier = 3.0f;

        [Tooltip("보상형 광고 쿨타임 (초)")]
        [Range(60f, 3600f)]
        public float rewardedAdCooldownSeconds = 600f;

        [Header("기본 주문 설정")]
        [Tooltip("기본 배달 주문 1건당 기준 수익 (코인)")]
        public double baseOrderValue = 10.0;

        [Tooltip("구역 레벨/번호에 따른 주문 가치 증가율")]
        [Range(1.0f, 3.0f)]
        public float orderGrowthRatePerZone = 1.5f;

        [Tooltip("주문 생성 기본 간격 (초)")]
        [Range(1f, 60f)]
        public float baseOrderIntervalSeconds = 5f;

        [Header("프레스티지 설정")]
        [Tooltip("프레스티지 스타 1개당 수익 배율 증가 (0.05 = +5%)")]
        [Range(0.01f, 0.5f)]
        public float prestigeMultiplierPerStar = 0.05f;

        [Header("채용 비용")]
        [Tooltip("일반 채용 1회 코인 비용")]
        public double basicRecruitCost = 1000.0;

        [Tooltip("프리미엄 채용 1회 젬 비용")]
        public int premiumRecruitGemCost = 300;

        [Tooltip("10연 프리미엄 채용 젬 비용 (10회 단가보다 저렴)")]
        public int premiumRecruitX10GemCost = 2500;

        [Header("채용 확률 (합산 = 1.0)")]
        [Range(0f, 1f)]
        public float commonRecruitRate = 0.65f;
        [Range(0f, 1f)]
        public float rareRecruitRate = 0.25f;
        [Range(0f, 1f)]
        public float epicRecruitRate = 0.08f;
        [Range(0f, 1f)]
        public float legendaryRecruitRate = 0.019f;
        [Range(0f, 1f)]
        public float mythicRecruitRate = 0.001f;

        [Header("VIP 배율 제한")]
        [Tooltip("VIP 구독 시 추가 수익 배율 상한")]
        [Range(1f, 2f)]
        public float vipMaxRevenueMultiplier = 1.5f;

        /// <summary>프레스티지 레벨에 따른 전체 수익 배율 계산</summary>
        public float GetPrestigeMultiplier(int prestigeLevel)
        {
            return 1f + prestigeLevel * prestigeMultiplierPerStar;
        }
    }
}
