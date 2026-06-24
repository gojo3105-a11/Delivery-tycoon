// Assets/_Project/Scripts/Data/FacilityData.cs
// 시설 정적 데이터 ScriptableObject

using UnityEngine;
using UnityEngine.AddressableAssets;
using HedgehogDeliveryTycoon.Facilities;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 시설 1종의 모든 정적 데이터를 담는 ScriptableObject.
    /// Assets/_Project/ScriptableObjects/Facilities/ 에 저장합니다.
    /// </summary>
    [CreateAssetMenu(fileName = "Facility_", menuName = "HDT/Facility/Facility Data")]
    public class FacilityData : ScriptableObject
    {
        [Header("기본 정보")]
        public string id;
        public string displayName;

        [TextArea(2, 3)]
        public string description;

        public FacilityType facilityType;

        [Header("업그레이드 비용")]
        [Tooltip("레벨 1 기준 업그레이드 비용")]
        public double baseCost = 100.0;

        [Tooltip("레벨당 비용 증가율 (1.15 = 15% 증가)")]
        [Range(1.0f, 3.0f)]
        public float costGrowthRate = 1.15f;

        [Header("수익 및 효과")]
        [Tooltip("레벨 1 기준 초당 수익 기여도")]
        public double baseRevenue = 10.0;

        [Tooltip("레벨당 수익 증가율 (1.10 = 10% 증가)")]
        [Range(1.0f, 3.0f)]
        public float revenueGrowthRate = 1.10f;

        [Tooltip("수익 외 부가 효과 배율 (속도, 용량 등)")]
        public float baseEffectValue = 1.0f;

        [Tooltip("레벨당 부가 효과 증가율")]
        [Range(1.0f, 2.0f)]
        public float effectGrowthRate = 1.05f;

        [Header("레벨 제한")]
        public int maxLevel = 50;

        [Tooltip("다음 자동화 단계가 해금되는 레벨들 (예: 10, 25, 50)")]
        public int[] automationUnlockLevels;

        [Header("해금 조건")]
        [TextArea(1, 2)]
        public string unlockConditionDescription;

        [Tooltip("해금에 필요한 허브 레벨")]
        public int requiredHubLevel = 1;

        [Tooltip("해금에 필요한 구역 ID (없으면 공백)")]
        public string requiredZoneId = "";

        [Header("에셋 참조")]
        [Tooltip("시설 프리팹 (레벨별로 교체되는 방식 또는 하나의 프리팹 내 레벨 변화)")]
        public AssetReferenceGameObject prefabReference;

        public Sprite icon;

        [Tooltip("레벨 구간별 시각 스프라이트 (낮은 레벨 → 높은 레벨)")]
        public Sprite[] levelVisualSprites;

        /// <summary>특정 레벨의 업그레이드 비용 계산 (정수 결과)</summary>
        public double GetUpgradeCost(int currentLevel)
        {
            if (currentLevel <= 0) return baseCost;
            return baseCost * System.Math.Pow(costGrowthRate, currentLevel);
        }

        /// <summary>특정 레벨에서의 초당 수익 기여도 계산</summary>
        public double GetRevenueAtLevel(int level)
        {
            if (level <= 0) return 0;
            return baseRevenue * System.Math.Pow(revenueGrowthRate, level - 1);
        }

        /// <summary>특정 레벨에서의 부가 효과 값 계산</summary>
        public float GetEffectAtLevel(int level)
        {
            if (level <= 0) return 1f;
            return baseEffectValue * Mathf.Pow(effectGrowthRate, level - 1);
        }

        /// <summary>해당 레벨에서 자동화가 해금되는지 여부</summary>
        public bool IsAutomationUnlockedAt(int level)
        {
            if (automationUnlockLevels == null) return false;
            foreach (var unlockLevel in automationUnlockLevels)
            {
                if (level >= unlockLevel) return true;
            }
            return false;
        }

        /// <summary>레벨에 맞는 시각 스프라이트 반환</summary>
        public Sprite GetSpriteForLevel(int level)
        {
            if (levelVisualSprites == null || levelVisualSprites.Length == 0) return icon;
            int segments = maxLevel / levelVisualSprites.Length;
            int index = Mathf.Clamp((level - 1) / Mathf.Max(segments, 1), 0, levelVisualSprites.Length - 1);
            return levelVisualSprites[index];
        }
    }
}
