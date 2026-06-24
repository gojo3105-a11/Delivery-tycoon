// Assets/_Project/Scripts/UI/OfflineRewardPopup.cs
// 오프라인 보상 팝업 뷰 컨트롤러

using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Ads;
using HedgehogDeliveryTycoon.Offline;

namespace HedgehogDeliveryTycoon.UI
{
    /// <summary>
    /// 게임 복귀 시 표시되는 오프라인 보상 팝업.
    /// 기본 수령 버튼과 광고 시청 후 3배 수령 버튼을 제공합니다.
    /// </summary>
    public class OfflineRewardPopup : UIView
    {
        [Header("오프라인 시간 표시")]
        [SerializeField] private TextMeshProUGUI offlineTimeText;

        [Header("보상 표시")]
        [SerializeField] private TextMeshProUGUI rewardCoinsText;
        [SerializeField] private TextMeshProUGUI adRewardCoinsText;

        [Header("버튼")]
        [SerializeField] private Button claimButton;        // 기본 수령
        [SerializeField] private Button watchAdButton;      // 광고 보기 → 3배 수령
        [SerializeField] private GameObject adLoadingIndicator;

        [Header("코인 카운터 애니메이션")]
        [SerializeField] private float coinCountDuration = 1.5f;

        private OfflineRewardManager _offlineRewardManager;
        private AdManager _adManager;

        protected override void Awake()
        {
            base.Awake();
            _offlineRewardManager = ServiceLocator.Get<OfflineRewardManager>();
            _adManager = ServiceLocator.Get<AdManager>();

            claimButton?.onClick.AddListener(OnClaimClicked);
            watchAdButton?.onClick.AddListener(OnWatchAdClicked);
        }

        protected override void OnBeforeShow(object data)
        {
            RefreshDisplay();
        }

        private void RefreshDisplay()
        {
            if (_offlineRewardManager == null) return;

            // 오프라인 시간 표시
            float seconds = _offlineRewardManager.CappedSeconds;
            if (offlineTimeText)
                offlineTimeText.text = FormatTime(seconds);

            // 기본 보상
            double reward = _offlineRewardManager.PendingReward;
            if (rewardCoinsText)
                rewardCoinsText.text = FormatCurrency(reward);

            // 광고 보상 미리보기
            double adReward = _offlineRewardManager.GetAdBonusPreview();
            if (adRewardCoinsText)
                adRewardCoinsText.text = FormatCurrency(adReward);

            // 광고 준비 여부에 따라 광고 버튼 표시
            bool adReady = _adManager?.IsRewardedAdReady() ?? false;
            if (watchAdButton) watchAdButton.interactable = adReady;
            if (adLoadingIndicator) adLoadingIndicator.SetActive(!adReady);
        }

        private void OnClaimClicked()
        {
            _offlineRewardManager?.ClaimReward(useAd: false);
            Hide();
        }

        private void OnWatchAdClicked()
        {
            if (_adManager == null || !_adManager.IsRewardedAdReady()) return;

            if (watchAdButton) watchAdButton.interactable = false;
            if (adLoadingIndicator) adLoadingIndicator.SetActive(true);

            _adManager.ShowRewardedAd(onReward: (success) =>
            {
                if (success)
                {
                    _offlineRewardManager?.ClaimReward(useAd: true);
                    Hide();
                }
                else
                {
                    // 광고 실패 시 기본 수령으로 폴백
                    _offlineRewardManager?.ClaimReward(useAd: false);
                    Hide();
                }
            });
        }

        // ── 유틸리티 ───────────────────────────────────────────────────────

        private string FormatTime(float totalSeconds)
        {
            int hours   = (int)(totalSeconds / 3600);
            int minutes = (int)(totalSeconds % 3600 / 60);
            int secs    = (int)(totalSeconds % 60);
            if (hours > 0)   return $"{hours}시간 {minutes:D2}분";
            if (minutes > 0) return $"{minutes}분 {secs:D2}초";
            return $"{secs}초";
        }

        private string FormatCurrency(double value)
        {
            if (value >= 1e9)  return $"{value / 1e9:F2}B";
            if (value >= 1e6)  return $"{value / 1e6:F2}M";
            if (value >= 1e3)  return $"{value / 1e3:F1}K";
            return value.ToString("F0");
        }
    }
}
