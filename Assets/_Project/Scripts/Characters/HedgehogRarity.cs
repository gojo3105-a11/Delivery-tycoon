// Assets/_Project/Scripts/Characters/HedgehogRarity.cs
// 고슴도치 캐릭터 희귀도 열거형

namespace HedgehogDeliveryTycoon.Characters
{
    /// <summary>
    /// 고슴도치 택배원의 희귀도 등급.
    /// int 값이 높을수록 강력합니다. GameConstants.RarityMultipliers와 인덱스가 일치합니다.
    /// </summary>
    public enum HedgehogRarity
    {
        /// <summary>일반 - 배율 ×1.0, 회색 테두리</summary>
        Common    = 0,

        /// <summary>희귀 - 배율 ×1.5, 파란 테두리</summary>
        Rare      = 1,

        /// <summary>에픽 - 배율 ×2.5, 보라 테두리</summary>
        Epic      = 2,

        /// <summary>전설 - 배율 ×4.0, 황금 테두리</summary>
        Legendary = 3,

        /// <summary>신화 - 배율 ×7.0, 무지개 테두리</summary>
        Mythic    = 4,
    }
}
