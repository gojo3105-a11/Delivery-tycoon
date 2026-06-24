// Assets/_Project/Scripts/IAP/IAPManager.cs
// 인앱 결제 처리 매니저 (Unity IAP 기반)

using System;
using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.IAP
{
    /// <summary>
    /// Unity IAP 패키지를 사용하는 인앱 결제 매니저.
    /// TODO: IStoreListener 구현 및 UnityPurchasing.Initialize() 호출 필요.
    /// </summary>
    public class IAPManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        public static event Action<string> OnPurchaseSuccess;
        public static event Action<string, string> OnPurchaseFailed; // productId, reason

        private EconomyManager _economyManager;
        private SaveManager _saveManager;

        // 구매 완료 상품 캐시 (비소모성 중복 구매 방지)
        private HashSet<string> _purchasedProducts = new();

        private void Awake()
        {
            ServiceLocator.Register<IAPManager>(this);
        }

        public void Initialize()
        {
            _economyManager = ServiceLocator.Get<EconomyManager>();
            _saveManager    = ServiceLocator.Get<SaveManager>();

            // TODO: Unity IAP 초기화
            // var builder = ConfigurationBuilder.Instance(StandardPurchasingModule.Instance());
            // RegisterProducts(builder);
            // UnityPurchasing.Initialize(this, builder);

            IsInitialized = true;
            Debug.Log("[IAPManager] 초기화 완료 (TODO: 실제 SDK 연동 필요)");
        }

        // ── 구매 요청 ──────────────────────────────────────────────────────

        /// <summary>상품 구매 요청. Unity IAP ProcessPurchase 콜백으로 완료됩니다.</summary>
        public void PurchaseProduct(string productId)
        {
            Debug.Log($"[IAPManager] 구매 요청: {productId}");
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.IAPPurchaseStart,
                    ("product_id", productId));

            // TODO: Unity IAP
            // _storeController?.InitiatePurchase(productId);

            // 개발 중 더미 구매 처리
#if UNITY_EDITOR
            ProcessPurchaseDummy(productId);
#endif
        }

        // ── 구매 완료 처리 ─────────────────────────────────────────────────

        /// <summary>Unity IAP ProcessPurchase 콜백에서 호출됩니다.</summary>
        private void OnPurchaseComplete(string productId)
        {
            bool success = DeliverProduct(productId);
            if (success)
            {
                OnPurchaseSuccess?.Invoke(productId);
                _saveManager?.SaveImmediate();
                ServiceLocator.Get<Analytics.AnalyticsManager>()
                    ?.LogEvent(Analytics.AnalyticsEventName.IAPPurchaseComplete,
                        ("product_id", productId));
            }
        }

        /// <summary>구매한 상품의 보상 지급</summary>
        private bool DeliverProduct(string productId)
        {
            switch (productId)
            {
                case ProductId.GemSmall:
                    _economyManager.AddCurrency(CurrencyType.Gem, 80); return true;
                case ProductId.GemMedium:
                    _economyManager.AddCurrency(CurrencyType.Gem, 500); return true;
                case ProductId.GemLarge:
                    _economyManager.AddCurrency(CurrencyType.Gem, 1200); return true;
                case ProductId.GemXLarge:
                    _economyManager.AddCurrency(CurrencyType.Gem, 2500); return true;
                case ProductId.GemMega:
                    _economyManager.AddCurrency(CurrencyType.Gem, 6500); return true;

                case ProductId.StarterPack:
                    if (!IsProductPurchased(ProductId.StarterPack))
                    {
                        _economyManager.AddCurrency(CurrencyType.Gem, 200);
                        _economyManager.AddCurrency(CurrencyType.Coin, 50000);
                        // TODO: 희귀 택배원 지급
                        _purchasedProducts.Add(ProductId.StarterPack);
                    }
                    return true;

                case ProductId.GrowthPack:
                    _economyManager.AddCurrency(CurrencyType.Gem, 500);
                    _economyManager.AddCurrency(CurrencyType.UpgradeParts, 100);
                    // TODO: 에픽 채용권 3장 지급
                    return true;

                case ProductId.NoAds:
                    if (_saveManager?.CurrentSave?.settings != null)
                        _saveManager.CurrentSave.settings.noAdsOwned = true;
                    _economyManager.AddCurrency(CurrencyType.Gem, 50);
                    return true;

                case ProductId.MonthlyPass:
                    if (_saveManager?.CurrentSave?.settings != null)
                        _saveManager.CurrentSave.settings.monthlyPassActive = true;
                    // TODO: 매일 로그인 시 젬 50개 스케줄러 등록
                    return true;

                case ProductId.VipPass:
                    if (_saveManager?.CurrentSave?.settings != null)
                    {
                        _saveManager.CurrentSave.settings.vipOwned = true;
                        _saveManager.CurrentSave.settings.noAdsOwned = true;
                    }
                    return true;

                default:
                    Debug.LogWarning($"[IAPManager] 알 수 없는 상품 ID: {productId}");
                    return false;
            }
        }

        // ── 구매 복구 ──────────────────────────────────────────────────────

        public void RestorePurchases()
        {
            // TODO: Unity IAP RestorePurchases (iOS 필수)
            Debug.Log("[IAPManager] 구매 복구 요청 (TODO: SDK 연동)");
        }

        public bool IsProductPurchased(string productId) => _purchasedProducts.Contains(productId);

        // ── 더미 구매 (개발용) ────────────────────────────────────────────

        [System.Diagnostics.Conditional("UNITY_EDITOR")]
        private void ProcessPurchaseDummy(string productId)
        {
            Debug.Log($"[IAPManager] 더미 구매 처리: {productId}");
            OnPurchaseComplete(productId);
        }
    }
}
