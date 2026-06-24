// Assets/_Project/Scripts/Data/HedgehogData.cs
// 고슴도치 택배원 정적 데이터 ScriptableObject

using UnityEngine;
using UnityEngine.AddressableAssets;
using HedgehogDeliveryTycoon.Characters;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 고슴도치 택배원 1종의 모든 정적 데이터를 담는 ScriptableObject.
    /// Assets/_Project/ScriptableObjects/Characters/ 에 저장합니다.
    /// </summary>
    [CreateAssetMenu(fileName = "Hedgehog_", menuName = "HDT/Character/Hedgehog Data")]
    public class HedgehogData : ScriptableObject
    {
        [Header("기본 정보")]
        [Tooltip("유니크 ID (예: hedgehog_001_common_son)")]
        public string id;

        [Tooltip("인게임 표시 이름 (한글)")]
        public string displayName;

        [Tooltip("캐릭터 설명 (한글)")]
        [TextArea(2, 4)]
        public string description;

        public HedgehogRarity rarity;

        [Header("기본 스탯")]
        [Tooltip("기본 배달 속도 (배달 시간에 반비례)")]
        [Range(1f, 100f)]
        public float baseSpeed = 10f;

        [Tooltip("1회 배달 시 처리 가능한 최대 용량 (개)")]
        [Range(1, 20)]
        public int baseCapacity = 1;

        [Tooltip("배달 완료 시 수익 보너스 배율 (1.0 = 보너스 없음)")]
        [Range(1f, 10f)]
        public float baseRevenueBonus = 1.0f;

        [Header("스킬")]
        [Tooltip("스킬 ID. SkillDatabase에서 참조됩니다.")]
        public string skillId;

        [Tooltip("스킬 설명 (인게임 표시용)")]
        [TextArea(2, 3)]
        public string skillDescription;

        [Tooltip("스킬 발동 확률 (0.0 ~ 1.0)")]
        [Range(0f, 1f)]
        public float skillTriggerChance = 0f;

        [Tooltip("스킬 효과 강도 배율")]
        public float skillEffectMultiplier = 1f;

        [Header("레벨업 설정")]
        [Tooltip("레벨당 스탯 증가율 (1.05 = 5% 증가)")]
        [Range(1f, 2f)]
        public float levelStatGrowthRate = 1.05f;

        [Tooltip("레벨업 최대 레벨")]
        public int maxLevel = 100;

        [Header("해금 조건")]
        [Tooltip("해금 방법 설명 (한글)")]
        public string unlockDescription;

        [Tooltip("기본 채용 가능 여부")]
        public bool isBasicRecruitAvailable = true;

        [Tooltip("프리미엄 채용 가중치 (높을수록 자주 등장)")]
        [Range(0, 100)]
        public int premiumRecruitWeight = 10;

        [Header("에셋 참조")]
        [Tooltip("캐릭터 프리팹 Addressables 참조")]
        public AssetReferenceGameObject prefabReference;

        [Tooltip("캐릭터 아이콘 스프라이트")]
        public Sprite icon;

        [Tooltip("캐릭터 일러스트 (상세 화면용)")]
        public Sprite portraitSprite;

        [Header("사운드")]
        [Tooltip("캐릭터 선택 효과음 클립 이름")]
        public string selectSfxName;

        [Tooltip("배달 완료 효과음 클립 이름")]
        public string deliveryCompleteSfxName;

        /// <summary>희귀도 배율 반환 (GameConstants.RarityMultipliers 참조)</summary>
        public float GetRarityMultiplier()
        {
            int index = (int)rarity;
            var multipliers = Core.GameConstants.RarityMultipliers;
            return index < multipliers.Length ? multipliers[index] : 1f;
        }

        /// <summary>특정 레벨에서의 속도 계산</summary>
        public float GetSpeedAtLevel(int level)
        {
            if (level <= 1) return baseSpeed;
            return baseSpeed * Mathf.Pow(levelStatGrowthRate, level - 1);
        }

        /// <summary>특정 레벨에서의 수익 보너스 계산</summary>
        public float GetRevenueBonusAtLevel(int level)
        {
            if (level <= 1) return baseRevenueBonus;
            return baseRevenueBonus * Mathf.Pow(levelStatGrowthRate, level - 1);
        }
    }
}
