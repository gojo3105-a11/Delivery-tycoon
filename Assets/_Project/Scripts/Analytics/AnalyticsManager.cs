// Assets/_Project/Scripts/Analytics/AnalyticsManager.cs
// Firebase Analytics 이벤트 전송 매니저

using System;
using System.Collections.Generic;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;

namespace HedgehogDeliveryTycoon.Analytics
{
    /// <summary>
    /// Firebase Analytics 이벤트를 전송하는 매니저.
    /// 단일 진입점을 통해 모든 분석 이벤트를 추상화합니다.
    /// Firebase SDK가 없는 환경에서는 로컬 로그만 출력합니다.
    /// </summary>
    public class AnalyticsManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        [Header("디버그 설정")]
        [SerializeField] private bool logEventsInEditor = true;
        [SerializeField] private bool disableInEditor   = false;

        private bool _firebaseReady = false;
        private string _playerId    = "";

        private void Awake()
        {
            ServiceLocator.Register<AnalyticsManager>(this);
        }

        public void Initialize()
        {
            var save = ServiceLocator.Get<Save.SaveManager>()?.CurrentSave;
            _playerId = save?.playerId ?? "";

            // TODO: Firebase 초기화 확인
            // Firebase.FirebaseApp.CheckAndFixDependenciesAsync().ContinueWithOnMainThread(task => {
            //     if (task.Result == Firebase.DependencyStatus.Available) {
            //         _firebaseReady = true;
            //         Firebase.Analytics.FirebaseAnalytics.SetUserId(_playerId);
            //     }
            // });

            IsInitialized = true;
            Debug.Log("[AnalyticsManager] 초기화 완료 (TODO: Firebase SDK 연동)");
        }

        /// <summary>
        /// Firebase Analytics 이벤트 전송.
        /// params에는 (key, value) 튜플 배열을 전달합니다.
        /// </summary>
        public void LogEvent(string eventName, params (string key, string value)[] parameters)
        {
#if UNITY_EDITOR
            if (disableInEditor) return;
            if (logEventsInEditor)
            {
                var paramStr = parameters.Length > 0
                    ? " [" + string.Join(", ", System.Array.ConvertAll(parameters, p => $"{p.key}={p.value}")) + "]"
                    : "";
                Debug.Log($"[Analytics] {eventName}{paramStr}");
            }
#endif

            if (!_firebaseReady) return;

            // TODO: Firebase Analytics 이벤트 전송
            // var paramList = new List<Firebase.Analytics.Parameter>();
            // paramList.Add(new Firebase.Analytics.Parameter("player_id", _playerId));
            // foreach (var (key, value) in parameters)
            //     paramList.Add(new Firebase.Analytics.Parameter(key, value));
            // Firebase.Analytics.FirebaseAnalytics.LogEvent(eventName, paramList.ToArray());
        }

        /// <summary>사용자 속성 설정 (코호트 분석용)</summary>
        public void SetUserProperty(string key, string value)
        {
            if (!_firebaseReady) return;
            // TODO: Firebase.Analytics.FirebaseAnalytics.SetUserProperty(key, value);
        }

        /// <summary>구매 이벤트 (Firebase 표준 purchase 이벤트 사용)</summary>
        public void LogPurchase(string productId, double value, string currency = "KRW")
        {
            LogEvent(AnalyticsEventName.IAPPurchaseComplete,
                ("product_id", productId),
                ("value", value.ToString("F2")),
                ("currency", currency));

            // TODO: Firebase.Analytics.FirebaseAnalytics.LogEvent(
            //     Firebase.Analytics.FirebaseAnalytics.EventPurchase,
            //     new Firebase.Analytics.Parameter(Firebase.Analytics.FirebaseAnalytics.ParameterItemId, productId),
            //     new Firebase.Analytics.Parameter(Firebase.Analytics.FirebaseAnalytics.ParameterValue, value),
            //     new Firebase.Analytics.Parameter(Firebase.Analytics.FirebaseAnalytics.ParameterCurrency, currency));
        }
    }
}
