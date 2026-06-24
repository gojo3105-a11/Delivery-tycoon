// Assets/_Project/Scripts/Data/VehicleData.cs
// 배달 차량 정적 데이터 ScriptableObject

using UnityEngine;
using UnityEngine.AddressableAssets;
using HedgehogDeliveryTycoon.Characters;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 배달 차량 1종의 정적 데이터 ScriptableObject.
    /// Assets/_Project/ScriptableObjects/Vehicles/ 에 저장합니다.
    /// </summary>
    [CreateAssetMenu(fileName = "Vehicle_", menuName = "HDT/Vehicle/Vehicle Data")]
    public class VehicleData : ScriptableObject
    {
        [Header("기본 정보")]
        public string id;
        public string displayName;

        [TextArea(2, 3)]
        public string description;

        public HedgehogRarity rarity;

        [Header("스탯 보너스")]
        [Tooltip("배달 속도 보너스 배율 (1.2 = 20% 증가)")]
        [Range(1f, 5f)]
        public float speedBonus = 1.0f;

        [Tooltip("배달 용량 보너스 배율")]
        [Range(1f, 5f)]
        public float capacityBonus = 1.0f;

        [Tooltip("수익 보너스 배율")]
        [Range(1f, 5f)]
        public float revenueBonus = 1.0f;

        [Header("강화 설정")]
        [Tooltip("강화 최대 레벨")]
        public int maxEnhanceLevel = 10;

        [Tooltip("강화 1레벨당 스탯 증가율")]
        [Range(1f, 1.5f)]
        public float enhanceStatGrowthRate = 1.03f;

        [Tooltip("강화 비용 (업그레이드 부품)")]
        public int baseEnhanceCost = 10;

        [Header("해금 조건")]
        [TextArea(1, 2)]
        public string unlockConditionDescription;

        [Tooltip("젬 해금 비용 (0이면 젬으로 해금 불가)")]
        public int unlockGemCost = 0;

        [Tooltip("해금에 필요한 구역 ID")]
        public string requiredZoneId = "";

        [Tooltip("이벤트 보상 차량 여부")]
        public bool isEventReward = false;

        [Header("스킨 지원")]
        [Tooltip("지원 스킨 목록 (스킨 ID 배열)")]
        public string[] availableSkinIds;

        [Header("에셋 참조")]
        public AssetReferenceGameObject prefabReference;
        public Sprite icon;
        public Sprite detailSprite;

        /// <summary>강화 레벨을 반영한 속도 보너스 계산</summary>
        public float GetSpeedBonusAtEnhanceLevel(int enhanceLevel)
        {
            if (enhanceLevel <= 0) return speedBonus;
            return speedBonus * Mathf.Pow(enhanceStatGrowthRate, enhanceLevel);
        }

        /// <summary>강화 레벨을 반영한 수익 보너스 계산</summary>
        public float GetRevenueBonusAtEnhanceLevel(int enhanceLevel)
        {
            if (enhanceLevel <= 0) return revenueBonus;
            return revenueBonus * Mathf.Pow(enhanceStatGrowthRate, enhanceLevel);
        }
    }
}
