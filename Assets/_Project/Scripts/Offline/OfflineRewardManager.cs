// Assets/_Project/Scripts/Offline/OfflineRewardManager.cs
// 오프라인 수익 계산 및 복귀 보상 처리 매니저

using System;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Delivery;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Offline
{
    /// <summary>
    /// 앱이 꺼져 있던 시간 동안 누적된 수익을 계산하고,
    /// 복귀 시 플레이어에게 수령 옵션을 제공합니다.
    /// </summary>
    public class OfflineRewardManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        // 계산된 오프라인 보상 (수령 전 보관)
        public double PendingReward      { get; private set; }
        public float  OfflineSeconds     { get; private set; }
        public float  CappedSeconds      { get; private set; }
        public bool   HasPendingReward   => PendingReward > 0;

        public static event Action<double, float> OnOfflineRewardCalculated; // reward, seconds
        public static event Action<double>        OnOfflineRewardClaimed;    // final reward

        private DataManager     _dataManager;
        private EconomyManager  _economyManager;
        private DeliveryManager _deliveryManager;
        private SaveManager     _saveManager;

        private bool _rewardClaimed = false;

        private void Awake()
        {
            ServiceLocator.Register<OfflineRewardManager>(this);
        }

        public void Initialize()
        {
            _dataManager     = ServiceLocator.Get<DataManager>();
            _economyManager  = ServiceLocator.Get<EconomyManager>();
            _deliveryManager = ServiceLocator.Get<DeliveryManager>();
            _saveManager     = ServiceLocator.Get<SaveManager>();
            IsInitialized    = true;
        }

        /// <summary>
        /// 마지막 로그인 시간을 기준으로 오프라인 보상을 계산합니다.
        /// GameManager 초기화 완료 후 호출됩니다.
        /// </summary>
        public void CalculateOfflineReward()
        {
            _rewardClaimed = false;
            PendingReward  = 0;

            var save = _saveManager?.CurrentSave;
            if (save == null || string.IsNullOrEmpty(save.lastLoginUtc))
            {
                Debug.Log("[OfflineRewardManager] 이전 로그인 시간 없음. 오프라인 보상 없음.");
                return;
            }

            // 오프라인 시간 계산
            if (!DateTime.TryParse(save.lastLoginUtc, out DateTime lastLogin))
            {
                Debug.LogWarning("[OfflineRewardManager] lastLoginUtc 파싱 실패");
                return;
            }

            DateTime now = DateTime.UtcNow;
            float rawOfflineSeconds = (float)(now - lastLogin).TotalSeconds;

            // 시간 역행 방지 (치트 감지)
            if (rawOfflineSeconds < 0)
            {
                Debug.LogWarning("[OfflineRewardManager] 시스템 시간 역행 감지. 오프라인 보상 0으로 처리.");
                rawOfflineSeconds = 0;
            }

            OfflineSeconds = rawOfflineSeconds;

            var config = _dataManager?.GetEconomyConfig();
            float maxHours         = config?.offlineMaxHours          ?? GameConstants.DefaultOfflineMaxHours;
            float efficiencyRate   = config?.offlineEfficiencyRate     ?? GameConstants.DefaultOfflineEfficiencyRate;

            CappedSeconds = Mathf.Min(OfflineSeconds, maxHours * 3600f);

            double revenuePerSecond = _deliveryManager?.GetEstimatedRevenuePerSecond() ?? 0;

            PendingReward = EconomyCalculator.CalculateOfflineReward(
                revenuePerSecond, OfflineSeconds, maxHours, efficiencyRate);

            if (PendingReward < 1.0) // 의미 없는 소량 무시
            {
                PendingReward = 0;
                return;
            }

            Debug.Log($"[OfflineRewardManager] 오프라인 {OfflineSeconds:F0}초 ({CappedSeconds:F0}초 적용) " +
                      $"보상: {PendingReward:F0} 코인");
            OnOfflineRewardCalculated?.Invoke(PendingReward, CappedSeconds);
        }

        /// <summary>
        /// 오프라인 보상 수령.
        /// useAd가 true이면 광고 배율을 적용합니다.
        /// </summary>
        public void ClaimReward(bool useAd = false)
        {
            if (_rewardClaimed || PendingReward <= 0) return;

            double finalReward = PendingReward;
            if (useAd)
            {
                float multiplier = _dataManager?.GetEconomyConfig()?.rewardedAdMultiplier
                                   ?? GameConstants.DefaultAdRewardMultiplier;
                finalReward = EconomyCalculator.ApplyAdMultiplier(PendingReward, multiplier);
            }

            _economyManager.AddCurrency(CurrencyType.Coin, finalReward);
            _rewardClaimed = true;
            PendingReward  = 0;

            OnOfflineRewardClaimed?.Invoke(finalReward);
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.OfflineRewardClaim,
                    ("reward_coins", finalReward.ToString("F0")),
                    ("offline_seconds", OfflineSeconds.ToString("F0")),
                    ("used_ad", useAd.ToString()));

            Debug.Log($"[OfflineRewardManager] 보상 수령: {finalReward:F0} 코인 (광고 배율: {useAd})");
        }

        /// <summary>광고 시청 시 받을 수 있는 보상 미리보기 (UI 표시용)</summary>
        public double GetAdBonusPreview()
        {
            float multiplier = _dataManager?.GetEconomyConfig()?.rewardedAdMultiplier
                               ?? GameConstants.DefaultAdRewardMultiplier;
            return EconomyCalculator.ApplyAdMultiplier(PendingReward, multiplier);
        }
    }
}
