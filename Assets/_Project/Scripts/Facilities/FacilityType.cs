// Assets/_Project/Scripts/Facilities/FacilityType.cs
// 시설 종류 열거형

namespace HedgehogDeliveryTycoon.Facilities
{
    /// <summary>게임 내 모든 시설 종류를 정의합니다.</summary>
    public enum FacilityType
    {
        /// <summary>포장 테이블 - 포장 속도 향상 (기본 시설)</summary>
        PackingTable       = 0,

        /// <summary>배달 가방 스테이션 - 택배원 배달 용량 증가</summary>
        DeliveryBagStation = 1,

        /// <summary>분류 벨트 - 주문 처리 속도 및 정확도</summary>
        SortingBelt        = 2,

        /// <summary>스쿠터 도크 - 차량 속도 및 운행 수</summary>
        ScooterDock        = 3,

        /// <summary>배터리 충전기 - 전동 차량 충전 효율</summary>
        BatteryCharger     = 4,

        /// <summary>스낵 바 - 스낵 토큰 생산 및 택배원 버프</summary>
        SnackBar           = 5,

        /// <summary>배차 보드 - 자동 배차 효율</summary>
        DispatchBoard      = 6,

        /// <summary>자동 정산 데스크 - 수익 정산 속도 및 오프라인 시간</summary>
        AutoSettlementDesk = 7,

        /// <summary>라이더 라운지 - 택배원 효율 보너스</summary>
        RiderLounge        = 8,

        /// <summary>CEO 둥지 - 전체 수익 보너스</summary>
        CeoNest            = 9,

        /// <summary>배달 허브 메인 - 전체 허브 레벨 (메타 시설)</summary>
        DeliveryHub        = 10,
    }
}
