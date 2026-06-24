// Assets/_Project/Scripts/Facilities/FacilityInstance.cs
// 런타임 시설 인스턴스 (정적 데이터 + 저장 상태 결합)

using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Facilities
{
    /// <summary>
    /// 런타임에서 사용되는 시설 인스턴스.
    /// FacilityData(정적)와 FacilitySaveData(동적)를 결합하여 현재 상태를 나타냅니다.
    /// </summary>
    public class FacilityInstance
    {
        public FacilityData Data { get; }
        public FacilitySaveData SaveData { get; }

        public string FacilityId => Data.id;
        public FacilityType FacilityType => Data.facilityType;
        public int Level => SaveData.level;
        public bool IsUnlocked => SaveData.isUnlocked;
        public bool IsMaxLevel => SaveData.level >= Data.maxLevel;
        public bool IsAutomated => Data.IsAutomationUnlockedAt(SaveData.level);

        // ── 계산된 현재 스탯 ──────────────────────────────────────────────
        public double CurrentRevenue    => Data.GetRevenueAtLevel(SaveData.level);
        public double NextLevelRevenue  => Data.GetRevenueAtLevel(SaveData.level + 1);
        public double UpgradeCost       => Data.GetUpgradeCost(SaveData.level);
        public float  CurrentEffect     => Data.GetEffectAtLevel(SaveData.level);
        public float  NextLevelEffect   => Data.GetEffectAtLevel(SaveData.level + 1);

        public FacilityInstance(FacilityData data, FacilitySaveData saveData)
        {
            Data     = data;
            SaveData = saveData;
        }

        /// <summary>레벨 1 증가 (FacilityManager에서 비용 처리 후 호출)</summary>
        public void LevelUp()
        {
            if (!IsMaxLevel)
                SaveData.level++;
        }

        public override string ToString() =>
            $"[{FacilityType}] {Data.displayName} Lv.{Level}/{Data.maxLevel} " +
            $"(Rev:{CurrentRevenue:F1}/s, AutomationReady:{IsAutomated})";
    }
}
