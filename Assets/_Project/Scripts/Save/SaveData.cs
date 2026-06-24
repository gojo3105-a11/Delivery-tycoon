// Assets/_Project/Scripts/Save/SaveData.cs
// 전체 저장 데이터 루트 모델 (JSON 직렬화 대상)

using System;
using System.Collections.Generic;

namespace HedgehogDeliveryTycoon.Save
{
    /// <summary>
    /// 게임 전체 저장 데이터의 루트 객체.
    /// SaveManager가 JSON으로 직렬화하여 로컬 파일에 저장합니다.
    /// </summary>
    [Serializable]
    public class SaveData
    {
        // ── 메타 ──────────────────────────────────────────────────────────
        public int saveVersion = Core.GameConstants.SaveVersion;
        public string playerId = "";
        public string createdAtUtc = "";
        public string lastLoginUtc = "";
        public float totalPlayTimeSeconds = 0f;

        // ── 진행 데이터 ───────────────────────────────────────────────────
        public CurrencySaveData currencies = new();
        public List<FacilitySaveData> facilities = new();
        public List<CharacterSaveData> characters = new();
        public List<VehicleSaveData> vehicles = new();
        public List<string> unlockedZoneIds = new();

        // ── 메타 진행 ─────────────────────────────────────────────────────
        public int prestigeLevel = 0;
        public int prestigeStars = 0;

        // ── 튜토리얼 ──────────────────────────────────────────────────────
        public int tutorialStep = 0;
        public bool tutorialCompleted = false;

        // ── 설정 ──────────────────────────────────────────────────────────
        public PlayerSettingsSaveData settings = new();

        // ── 통계 (분석용) ─────────────────────────────────────────────────
        public long totalDeliveryCount = 0;
        public long totalUpgradeCount = 0;
        public long totalRecruitCount = 0;
        public int totalAdsWatched = 0;
    }

    /// <summary>통화 저장 데이터</summary>
    [Serializable]
    public class CurrencySaveData
    {
        public double coins = 0;
        public int gems = 0;
        public int deliveryBadges = 0;
        public int snackTokens = 0;
        public int upgradeParts = 0;
        public int eventMedals = 0;
    }

    /// <summary>시설 인스턴스 저장 데이터</summary>
    [Serializable]
    public class FacilitySaveData
    {
        public string facilityId = "";
        public int level = 0;
        public bool isUnlocked = false;
        public double totalRevenueGenerated = 0;
    }

    /// <summary>고슴도치 캐릭터 저장 데이터</summary>
    [Serializable]
    public class CharacterSaveData
    {
        public string characterId = "";       // HedgehogData.id
        public string instanceId = "";        // 같은 캐릭터 여러 보유 시 구별용 GUID
        public int level = 1;
        public int shardsOwned = 0;
        public string assignedZoneId = "";    // 배치된 구역 ID
        public string equippedVehicleId = ""; // 장착한 차량 ID
        public bool isFavorite = false;
    }

    /// <summary>차량 저장 데이터</summary>
    [Serializable]
    public class VehicleSaveData
    {
        public string vehicleId = "";
        public bool isUnlocked = false;
        public int enhanceLevel = 0;
        public string equippedSkinId = "";
    }

    /// <summary>플레이어 설정 저장 데이터</summary>
    [Serializable]
    public class PlayerSettingsSaveData
    {
        public bool bgmEnabled = true;
        public bool sfxEnabled = true;
        public float bgmVolume = 1.0f;
        public float sfxVolume = 1.0f;
        public bool notificationsEnabled = true;
        public string language = "ko";
        public bool noAdsOwned = false;
        public bool vipOwned = false;
        public bool monthlyPassActive = false;
    }
}
