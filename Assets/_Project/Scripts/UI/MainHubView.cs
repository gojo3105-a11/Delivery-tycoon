// Assets/_Project/Scripts/UI/MainHubView.cs
// 메인 허브 화면 뷰 컨트롤러

using TMPro;
using UnityEngine;
using UnityEngine.UI;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Facilities;

namespace HedgehogDeliveryTycoon.UI
{
    /// <summary>
    /// 메인 허브 화면 (게임의 기본 화면).
    /// 통화 HUD, 시설 그리드, 주문 현황 등을 표시합니다.
    /// </summary>
    public class MainHubView : UIView
    {
        [Header("HUD - 통화 표시")]
        [SerializeField] private TextMeshProUGUI coinText;
        [SerializeField] private TextMeshProUGUI gemText;
        [SerializeField] private TextMeshProUGUI revenuePerSecText;

        [Header("하단 탭 바")]
        [SerializeField] private Button tabHub;
        [SerializeField] private Button tabCityMap;
        [SerializeField] private Button tabCouriers;
        [SerializeField] private Button tabShop;
        [SerializeField] private Button tabSettings;

        [Header("주문 현황")]
        [SerializeField] private Transform orderQueueParent;
        [SerializeField] private GameObject orderEntryPrefab;

        [Header("수익 갱신 주기")]
        [SerializeField] private float refreshInterval = 0.5f;

        private float _refreshTimer;
        private EconomyManager _economyManager;
        private FacilityManager _facilityManager;

        protected override void Awake()
        {
            base.Awake();
            _economyManager  = ServiceLocator.Get<EconomyManager>();
            _facilityManager = ServiceLocator.Get<FacilityManager>();

            tabHub?.onClick.AddListener(() => OpenTab(UIManager.UIViewIds.MainHub));
            tabCityMap?.onClick.AddListener(() => OpenTab(UIManager.UIViewIds.CityMap));
            tabCouriers?.onClick.AddListener(() => OpenTab(UIManager.UIViewIds.CourierRecruitment));
            tabShop?.onClick.AddListener(() => OpenTab(UIManager.UIViewIds.Shop));
            tabSettings?.onClick.AddListener(() => OpenTab(UIManager.UIViewIds.Settings));
        }

        protected override void OnBeforeShow(object data)
        {
            RefreshAll();
        }

        private void Update()
        {
            if (!IsVisible) return;
            _refreshTimer += Time.deltaTime;
            if (_refreshTimer >= refreshInterval)
            {
                RefreshRevenueDisplay();
                _refreshTimer = 0f;
            }
        }

        // ── 표시 갱신 ──────────────────────────────────────────────────────

        public override void Refresh()
        {
            RefreshAll();
        }

        private void RefreshAll()
        {
            RefreshCurrencyDisplay(CurrencyType.Coin, _economyManager?.GetBalance(CurrencyType.Coin) ?? 0);
            RefreshCurrencyDisplay(CurrencyType.Gem,  _economyManager?.GetBalance(CurrencyType.Gem) ?? 0);
            RefreshRevenueDisplay();
        }

        /// <summary>통화 잔액 HUD 업데이트 (EconomyManager 이벤트로 호출됨)</summary>
        public void RefreshCurrencyDisplay(CurrencyType type, double balance)
        {
            switch (type)
            {
                case CurrencyType.Coin:
                    if (coinText != null) coinText.text = FormatCurrency(balance);
                    break;
                case CurrencyType.Gem:
                    if (gemText != null) gemText.text = ((int)balance).ToString("N0");
                    break;
            }
        }

        private void RefreshRevenueDisplay()
        {
            if (revenuePerSecText == null) return;
            var deliveryMgr = ServiceLocator.Get<Delivery.DeliveryManager>();
            double rps = deliveryMgr?.GetEstimatedRevenuePerSecond() ?? 0;
            revenuePerSecText.text = $"+{FormatCurrency(rps)}/s";
        }

        // ── 탭 전환 ────────────────────────────────────────────────────────

        private void OpenTab(string viewId)
        {
            ServiceLocator.Get<UIManager>()?.OpenView(viewId);
        }

        // ── 포맷 유틸리티 ──────────────────────────────────────────────────

        private string FormatCurrency(double value)
        {
            if (value >= 1e15) return $"{value / 1e15:F2}Q";
            if (value >= 1e12) return $"{value / 1e12:F2}T";
            if (value >= 1e9)  return $"{value / 1e9:F2}B";
            if (value >= 1e6)  return $"{value / 1e6:F2}M";
            if (value >= 1e3)  return $"{value / 1e3:F2}K";
            return value.ToString("F0");
        }
    }
}
