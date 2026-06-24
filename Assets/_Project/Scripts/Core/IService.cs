// Assets/_Project/Scripts/Core/IService.cs
// 모든 매니저 서비스가 구현해야 하는 기본 인터페이스

namespace HedgehogDeliveryTycoon.Core
{
    /// <summary>
    /// ServiceLocator에 등록 가능한 서비스의 기본 인터페이스.
    /// 모든 매니저 클래스는 이 인터페이스를 구현합니다.
    /// </summary>
    public interface IService
    {
        /// <summary>매니저 초기화. BootScene 시작 시 순서대로 호출됩니다.</summary>
        void Initialize();

        /// <summary>매니저가 초기화 완료된 상태인지 여부.</summary>
        bool IsInitialized { get; }
    }
}
