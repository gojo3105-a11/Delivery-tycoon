// Assets/_Project/Scripts/UI/UIManager.cs
// UI 패널 열기/닫기 및 스택 관리 매니저

using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;

namespace HedgehogDeliveryTycoon.UI
{
    /// <summary>
    /// 게임 내 모든 UI 패널의 상태를 관리합니다.
    /// 패널은 ID 기반으로 접근하며, 뒤로가기 스택을 지원합니다.
    /// </summary>
    public class UIManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        [Header("UI 패널 등록")]
        [SerializeField] private UIViewEntry[] viewEntries;

        private Dictionary<string, UIView> _viewRegistry = new();
        private Stack<UIView> _viewStack = new();

        private void Awake()
        {
            ServiceLocator.Register<UIManager>(this);

            // 씬에 배치된 뷰를 레지스트리에 등록
            foreach (var entry in viewEntries)
            {
                if (entry.view != null && !string.IsNullOrEmpty(entry.viewId))
                    _viewRegistry[entry.viewId] = entry.view;
            }
        }

        public void Initialize()
        {
            // EconomyManager 이벤트 구독
            Economy.EconomyManager.OnCurrencyChanged += OnCurrencyChanged;
            IsInitialized = true;
            Debug.Log($"[UIManager] 초기화 완료. 등록 뷰: {_viewRegistry.Count}");
        }

        private void OnDestroy()
        {
            Economy.EconomyManager.OnCurrencyChanged -= OnCurrencyChanged;
        }

        // ── 패널 열기/닫기 ─────────────────────────────────────────────────

        public void OpenView(string viewId, object data = null)
        {
            if (!_viewRegistry.TryGetValue(viewId, out var view))
            {
                Debug.LogWarning($"[UIManager] 뷰 ID '{viewId}' 찾을 수 없음");
                return;
            }
            if (view.IsVisible) return;

            _viewStack.Push(view);
            view.Show(data);
        }

        public void CloseView(string viewId)
        {
            if (!_viewRegistry.TryGetValue(viewId, out var view)) return;
            if (!view.IsVisible) return;

            if (_viewStack.Count > 0 && _viewStack.Peek() == view)
                _viewStack.Pop();

            view.Hide();
        }

        /// <summary>가장 최근에 열린 패널 닫기 (뒤로가기 버튼용)</summary>
        public void CloseTopView()
        {
            if (_viewStack.Count == 0) return;
            var top = _viewStack.Pop();
            top.Hide();
        }

        public void ShowPopup(string popupId, object data = null) => OpenView(popupId, data);
        public void HidePopup(string popupId) => CloseView(popupId);

        public UIView GetView(string viewId)
        {
            _viewRegistry.TryGetValue(viewId, out var view);
            return view;
        }

        public T GetView<T>(string viewId) where T : UIView
        {
            return GetView(viewId) as T;
        }

        // ── HUD 업데이트 ───────────────────────────────────────────────────

        private void OnCurrencyChanged(Economy.CurrencyType type, double newBalance)
        {
            // HUD TopBar 업데이트
            var mainHubView = GetView<MainHubView>(UIViewIds.MainHub);
            mainHubView?.RefreshCurrencyDisplay(type, newBalance);
        }

        // ── 뷰 ID 상수 ─────────────────────────────────────────────────────
        public static class UIViewIds
        {
            public const string MainHub           = "main_hub";
            public const string CityMap           = "city_map";
            public const string CourierRecruitment = "courier_recruitment";
            public const string CourierDetail     = "courier_detail";
            public const string FacilityUpgrade   = "facility_upgrade";
            public const string Garage            = "garage";
            public const string CeoNest           = "ceo_nest";
            public const string Shop              = "shop";
            public const string Event             = "event";
            public const string Ranking           = "ranking";
            public const string OfflineReward     = "offline_reward";
            public const string RewardedAd        = "rewarded_ad";
            public const string Settings          = "settings";
        }
    }

    [System.Serializable]
    public class UIViewEntry
    {
        public string viewId;
        public UIView view;
    }
}
