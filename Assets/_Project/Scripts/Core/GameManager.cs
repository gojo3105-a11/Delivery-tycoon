// Assets/_Project/Scripts/Core/GameManager.cs
// 게임 전체 상태 관리, 씬 전환, 앱 생명주기 처리를 담당하는 최상위 매니저

using System;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace HedgehogDeliveryTycoon.Core
{
    /// <summary>
    /// 게임 전체 생명주기를 관리하는 싱글턴 매니저.
    /// BootScene에서 최초 생성 후 DontDestroyOnLoad로 유지됩니다.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("씬 이름 설정")]
        [SerializeField] private string bootSceneName = "BootScene";
        [SerializeField] private string loadingSceneName = "LoadingScene";
        [SerializeField] private string mainSceneName = "MainGameScene";

        [Header("초기화 상태")]
        [SerializeField] private bool isInitialized = false;

        public static event Action OnGameInitialized;
        public static event Action OnApplicationPaused;
        public static event Action OnApplicationResumed;

        private bool _isPaused = false;
        private float _sessionStartTime;

        #region Unity Lifecycle

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            _sessionStartTime = Time.realtimeSinceStartup;
        }

        private void Start()
        {
            StartCoroutine(InitializeGameCoroutine());
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            _isPaused = pauseStatus;
            if (pauseStatus)
            {
                HandleGamePause();
                OnApplicationPaused?.Invoke();
            }
            else
            {
                HandleGameResume();
                OnApplicationResumed?.Invoke();
            }
        }

        private void OnApplicationQuit()
        {
            HandleGamePause();
        }

        #endregion

        #region Initialization

        /// <summary>
        /// 게임 초기화 코루틴. 각 매니저를 순서대로 초기화합니다.
        /// </summary>
        private IEnumerator InitializeGameCoroutine()
        {
            Debug.Log("[GameManager] 게임 초기화 시작");

            // 1. DataManager 초기화
            var dataManager = ServiceLocator.Get<Data.DataManager>();
            dataManager?.Initialize();
            yield return null;

            // 2. SaveManager 로드
            var saveManager = ServiceLocator.Get<Save.SaveManager>();
            yield return saveManager?.LoadAsync();

            // 3. EconomyManager 초기화
            var economyManager = ServiceLocator.Get<Economy.EconomyManager>();
            economyManager?.Initialize();
            yield return null;

            // 4. FacilityManager 초기화
            var facilityManager = ServiceLocator.Get<Facilities.FacilityManager>();
            facilityManager?.Initialize();
            yield return null;

            // 5. CharacterManager 초기화
            var characterManager = ServiceLocator.Get<Characters.CharacterManager>();
            characterManager?.Initialize();
            yield return null;

            // 6. DeliveryManager 시작
            var deliveryManager = ServiceLocator.Get<Delivery.DeliveryManager>();
            deliveryManager?.StartOrderGeneration();
            yield return null;

            // 7. 오프라인 보상 계산
            var offlineManager = ServiceLocator.Get<Offline.OfflineRewardManager>();
            offlineManager?.CalculateOfflineReward();
            yield return null;

            // TODO: Firebase 초기화 (비동기)
            // yield return FirebaseApp.CheckAndFixDependenciesAsync();

            isInitialized = true;
            Debug.Log("[GameManager] 게임 초기화 완료");
            OnGameInitialized?.Invoke();

            // Analytics 세션 시작 이벤트
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.SessionStart);

            // LoadingScene → MainScene 전환
            yield return LoadSceneAsync(mainSceneName);
        }

        #endregion

        #region Scene Management

        public void LoadScene(string sceneName)
        {
            StartCoroutine(LoadSceneAsync(sceneName));
        }

        private IEnumerator LoadSceneAsync(string sceneName)
        {
            AsyncOperation op = SceneManager.LoadSceneAsync(sceneName);
            if (op == null) yield break;

            op.allowSceneActivation = false;
            while (op.progress < 0.9f)
                yield return null;

            op.allowSceneActivation = true;
            yield return op;
        }

        #endregion

        #region Pause / Resume

        private void HandleGamePause()
        {
            if (!isInitialized) return;

            // 종료 시간 저장 (오프라인 보상 계산용)
            ServiceLocator.Get<Save.SaveManager>()?.SaveLastLoginTime();
            ServiceLocator.Get<Save.SaveManager>()?.SaveImmediate();
            // TODO: 로컬 푸시 알림 스케줄
            // ServiceLocator.Get<NotificationManager>()?.ScheduleOfflineRewardNotification();

            Debug.Log("[GameManager] 앱 일시정지 - 저장 완료");
        }

        private void HandleGameResume()
        {
            if (!isInitialized) return;

            // 오프라인 보상 재계산
            ServiceLocator.Get<Offline.OfflineRewardManager>()?.CalculateOfflineReward();
            Debug.Log("[GameManager] 앱 재개 - 오프라인 보상 재계산");
        }

        #endregion

        #region Utilities

        public float GetSessionDuration() => Time.realtimeSinceStartup - _sessionStartTime;
        public bool IsInitialized => isInitialized;

        #endregion
    }
}
