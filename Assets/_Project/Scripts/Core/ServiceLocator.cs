// Assets/_Project/Scripts/Core/ServiceLocator.cs
// 전역 서비스 레지스트리. 매니저 간 의존성 주입 없이 접근 가능하게 합니다.

using System;
using System.Collections.Generic;
using UnityEngine;

namespace HedgehogDeliveryTycoon.Core
{
    /// <summary>
    /// 게임 내 모든 매니저 서비스를 등록하고 검색하는 싱글턴 레지스트리.
    /// DI 컨테이너 없이 간단한 서비스 접근 패턴을 제공합니다.
    /// </summary>
    public class ServiceLocator : MonoBehaviour
    {
        public static ServiceLocator Instance { get; private set; }

        private readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        /// <summary>서비스를 레지스트리에 등록합니다.</summary>
        public static void Register<T>(T service) where T : class
        {
            if (Instance == null)
            {
                Debug.LogError("[ServiceLocator] Instance가 초기화되지 않았습니다.");
                return;
            }
            var type = typeof(T);
            if (Instance._services.ContainsKey(type))
            {
                Debug.LogWarning($"[ServiceLocator] {type.Name} 이미 등록됨. 덮어쓰기.");
            }
            Instance._services[type] = service;
            Debug.Log($"[ServiceLocator] {type.Name} 등록 완료");
        }

        /// <summary>등록된 서비스를 반환합니다. 없으면 null 반환.</summary>
        public static T Get<T>() where T : class
        {
            if (Instance == null) return null;
            var type = typeof(T);
            if (Instance._services.TryGetValue(type, out var service))
                return service as T;

            Debug.LogWarning($"[ServiceLocator] {type.Name} 서비스를 찾을 수 없습니다.");
            return null;
        }

        /// <summary>등록된 서비스를 제거합니다.</summary>
        public static void Unregister<T>() where T : class
        {
            Instance?._services.Remove(typeof(T));
        }

        /// <summary>모든 서비스 등록 해제 (테스트용).</summary>
        public static void ClearAll()
        {
            Instance?._services.Clear();
        }
    }
}
