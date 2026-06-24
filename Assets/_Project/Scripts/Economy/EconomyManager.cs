// Assets/_Project/Scripts/Economy/EconomyManager.cs
// 모든 통화 잔액 관리 및 수입/지출 처리 매니저

using System;
using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Economy
{
    /// <summary>
    /// 게임 내 모든 통화의 잔액을 관리합니다.
    /// 통화 변경 시 이벤트를 발행하여 UI가 자동으로 업데이트되도록 합니다.
    /// </summary>
    public class EconomyManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        // 런타임 통화 잔액 (double 사용으로 대규모 수 처리)
        private Dictionary<CurrencyType, double> _balances = new();

        public static event Action<CurrencyType, double> OnCurrencyChanged;
        public static event Action<CurrencyType, double> OnCurrencyInsufficient;

        private SaveManager _saveManager;

        private void Awake()
        {
            ServiceLocator.Register<EconomyManager>(this);
        }

        public void Initialize()
        {
            _saveManager = ServiceLocator.Get<SaveManager>();
            LoadFromSave();
            IsInitialized = true;
            Debug.Log("[EconomyManager] 초기화 완료");
        }

        private void LoadFromSave()
        {
            var save = _saveManager?.CurrentSave;
            if (save == null)
            {
                ResetToDefault();
                return;
            }
            var c = save.currencies;
            _balances[CurrencyType.Coin]          = c.coins;
            _balances[CurrencyType.Gem]            = c.gems;
            _balances[CurrencyType.DeliveryBadge]  = c.deliveryBadges;
            _balances[CurrencyType.SnackToken]     = c.snackTokens;
            _balances[CurrencyType.UpgradeParts]   = c.upgradeParts;
            _balances[CurrencyType.EventMedal]     = c.eventMedals;
            _balances[CurrencyType.PrestigeStar]   = save.prestigeStars;
        }

        private void ResetToDefault()
        {
            foreach (CurrencyType type in Enum.GetValues(typeof(CurrencyType)))
                _balances[type] = 0;
            _balances[CurrencyType.Coin] = 100; // 시작 코인
        }

        // ── 잔액 조회 ──────────────────────────────────────────────────────

        public double GetBalance(CurrencyType type)
        {
            _balances.TryGetValue(type, out double balance);
            return balance;
        }

        public bool CanAfford(CurrencyType type, double amount)
        {
            return GetBalance(type) >= amount;
        }

        // ── 수입 ───────────────────────────────────────────────────────────

        /// <summary>통화를 추가합니다. amount는 양수여야 합니다.</summary>
        public void AddCurrency(CurrencyType type, double amount)
        {
            if (amount <= 0) return;

            double current = GetBalance(type);
            double newBalance = current + amount;

            // 코인 최대값 제한
            if (type == CurrencyType.Coin)
                newBalance = Math.Min(newBalance, GameConstants.MaxCoinCap);

            _balances[type] = newBalance;
            FlushToSave(type);
            OnCurrencyChanged?.Invoke(type, newBalance);
        }

        // ── 지출 ───────────────────────────────────────────────────────────

        /// <summary>통화를 차감합니다. 잔액 부족 시 false 반환.</summary>
        public bool SpendCurrency(CurrencyType type, double amount)
        {
            if (amount <= 0) return true;
            if (!CanAfford(type, amount))
            {
                OnCurrencyInsufficient?.Invoke(type, amount);
                Debug.LogWarning($"[EconomyManager] {type} 잔액 부족. 필요: {amount}, 보유: {GetBalance(type)}");
                return false;
            }
            _balances[type] -= amount;
            FlushToSave(type);
            OnCurrencyChanged?.Invoke(type, _balances[type]);
            return true;
        }

        // ── 프레스티지 리셋 ────────────────────────────────────────────────

        /// <summary>프레스티지 리셋 시 코인 초기화 (스타, 젬 등 프리미엄 통화는 유지)</summary>
        public void PrestigeReset()
        {
            _balances[CurrencyType.Coin] = 0;
            _balances[CurrencyType.DeliveryBadge] = 0;
            _balances[CurrencyType.SnackToken] = 0;
            _balances[CurrencyType.UpgradeParts] = 0;
            _balances[CurrencyType.EventMedal] = 0;

            foreach (CurrencyType type in Enum.GetValues(typeof(CurrencyType)))
                OnCurrencyChanged?.Invoke(type, _balances[type]);

            _saveManager?.MarkDirty();
        }

        // ── 저장 동기화 ────────────────────────────────────────────────────

        private void FlushToSave(CurrencyType type)
        {
            var save = _saveManager?.CurrentSave;
            if (save == null) return;

            switch (type)
            {
                case CurrencyType.Coin:          save.currencies.coins         = _balances[type]; break;
                case CurrencyType.Gem:           save.currencies.gems          = (int)_balances[type]; break;
                case CurrencyType.DeliveryBadge: save.currencies.deliveryBadges = (int)_balances[type]; break;
                case CurrencyType.SnackToken:    save.currencies.snackTokens   = (int)_balances[type]; break;
                case CurrencyType.UpgradeParts:  save.currencies.upgradeParts  = (int)_balances[type]; break;
                case CurrencyType.EventMedal:    save.currencies.eventMedals   = (int)_balances[type]; break;
                case CurrencyType.PrestigeStar:  save.prestigeStars            = (int)_balances[type]; break;
            }
            _saveManager?.MarkDirty();
        }
    }
}
