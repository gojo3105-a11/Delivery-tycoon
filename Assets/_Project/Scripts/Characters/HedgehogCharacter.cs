// Assets/_Project/Scripts/Characters/HedgehogCharacter.cs
// 런타임 고슴도치 캐릭터 인스턴스 (정적 데이터 + 저장 상태 결합)

using UnityEngine;
using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Characters
{
    /// <summary>
    /// 런타임에서 사용되는 고슴도치 캐릭터 인스턴스.
    /// HedgehogData(정적)와 CharacterSaveData(동적)를 결합하여 실제 스탯을 계산합니다.
    /// </summary>
    public class HedgehogCharacter
    {
        // ── 데이터 참조 ────────────────────────────────────────────────────
        public HedgehogData Data { get; }
        public CharacterSaveData SaveData { get; }

        // ── 인스턴스 식별 ─────────────────────────────────────────────────
        public string InstanceId => SaveData.instanceId;
        public string CharacterId => Data.id;
        public string DisplayName => Data.displayName;
        public HedgehogRarity Rarity => Data.rarity;

        // ── 상태 ──────────────────────────────────────────────────────────
        public int Level => SaveData.level;
        public bool IsDeployed => !string.IsNullOrEmpty(SaveData.assignedZoneId);
        public string AssignedZoneId => SaveData.assignedZoneId;
        public bool IsAvailable { get; private set; } = true; // 배달 중이면 false

        // ── 런타임 스탯 (계산값) ──────────────────────────────────────────
        public float CurrentSpeed => Data.GetSpeedAtLevel(Level) * Data.GetRarityMultiplier();
        public int CurrentCapacity => Mathf.RoundToInt(Data.baseCapacity * Level * Data.GetRarityMultiplier());
        public float CurrentRevenueBonus => Data.GetRevenueBonusAtLevel(Level) * Data.GetRarityMultiplier();

        public HedgehogCharacter(HedgehogData data, CharacterSaveData saveData)
        {
            Data = data;
            SaveData = saveData;
        }

        /// <summary>배달 시작 시 호출: 해당 택배원을 사용 불가 상태로 전환</summary>
        public void StartDelivery()
        {
            IsAvailable = false;
        }

        /// <summary>배달 완료 시 호출: 해당 택배원을 다시 사용 가능 상태로 전환</summary>
        public void FinishDelivery()
        {
            IsAvailable = true;
        }

        /// <summary>구역에 배치</summary>
        public void AssignToZone(string zoneId)
        {
            SaveData.assignedZoneId = zoneId;
        }

        /// <summary>구역 배치 해제</summary>
        public void UnassignFromZone()
        {
            SaveData.assignedZoneId = "";
            IsAvailable = true;
        }

        /// <summary>레벨업 (조각 소모 여부는 CharacterManager에서 처리)</summary>
        public void LevelUp()
        {
            if (SaveData.level < Data.maxLevel)
                SaveData.level++;
        }

        public override string ToString() =>
            $"[{Rarity}] {DisplayName} Lv.{Level} (Speed:{CurrentSpeed:F1}, Rev:{CurrentRevenueBonus:F2}x)";
    }
}
