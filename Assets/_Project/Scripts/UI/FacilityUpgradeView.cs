// Assets/_Project/Scripts/UI/FacilityUpgradeView.cs
// 시설 업그레이드 팝업 뷰 컨트롤러

using TMPro;
using UnityEngine;
using UnityEngine.UI;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Facilities;

namespace HedgehogDeliveryTycoon.UI
{
    /// <summary>
    /// 시설 탭 시 나타나는 업그레이드 팝업.
    /// 현재/다음 레벨 비교, 비용, ×1/×10/×MAX 업그레이드 버튼을 제공합니다.
    /// </summary>
    public class FacilityUpgradeView : UIView
    {
        [Header("시설 정보 표시")]
        [SerializeField] private TextMeshProUGUI facilityNameText;
        [SerializeField] private TextMeshProUGUI currentLevelText;
        [SerializeField] private Slider          levelProgressSlider;
        [SerializeField] private Image           facilityIcon;

        [Header("효과 비교 표시")]
        [SerializeField] private TextMeshProUGUI currentEffectText;
        [SerializeField] private TextMeshProUGUI nextEffectText;
        [SerializeField] private TextMeshProUGUI currentRevenueText;
        [SerializeField] private TextMeshProUGUI nextRevenueText;

        [Header("업그레이드 비용 표시")]
        [SerializeField] private TextMeshProUGUI upgradeCostText;
        [SerializeField] private TextMeshProUGUI upgradeX10CostText;
        [SerializeField] private TextMeshProUGUI upgradeMaxLevelsText;

        [Header("버튼")]
        [SerializeField] private Button upgradeX1Button;
        [SerializeField] private Button upgradeX10Button;
        [SerializeField] private Button upgradeMaxButton;
        [SerializeField] private Button closeButton;

        private FacilityType _currentFacilityType;
        private FacilityManager _facilityManager;
        private EconomyManager _economyManager;

        protected override void Awake()
        {
            base.Awake();
            _facilityManager = ServiceLocator.Get<FacilityManager>();
            _economyManager  = ServiceLocator.Get<EconomyManager>();

            upgradeX1Button?.onClick.AddListener(OnUpgradeX1);
            upgradeX10Button?.onClick.AddListener(OnUpgradeX10);
            upgradeMaxButton?.onClick.AddListener(OnUpgradeMax);
            closeButton?.onClick.AddListener(Hide);

            // 코인 변경 시 버튼 상태 갱신
            EconomyManager.OnCurrencyChanged += OnCurrencyChanged;
        }

        private void OnDestroy()
        {
            EconomyManager.OnCurrencyChanged -= OnCurrencyChanged;
        }

        protected override void OnBeforeShow(object data)
        {
            if (data is FacilityType facilityType)
            {
                _currentFacilityType = facilityType;
                RefreshDisplay();
            }
        }

        public override void Refresh() => RefreshDisplay();

        private void RefreshDisplay()
        {
            var facility = _facilityManager?.GetFacility(_currentFacilityType);
            if (facility == null) return;

            // 기본 정보
            if (facilityNameText)   facilityNameText.text   = facility.Data.displayName;
            if (currentLevelText)   currentLevelText.text   = $"Lv.{facility.Level} / {facility.Data.maxLevel}";
            if (levelProgressSlider) levelProgressSlider.value = (float)facility.Level / facility.Data.maxLevel;
            if (facilityIcon)       facilityIcon.sprite      = facility.Data.GetSpriteForLevel(facility.Level);

            // 효과 비교
            if (currentEffectText)  currentEffectText.text  = $"×{facility.CurrentEffect:F2}";
            if (nextEffectText)     nextEffectText.text      = facility.IsMaxLevel ? "MAX" : $"×{facility.NextLevelEffect:F2}";
            if (currentRevenueText) currentRevenueText.text  = $"{facility.CurrentRevenue:F1}/s";
            if (nextRevenueText)    nextRevenueText.text     = facility.IsMaxLevel ? "MAX" : $"{facility.NextLevelRevenue:F1}/s";

            // 비용
            if (!facility.IsMaxLevel)
            {
                if (upgradeCostText)   upgradeCostText.text   = FormatCurrency(facility.UpgradeCost);
                // ×10 비용
                double x10Cost = EconomyCalculator.CalculateFacilityTotalCost(
                    facility.Data, facility.Level, Mathf.Min(facility.Level + 10, facility.Data.maxLevel));
                if (upgradeX10CostText) upgradeX10CostText.text = FormatCurrency(x10Cost);

                // MAX 가능 레벨 수
                int maxLevels = EconomyCalculator.CalculateMaxAffordableUpgrades(
                    facility.Data, facility.Level, _economyManager.GetBalance(CurrencyType.Coin));
                if (upgradeMaxLevelsText) upgradeMaxLevelsText.text = maxLevels > 0 ? $"+{maxLevels}" : "코인 부족";
            }

            // 버튼 활성화 여부
            bool canUpgrade = _facilityManager.CanUpgrade(_currentFacilityType);
            if (upgradeX1Button)  upgradeX1Button.interactable  = canUpgrade;
            if (upgradeX10Button) upgradeX10Button.interactable = canUpgrade;
            if (upgradeMaxButton) upgradeMaxButton.interactable = canUpgrade;
        }

        private void OnUpgradeX1()
        {
            if (_facilityManager.UpgradeFacility(_currentFacilityType))
                RefreshDisplay();
        }

        private void OnUpgradeX10()
        {
            for (int i = 0; i < 10; i++)
            {
                if (!_facilityManager.UpgradeFacility(_currentFacilityType)) break;
            }
            RefreshDisplay();
        }

        private void OnUpgradeMax()
        {
            _facilityManager.UpgradeFacilityMax(_currentFacilityType);
            RefreshDisplay();
        }

        private void OnCurrencyChanged(CurrencyType type, double balance)
        {
            if (IsVisible && type == CurrencyType.Coin)
                RefreshDisplay();
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
