// Assets/_Project/Scripts/Facilities/FacilityManager.cs
// 시설 인스턴스 관리, 업그레이드 처리 매니저

using System;
using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Facilities
{
    /// <summary>
    /// 모든 시설 인스턴스의 상태를 관리하고 업그레이드를 처리하는 매니저.
    /// </summary>
    public class FacilityManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        private Dictionary<FacilityType, FacilityInstance> _facilities = new();

        public static event Action<FacilityInstance> OnFacilityUpgraded;
        public static event Action<FacilityInstance> OnFacilityUnlocked;

        private DataManager _dataManager;
        private EconomyManager _economyManager;
        private SaveManager _saveManager;

        private void Awake()
        {
            ServiceLocator.Register<FacilityManager>(this);
        }

        public void Initialize()
        {
            _dataManager    = ServiceLocator.Get<DataManager>();
            _economyManager = ServiceLocator.Get<EconomyManager>();
            _saveManager    = ServiceLocator.Get<SaveManager>();

            LoadFacilitiesFromSave();
            IsInitialized = true;
            Debug.Log($"[FacilityManager] 초기화 완료. 시설 수: {_facilities.Count}");
        }

        private void LoadFacilitiesFromSave()
        {
            var save = _saveManager?.CurrentSave;
            var allFacilityData = _dataManager.GetAllFacilityData();

            foreach (var data in allFacilityData)
            {
                // 저장 데이터에서 찾기
                FacilitySaveData saveData = null;
                if (save != null)
                    saveData = save.facilities.Find(f => f.facilityId == data.id);

                // 저장 데이터 없으면 기본값 생성
                if (saveData == null)
                {
                    saveData = new FacilitySaveData
                    {
                        facilityId = data.id,
                        level = 0,
                        isUnlocked = data.requiredHubLevel <= 1, // 허브 레벨 1 이하 시설은 기본 해금
                    };
                    save?.facilities.Add(saveData);
                }

                var instance = new FacilityInstance(data, saveData);
                _facilities[data.facilityType] = instance;
            }
        }

        // ── 업그레이드 ─────────────────────────────────────────────────────

        /// <summary>시설 1레벨 업그레이드. 코인 차감 후 레벨업.</summary>
        public bool UpgradeFacility(FacilityType type)
        {
            if (!_facilities.TryGetValue(type, out var facility)) return false;
            if (!facility.IsUnlocked)
            {
                Debug.LogWarning($"[FacilityManager] {type} 잠금 해제되지 않음");
                return false;
            }
            if (facility.IsMaxLevel)
            {
                Debug.LogWarning($"[FacilityManager] {type} 이미 최대 레벨");
                return false;
            }

            double cost = facility.UpgradeCost;
            if (!_economyManager.SpendCurrency(CurrencyType.Coin, cost)) return false;

            facility.LevelUp();
            _saveManager?.MarkDirty();
            _saveManager?.CurrentSave?.totalUpgradeCount++;

            OnFacilityUpgraded?.Invoke(facility);
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.FacilityUpgrade,
                    ("facility_type", type.ToString()), ("level", facility.Level.ToString()));

            Debug.Log($"[FacilityManager] {facility}");
            return true;
        }

        /// <summary>보유 코인으로 최대한 업그레이드 (×MAX 버튼용)</summary>
        public int UpgradeFacilityMax(FacilityType type)
        {
            if (!_facilities.TryGetValue(type, out var facility)) return 0;
            if (!facility.IsUnlocked || facility.IsMaxLevel) return 0;

            int upgraded = 0;
            double balance = _economyManager.GetBalance(CurrencyType.Coin);
            int maxUpgrades = EconomyCalculator.CalculateMaxAffordableUpgrades(
                facility.Data, facility.Level, balance);

            for (int i = 0; i < maxUpgrades && !facility.IsMaxLevel; i++)
            {
                if (UpgradeFacility(type)) upgraded++;
                else break;
            }
            return upgraded;
        }

        // ── 해금 ───────────────────────────────────────────────────────────

        public bool UnlockFacility(FacilityType type)
        {
            if (!_facilities.TryGetValue(type, out var facility)) return false;
            if (facility.IsUnlocked) return true;

            facility.SaveData.isUnlocked = true;
            facility.SaveData.level = 1;
            _saveManager?.MarkDirty();

            OnFacilityUnlocked?.Invoke(facility);
            return true;
        }

        // ── 조회 ───────────────────────────────────────────────────────────

        public FacilityInstance GetFacility(FacilityType type)
        {
            _facilities.TryGetValue(type, out var f);
            return f;
        }

        public int GetFacilityLevel(FacilityType type)
        {
            return GetFacility(type)?.Level ?? 0;
        }

        public bool CanUpgrade(FacilityType type)
        {
            var facility = GetFacility(type);
            if (facility == null || !facility.IsUnlocked || facility.IsMaxLevel) return false;
            return _economyManager.CanAfford(CurrencyType.Coin, facility.UpgradeCost);
        }

        /// <summary>모든 시설의 총 수익 합산 (초당)</summary>
        public double GetTotalFacilityRevenuePerSecond()
        {
            double total = 0;
            foreach (var facility in _facilities.Values)
            {
                if (facility.IsUnlocked && facility.Level > 0)
                    total += facility.CurrentRevenue;
            }
            return total;
        }

        /// <summary>특정 시설의 효과 배율 반환 (배달 계산용)</summary>
        public float GetFacilityEffectMultiplier(FacilityType type)
        {
            return GetFacility(type)?.CurrentEffect ?? 1f;
        }

        public IEnumerable<FacilityInstance> GetAllFacilities() => _facilities.Values;
    }
}
