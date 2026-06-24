// Assets/_Project/Scripts/Economy/CurrencyType.cs
// 게임 내 통화 종류 열거형

namespace HedgehogDeliveryTycoon.Economy
{
    /// <summary>게임 내 모든 통화 종류를 정의합니다.</summary>
    public enum CurrencyType
    {
        /// <summary>코인 - 주 통화, 시설 업그레이드 및 기본 채용에 사용</summary>
        Coin = 0,

        /// <summary>젬 - 프리미엄 통화, 프리미엄 채용 및 가속에 사용</summary>
        Gem = 1,

        /// <summary>배달 배지 - 마일스톤 통화, 특별 시설 해금에 사용</summary>
        DeliveryBadge = 2,

        /// <summary>스낵 토큰 - 스낵 바 업그레이드 및 버프 아이템에 사용</summary>
        SnackToken = 3,

        /// <summary>업그레이드 부품 - 희귀 재료, 고급 시설 업그레이드에 사용</summary>
        UpgradeParts = 4,

        /// <summary>캐릭터 조각 - 특정 캐릭터 합성에 사용</summary>
        CharacterShards = 5,

        /// <summary>이벤트 메달 - 이벤트 기간 한정 통화</summary>
        EventMedal = 6,

        /// <summary>프레스티지 스타 - 프레스티지 리셋 보상, 영구 배율 증가</summary>
        PrestigeStar = 7,
    }
}
