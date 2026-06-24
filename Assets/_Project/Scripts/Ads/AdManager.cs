// Assets/_Project/Scripts/Ads/AdManager.cs
// 보상형 광고 및 전면 광고 관리 매니저

using System;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;

namespace HedgehogDeliveryTycoon.Ads
{
    /// <summary>
    /// 광고 SDK 추상화 레이어. IRewardedAdProvider를 통해 실제 SDK와 통신합니다.
    /// </summary>
    public class AdManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        [Header("광고 설정 (Editor 테스트용)")]
        [SerializeField] private bool useDummyAdsInEditor = true;

        [Header("광고 ID (실 배포용)")]
        [SerializeField] private string androidRewardedAdUnitId = "ca-app-pub-XXXXXXXX/XXXXXXXX";
        [SerializeField] private string iosRewardedAdUnitId     = "ca-app-pub-XXXXXXXX/XXXXXXXX";

        private IRewardedAdProvider _rewardedAdProvider;
        private float _lastRewardedAdTime = -999f;

        public static event Action OnRewardedAdLoaded;
        public static event Action<bool> OnRewardedAdCompleted;

        private void Awake()
        {
            ServiceLocator.Register<AdManager>(this);
        }

        public void Initialize()
        {
#if UNITY_EDITOR
            if (useDummyAdsInEditor)
            {
                _rewardedAdProvider = new DummyRewardedAdProvider();
                Debug.Log("[AdManager] 더미 광고 제공자 사용 (에디터)");
            }
#else
            // TODO: 실제 AdMob 또는 MAX SDK 초기화
            // MobileAds.Initialize(initStatus => { LoadRewardedAd(); });
            _rewardedAdProvider = new DummyRewardedAdProvider();
            Debug.LogWarning("[AdManager] 실제 광고 SDK 미설정. 더미 사용.");
#endif
            _rewardedAdProvider?.LoadAd();
            IsInitialized = true;
        }

        // ── 보상형 광고 ────────────────────────────────────────────────────

        public bool IsRewardedAdReady()
        {
            if (_rewardedAdProvider == null) return false;
            bool cooldownOver = Time.realtimeSinceStartup - _lastRewardedAdTime
                                >= GameConstants.RewardedAdCooldownSeconds;
            return _rewardedAdProvider.IsReady() && cooldownOver;
        }

        /// <summary>
        /// 보상형 광고 표시.
        /// onReward(success): 광고 완료 시 true, 취소/실패 시 false.
        /// </summary>
        public void ShowRewardedAd(Action<bool> onReward)
        {
            if (!IsRewardedAdReady())
            {
                Debug.LogWarning("[AdManager] 보상형 광고 준비되지 않음 또는 쿨타임 중");
                onReward?.Invoke(false);
                return;
            }

            Analytics.AnalyticsManager analyticsManager = ServiceLocator.Get<Analytics.AnalyticsManager>();
            analyticsManager?.LogEvent(Analytics.AnalyticsEventName.RewardedAdStart);

            _rewardedAdProvider.ShowAd(success =>
            {
                _lastRewardedAdTime = Time.realtimeSinceStartup;
                analyticsManager?.LogEvent(Analytics.AnalyticsEventName.RewardedAdComplete,
                    ("success", success.ToString()));
                onReward?.Invoke(success);
                OnRewardedAdCompleted?.Invoke(success);

                // 광고 완료 후 다음 광고 자동 로드
                _rewardedAdProvider?.LoadAd();
            });
        }

        /// <summary>전면 광고 표시 (광고 제거 구매 시 비활성화)</summary>
        public void ShowInterstitialAd()
        {
            var save = ServiceLocator.Get<Save.SaveManager>()?.CurrentSave;
            if (save?.settings?.noAdsOwned == true) return;

            // TODO: 실제 전면 광고 SDK 호출
            Debug.Log("[AdManager] 전면 광고 표시 (TODO: SDK 연동)");
        }

        public void LoadAds()
        {
            _rewardedAdProvider?.LoadAd();
        }
    }
}
