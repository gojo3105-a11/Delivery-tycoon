// Assets/_Project/Scripts/Delivery/DeliveryManager.cs
// 배달 주문 생성, 배차, 완료 처리 매니저

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Characters;
using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Facilities;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Delivery
{
    /// <summary>
    /// 배달 주문 루프를 실행하는 핵심 게임플레이 매니저.
    /// 구역별로 주문을 생성하고, 가용 택배원에게 배차하며, 완료 시 수익을 지급합니다.
    /// </summary>
    public class DeliveryManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        private Dictionary<string, DeliveryOrder> _activeOrders = new();

        public static event Action<DeliveryOrder> OnOrderCreated;
        public static event Action<DeliveryOrder> OnOrderAssigned;
        public static event Action<DeliveryOrder, double> OnOrderCompleted; // 주문, 수익

        private DataManager       _dataManager;
        private EconomyManager    _economyManager;
        private CharacterManager  _characterManager;
        private FacilityManager   _facilityManager;
        private SaveManager       _saveManager;

        private bool _isRunning = false;

        private void Awake()
        {
            ServiceLocator.Register<DeliveryManager>(this);
        }

        public void Initialize()
        {
            _dataManager      = ServiceLocator.Get<DataManager>();
            _economyManager   = ServiceLocator.Get<EconomyManager>();
            _characterManager = ServiceLocator.Get<CharacterManager>();
            _facilityManager  = ServiceLocator.Get<FacilityManager>();
            _saveManager      = ServiceLocator.Get<SaveManager>();
            IsInitialized     = true;
        }

        public void StartOrderGeneration()
        {
            if (_isRunning) return;
            _isRunning = true;
            StartCoroutine(OrderGenerationLoop());
            Debug.Log("[DeliveryManager] 주문 생성 루프 시작");
        }

        public void StopOrderGeneration()
        {
            _isRunning = false;
            StopAllCoroutines();
        }

        // ── 주문 생성 루프 ─────────────────────────────────────────────────

        private IEnumerator OrderGenerationLoop()
        {
            var config = _dataManager.GetEconomyConfig();

            while (_isRunning)
            {
                var unlockedZones = _saveManager?.CurrentSave?.unlockedZoneIds;
                if (unlockedZones != null)
                {
                    foreach (var zoneId in unlockedZones)
                    {
                        TryGenerateOrderForZone(zoneId, config);
                    }
                }
                yield return new WaitForSeconds(config?.baseOrderIntervalSeconds ?? 5f);
            }
        }

        private void TryGenerateOrderForZone(string zoneId, EconomyConfig config)
        {
            var zoneData = _dataManager.GetZoneData(zoneId);
            if (zoneData == null) return;

            // 해당 구역 최대 동시 주문 수 확인
            int activeInZone = _activeOrders.Values
                .Count(o => o.ZoneId == zoneId && o.Status == DeliveryOrderStatus.InProgress);
            if (activeInZone >= zoneData.maxConcurrentOrders) return;

            // 수익 계산
            float facilityMultiplier = _facilityManager.GetFacilityEffectMultiplier(FacilityType.PackingTable);
            int prestigeLevel = _saveManager?.CurrentSave?.prestigeLevel ?? 0;
            float prestigeMultiplier = config.GetPrestigeMultiplier(prestigeLevel);

            double orderValue = EconomyCalculator.CalculateDeliveryRevenue(
                config.baseOrderValue,
                zoneData.zoneRevenueMultiplier,
                facilityMultiplier,
                1f, // 택배원 보너스는 배차 시 계산
                prestigeMultiplier);

            // 배달 시간 계산 (기본 10초 ~ 30초)
            float baseDuration = 10f + zoneData.zoneIndex * 3f;
            float duration = baseDuration * zoneData.orderIntervalMultiplier;

            var order = new DeliveryOrder(zoneId, orderValue, duration);
            _activeOrders[order.OrderId] = order;

            OnOrderCreated?.Invoke(order);
            TryAssignCourier(order, config);
        }

        // ── 배차 ───────────────────────────────────────────────────────────

        private void TryAssignCourier(DeliveryOrder order, EconomyConfig config)
        {
            var available = _characterManager.GetAvailableCouriers(order.ZoneId).FirstOrDefault();
            if (available == null) return; // 가용 택배원 없음

            order.Assign(available.InstanceId, Time.time);
            available.StartDelivery();

            OnOrderAssigned?.Invoke(order);
            StartCoroutine(DeliveryCoroutine(order, available.InstanceId, config));
        }

        private IEnumerator DeliveryCoroutine(DeliveryOrder order, string courierInstanceId, EconomyConfig config)
        {
            yield return new WaitForSeconds(order.DeliveryDurationSeconds);

            if (order.Status != DeliveryOrderStatus.InProgress)
            {
                yield break; // 취소된 경우
            }

            // 택배원 수익 보너스 적용
            var courier = _characterManager.GetCharacter(courierInstanceId);
            double finalRevenue = order.RewardCoins;
            if (courier != null)
                finalRevenue *= courier.CurrentRevenueBonus;

            // 수익 지급
            _economyManager.AddCurrency(CurrencyType.Coin, finalRevenue);
            order.Complete();
            _activeOrders.Remove(order.OrderId);

            // 택배원 해제
            courier?.FinishDelivery();

            // 통계 업데이트
            if (_saveManager?.CurrentSave != null)
                _saveManager.CurrentSave.totalDeliveryCount++;

            OnOrderCompleted?.Invoke(order, finalRevenue);
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.DeliveryComplete,
                    ("zone_id", order.ZoneId), ("revenue", finalRevenue.ToString("F0")));

            // 다음 주문 즉시 생성 시도 (자동 루프)
            var zoneData = _dataManager?.GetZoneData(order.ZoneId);
            if (zoneData != null)
                TryGenerateOrderForZone(order.ZoneId, config);
        }

        // ── 조회 ───────────────────────────────────────────────────────────

        public IEnumerable<DeliveryOrder> GetActiveOrders() => _activeOrders.Values;

        public IEnumerable<DeliveryOrder> GetOrdersByZone(string zoneId) =>
            _activeOrders.Values.Where(o => o.ZoneId == zoneId);

        /// <summary>현재 초당 평균 수익 추정 (오프라인 보상 계산용)</summary>
        public double GetEstimatedRevenuePerSecond()
        {
            var config = _dataManager?.GetEconomyConfig();
            var deployedCouriers = _characterManager?.GetDeployedCouriers().ToList();
            int courierCount = deployedCouriers?.Count ?? 0;
            float avgEfficiency = courierCount > 0
                ? deployedCouriers.Average(c => c.CurrentSpeed)
                : 0f;

            double facilityRevenue = _facilityManager?.GetTotalFacilityRevenuePerSecond() ?? 0;
            int prestigeLevel = _saveManager?.CurrentSave?.prestigeLevel ?? 0;
            float prestigeMultiplier = config?.GetPrestigeMultiplier(prestigeLevel) ?? 1f;

            return EconomyCalculator.EstimateRevenuePerSecond(
                facilityRevenue, courierCount, avgEfficiency, prestigeMultiplier);
        }
    }
}
