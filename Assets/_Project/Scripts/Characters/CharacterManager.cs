// Assets/_Project/Scripts/Characters/CharacterManager.cs
// 고슴도치 택배원 컬렉션 관리, 채용, 배치 매니저

using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Data;
using HedgehogDeliveryTycoon.Economy;
using HedgehogDeliveryTycoon.Save;

namespace HedgehogDeliveryTycoon.Characters
{
    /// <summary>
    /// 보유한 고슴도치 택배원의 생성, 관리, 배치를 처리하는 매니저.
    /// </summary>
    public class CharacterManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        // 런타임 캐릭터 컬렉션 (instanceId 기준)
        private Dictionary<string, HedgehogCharacter> _characters = new();

        public static event Action<HedgehogCharacter> OnCharacterRecruited;
        public static event Action<HedgehogCharacter> OnCharacterLevelUp;
        public static event Action<string, string> OnCharacterAssigned; // instanceId, zoneId

        private DataManager _dataManager;
        private EconomyManager _economyManager;
        private SaveManager _saveManager;

        private void Awake()
        {
            ServiceLocator.Register<CharacterManager>(this);
        }

        public void Initialize()
        {
            _dataManager    = ServiceLocator.Get<DataManager>();
            _economyManager = ServiceLocator.Get<EconomyManager>();
            _saveManager    = ServiceLocator.Get<SaveManager>();

            LoadCharactersFromSave();
            IsInitialized = true;
            Debug.Log($"[CharacterManager] 초기화 완료. 보유 캐릭터: {_characters.Count}");
        }

        private void LoadCharactersFromSave()
        {
            var save = _saveManager?.CurrentSave;
            if (save == null) return;

            foreach (var charSave in save.characters)
            {
                var data = _dataManager.GetHedgehogData(charSave.characterId);
                if (data == null)
                {
                    Debug.LogWarning($"[CharacterManager] 알 수 없는 캐릭터 ID: {charSave.characterId}");
                    continue;
                }
                var character = new HedgehogCharacter(data, charSave);
                _characters[charSave.instanceId] = character;
            }
        }

        // ── 채용 ───────────────────────────────────────────────────────────

        /// <summary>코인으로 일반 채용 (1회)</summary>
        public HedgehogCharacter BasicRecruit()
        {
            var config = _dataManager.GetEconomyConfig();
            if (!_economyManager.SpendCurrency(CurrencyType.Coin, config.basicRecruitCost))
                return null;

            var rarity = RollRarity(config, isBasic: true);
            return CreateAndAddCharacter(rarity);
        }

        /// <summary>젬으로 프리미엄 채용 (1회)</summary>
        public HedgehogCharacter PremiumRecruit()
        {
            var config = _dataManager.GetEconomyConfig();
            if (!_economyManager.SpendCurrency(CurrencyType.Gem, config.premiumRecruitGemCost))
                return null;

            var rarity = RollRarity(config, isBasic: false);
            return CreateAndAddCharacter(rarity);
        }

        /// <summary>젬으로 10연 채용 (희귀 이상 1개 보장)</summary>
        public List<HedgehogCharacter> PremiumRecruitX10()
        {
            var config = _dataManager.GetEconomyConfig();
            if (!_economyManager.SpendCurrency(CurrencyType.Gem, config.premiumRecruitX10GemCost))
                return null;

            var results = new List<HedgehogCharacter>();
            bool hasRareOrHigher = false;

            for (int i = 0; i < 10; i++)
            {
                var rarity = RollRarity(config, isBasic: false);
                if (rarity >= HedgehogRarity.Rare) hasRareOrHigher = true;
                results.Add(CreateAndAddCharacter(rarity));
            }

            // 희귀 이상 보장: 10연 중 하나도 없으면 마지막을 희귀로 교체
            if (!hasRareOrHigher)
            {
                var lastChar = results[9];
                _characters.Remove(lastChar.InstanceId);
                _saveManager?.CurrentSave?.characters.Remove(lastChar.SaveData);
                results[9] = CreateAndAddCharacter(HedgehogRarity.Rare);
            }

            return results;
        }

        private HedgehogCharacter CreateAndAddCharacter(HedgehogRarity rarity)
        {
            var candidates = _dataManager.GetAllHedgehogData()
                .Where(d => d.rarity == rarity && d.isBasicRecruitAvailable)
                .ToList();

            if (candidates.Count == 0)
            {
                Debug.LogWarning($"[CharacterManager] {rarity} 등급 캐릭터 데이터 없음");
                return null;
            }

            // 가중치 기반 랜덤 선택
            int totalWeight = candidates.Sum(d => d.premiumRecruitWeight);
            int roll = UnityEngine.Random.Range(0, totalWeight);
            int cumulative = 0;
            HedgehogData selected = candidates[0];
            foreach (var d in candidates)
            {
                cumulative += d.premiumRecruitWeight;
                if (roll < cumulative) { selected = d; break; }
            }

            var saveData = new CharacterSaveData
            {
                characterId = selected.id,
                instanceId  = Guid.NewGuid().ToString(),
                level       = 1,
            };
            var character = new HedgehogCharacter(selected, saveData);
            _characters[saveData.instanceId] = character;
            _saveManager?.CurrentSave?.characters.Add(saveData);
            _saveManager?.MarkDirty();

            _saveManager?.CurrentSave?.totalRecruitCount++;
            OnCharacterRecruited?.Invoke(character);
            ServiceLocator.Get<Analytics.AnalyticsManager>()
                ?.LogEvent(Analytics.AnalyticsEventName.CourierRecruit,
                    ("rarity", rarity.ToString()), ("character_id", selected.id));

            Debug.Log($"[CharacterManager] 채용: {character}");
            return character;
        }

        // ── 배치 ───────────────────────────────────────────────────────────

        public bool AssignToZone(string instanceId, string zoneId)
        {
            if (!_characters.TryGetValue(instanceId, out var character)) return false;
            character.AssignToZone(zoneId);
            _saveManager?.MarkDirty();
            OnCharacterAssigned?.Invoke(instanceId, zoneId);
            return true;
        }

        public void UnassignFromZone(string instanceId)
        {
            if (_characters.TryGetValue(instanceId, out var character))
            {
                character.UnassignFromZone();
                _saveManager?.MarkDirty();
            }
        }

        // ── 레벨업 ─────────────────────────────────────────────────────────

        public bool LevelUpCharacter(string instanceId, int shardsRequired)
        {
            if (!_characters.TryGetValue(instanceId, out var character)) return false;
            if (!_economyManager.SpendCurrency(CurrencyType.CharacterShards, shardsRequired)) return false;

            character.LevelUp();
            _saveManager?.MarkDirty();
            OnCharacterLevelUp?.Invoke(character);
            return true;
        }

        // ── 조회 ───────────────────────────────────────────────────────────

        public HedgehogCharacter GetCharacter(string instanceId)
        {
            _characters.TryGetValue(instanceId, out var c);
            return c;
        }

        public IEnumerable<HedgehogCharacter> GetAllCharacters() => _characters.Values;

        public IEnumerable<HedgehogCharacter> GetDeployedCouriers() =>
            _characters.Values.Where(c => c.IsDeployed);

        public IEnumerable<HedgehogCharacter> GetAvailableCouriers(string zoneId) =>
            _characters.Values.Where(c => c.IsDeployed
                                       && c.AssignedZoneId == zoneId
                                       && c.IsAvailable);

        // ── 희귀도 뽑기 ────────────────────────────────────────────────────

        private HedgehogRarity RollRarity(EconomyConfig config, bool isBasic)
        {
            float roll = UnityEngine.Random.value;

            // 일반 채용은 공통/희귀만
            if (isBasic)
                return roll < 0.85f ? HedgehogRarity.Common : HedgehogRarity.Rare;

            float cumulative = 0;
            cumulative += config.mythicRecruitRate;    if (roll < cumulative) return HedgehogRarity.Mythic;
            cumulative += config.legendaryRecruitRate; if (roll < cumulative) return HedgehogRarity.Legendary;
            cumulative += config.epicRecruitRate;      if (roll < cumulative) return HedgehogRarity.Epic;
            cumulative += config.rareRecruitRate;      if (roll < cumulative) return HedgehogRarity.Rare;
            return HedgehogRarity.Common;
        }
    }
}
