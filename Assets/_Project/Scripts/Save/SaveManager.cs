// Assets/_Project/Scripts/Save/SaveManager.cs
// 로컬 JSON 저장/불러오기 매니저 (AES 암호화 포함)

using System;
using System.Collections;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;

namespace HedgehogDeliveryTycoon.Save
{
    /// <summary>
    /// 게임 저장 데이터를 JSON으로 직렬화하여 로컬 파일에 저장/로드합니다.
    /// AES-128 암호화로 기본적인 치트 방지를 제공합니다.
    /// </summary>
    public class SaveManager : MonoBehaviour, IService
    {
        public bool IsInitialized { get; private set; }

        public SaveData CurrentSave { get; private set; }

        private string _savePath;
        private bool _isDirty = false;
        private float _autoSaveTimer = 0f;

        // AES 암호화 키 (실 프로덕션에서는 디바이스 ID 조합으로 동적 생성)
        private const string EncryptionKey = "HDT_S3cur3K3y128!";
        private const string EncryptionIV  = "HDT_IV_16Bytes!!";

        public static event Action<SaveData> OnSaveLoaded;
        public static event Action OnSaved;

        private void Awake()
        {
            _savePath = Path.Combine(Application.persistentDataPath, GameConstants.SaveFileName);
            ServiceLocator.Register<SaveManager>(this);
        }

        public void Initialize()
        {
            // LoadAsync()를 통해 초기화. 동기 버전이 필요하면 아래 Load() 사용.
            IsInitialized = true;
        }

        #region Load

        public IEnumerator LoadAsync()
        {
            CurrentSave = LoadFromFile();
            if (CurrentSave == null)
            {
                CurrentSave = CreateNewSave();
                Debug.Log("[SaveManager] 새 저장 파일 생성");
            }
            else
            {
                MigrateSave(CurrentSave);
            }
            IsInitialized = true;
            OnSaveLoaded?.Invoke(CurrentSave);
            yield return null;
        }

        private SaveData LoadFromFile()
        {
            if (!File.Exists(_savePath)) return null;

            try
            {
                string encryptedText = File.ReadAllText(_savePath);
                string json = Decrypt(encryptedText);
                var saveData = JsonUtility.FromJson<SaveData>(json);
                Debug.Log($"[SaveManager] 저장 파일 로드 성공. 버전: {saveData.saveVersion}");
                return saveData;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveManager] 저장 파일 로드 실패: {e.Message}");
                return null;
            }
        }

        private SaveData CreateNewSave()
        {
            var save = new SaveData
            {
                playerId = Guid.NewGuid().ToString(),
                createdAtUtc = DateTime.UtcNow.ToString("O"),
                lastLoginUtc = DateTime.UtcNow.ToString("O"),
            };
            // 기본 구역 해금
            save.unlockedZoneIds.Add("zone_000_alley");
            return save;
        }

        #endregion

        #region Save

        public void SaveImmediate()
        {
            if (CurrentSave == null) return;
            try
            {
                CurrentSave.lastLoginUtc = DateTime.UtcNow.ToString("O");
                string json = JsonUtility.ToJson(CurrentSave, prettyPrint: false);
                string encrypted = Encrypt(json);
                File.WriteAllText(_savePath, encrypted);
                _isDirty = false;
                OnSaved?.Invoke();
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveManager] 저장 실패: {e.Message}");
            }
        }

        /// <summary>마지막 로그인 시간만 즉시 저장 (앱 종료/일시정지 시 호출)</summary>
        public void SaveLastLoginTime()
        {
            if (CurrentSave == null) return;
            CurrentSave.lastLoginUtc = DateTime.UtcNow.ToString("O");
            _isDirty = true;
        }

        public void MarkDirty() => _isDirty = true;

        private void Update()
        {
            if (!IsInitialized || !_isDirty) return;
            _autoSaveTimer += Time.deltaTime;
            if (_autoSaveTimer >= GameConstants.AutoSaveIntervalSeconds)
            {
                SaveImmediate();
                _autoSaveTimer = 0f;
            }
        }

        #endregion

        #region Migration

        /// <summary>저장 버전에 따라 데이터 마이그레이션을 수행합니다.</summary>
        private void MigrateSave(SaveData save)
        {
            if (save.saveVersion == GameConstants.SaveVersion) return;

            Debug.Log($"[SaveManager] 저장 버전 마이그레이션: {save.saveVersion} → {GameConstants.SaveVersion}");

            // TODO: 버전별 마이그레이션 코드 추가
            // if (save.saveVersion < 2) MigrateV1toV2(save);
            // if (save.saveVersion < 3) MigrateV2toV3(save);

            save.saveVersion = GameConstants.SaveVersion;
            SaveImmediate();
        }

        #endregion

        #region Encryption

        private string Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey);
            aes.IV = Encoding.UTF8.GetBytes(EncryptionIV);
            var encryptor = aes.CreateEncryptor();
            byte[] inputBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] encryptedBytes = encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);
            return Convert.ToBase64String(encryptedBytes);
        }

        private string Decrypt(string cipherText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey);
            aes.IV = Encoding.UTF8.GetBytes(EncryptionIV);
            var decryptor = aes.CreateDecryptor();
            byte[] inputBytes = Convert.FromBase64String(cipherText);
            byte[] decryptedBytes = decryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);
            return Encoding.UTF8.GetString(decryptedBytes);
        }

        #endregion

        #region Debug / Test

        [System.Diagnostics.Conditional("UNITY_EDITOR")]
        public void DeleteSave()
        {
            if (File.Exists(_savePath))
            {
                File.Delete(_savePath);
                Debug.Log("[SaveManager] 저장 파일 삭제 완료 (개발용)");
            }
            CurrentSave = CreateNewSave();
        }

        #endregion
    }
}
