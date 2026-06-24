// Assets/_Project/Scripts/Ads/IRewardedAdProvider.cs
// 보상형 광고 제공자 인터페이스 (AdMob / MAX / 기타 SDK 교체 가능)

using System;

namespace HedgehogDeliveryTycoon.Ads
{
    /// <summary>
    /// 보상형 광고 제공자가 구현해야 하는 인터페이스.
    /// AdManager가 이 인터페이스를 통해 SDK에 접근하므로 SDK 교체가 쉽습니다.
    /// </summary>
    public interface IRewardedAdProvider
    {
        /// <summary>광고 로드 요청</summary>
        void LoadAd();

        /// <summary>광고가 표시 준비되었는지 여부</summary>
        bool IsReady();

        /// <summary>광고 표시. onComplete(success) 콜백이 완료 시 호출됩니다.</summary>
        void ShowAd(Action<bool> onComplete);
    }

    /// <summary>
    /// 개발/테스트용 더미 보상형 광고 제공자.
    /// 실 배포 시 AdMobRewardedAdProvider 또는 MaxRewardedAdProvider로 교체합니다.
    /// </summary>
    public class DummyRewardedAdProvider : IRewardedAdProvider
    {
        private bool _isReady = true;

        public void LoadAd()
        {
            _isReady = true;
            UnityEngine.Debug.Log("[DummyAd] 광고 로드 완료 (더미)");
        }

        public bool IsReady() => _isReady;

        public void ShowAd(Action<bool> onComplete)
        {
            UnityEngine.Debug.Log("[DummyAd] 광고 시청 완료 (더미)");
            _isReady = false;
            // 실제 광고 SDK에서는 비동기 콜백으로 처리
            onComplete?.Invoke(true);
            // 자동 재로드
            UnityEngine.MonoBehaviour.print("[DummyAd] 광고 자동 재로드");
            LoadAd();
        }
    }
}
