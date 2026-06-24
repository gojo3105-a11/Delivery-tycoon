// Assets/_Project/Scripts/Data/DataManager.cs
// ScriptableObject 정적 데이터 캐싱 및 접근 매니저

using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 모든 ScriptableObject 정적 데이터를 로드하고 캐싱하는 매니저.
    /// Resources 폴더에서 로드하거나, Addressables로 교체 가능합니다.
    /// </summary>
    public class DataManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        // 정적 데이터 캐시
        private Dictionary<string, HedgehogData> _hedgehogDataCache = new();
        private Dictionary<string, FacilityData> _facilityDataCache = new();
        private Dictionary<string, VehicleData> _vehicleDataCache = new();
        private Dictionary<string, DeliveryZoneData> _zoneDataCache = new();
        private EconomyConfig _economyConfig;

        private void Awake()
        {
            ServiceLocator.Register<DataManager>(this);
        }

        public void Initialize()
        {
            LoadAllData();
            IsInitialized = true;
            Debug.Log($"[DataManager] 초기화 완료. " +
                      $"캐릭터:{_hedgehogDataCache.Count} 시설:{_facilityDataCache.Count} " +
                      $"차량:{_vehicleDataCache.Count} 구역:{_zoneDataCache.Count}");
        }

        private void LoadAllData()
        {
            // TODO: Addressables로 교체 시 Resources.LoadAll 대신 Addressables.LoadAssetsAsync 사용
            LoadHedgehogData();
            LoadFacilityData();
            LoadVehicleData();
            LoadZoneData();
            LoadEconomyConfig();
        }

        private void LoadHedgehogData()
        {
            var data = Resources.LoadAll<HedgehogData>("ScriptableObjects/Characters");
            foreach (var d in data)
            {
                if (string.IsNullOrEmpty(d.id)) { Debug.LogWarning($"[DataManager] HedgehogData '{d.name}' ID 없음"); continue; }
                _hedgehogDataCache[d.id] = d;
            }
        }

        private void LoadFacilityData()
        {
            var data = Resources.LoadAll<FacilityData>("ScriptableObjects/Facilities");
            foreach (var d in data)
            {
                if (string.IsNullOrEmpty(d.id)) continue;
                _facilityDataCache[d.id] = d;
            }
        }

        private void LoadVehicleData()
        {
            var data = Resources.LoadAll<VehicleData>("ScriptableObjects/Vehicles");
            foreach (var d in data)
            {
                if (string.IsNullOrEmpty(d.id)) continue;
                _vehicleDataCache[d.id] = d;
            }
        }

        private void LoadZoneData()
        {
            var data = Resources.LoadAll<DeliveryZoneData>("ScriptableObjects/Zones");
            foreach (var d in data)
            {
                if (string.IsNullOrEmpty(d.id)) continue;
                _zoneDataCache[d.id] = d;
            }
        }

        private void LoadEconomyConfig()
        {
            _economyConfig = Resources.Load<EconomyConfig>("ScriptableObjects/Economy/EconomyConfig");
            if (_economyConfig == null)
                Debug.LogError("[DataManager] EconomyConfig를 찾을 수 없습니다!");
        }

        // ── 데이터 접근 메서드 ──────────────────────────────────────────

        public HedgehogData GetHedgehogData(string id)
        {
            _hedgehogDataCache.TryGetValue(id, out var data);
            return data;
        }

        public IEnumerable<HedgehogData> GetAllHedgehogData() => _hedgehogDataCache.Values;

        public FacilityData GetFacilityData(string id)
        {
            _facilityDataCache.TryGetValue(id, out var data);
            return data;
        }

        public IEnumerable<FacilityData> GetAllFacilityData() => _facilityDataCache.Values;

        public VehicleData GetVehicleData(string id)
        {
            _vehicleDataCache.TryGetValue(id, out var data);
            return data;
        }

        public DeliveryZoneData GetZoneData(string id)
        {
            _zoneDataCache.TryGetValue(id, out var data);
            return data;
        }

        public IEnumerable<DeliveryZoneData> GetAllZoneData() => _zoneDataCache.Values;

        public EconomyConfig GetEconomyConfig() => _economyConfig;
    }
}
