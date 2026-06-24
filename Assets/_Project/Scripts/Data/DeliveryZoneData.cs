// Assets/_Project/Scripts/Data/DeliveryZoneData.cs
// 배달 구역 정적 데이터 ScriptableObject

using UnityEngine;
using UnityEngine.AddressableAssets;

namespace HedgehogDeliveryTycoon.Data
{
    /// <summary>
    /// 배달 구역(Zone) 1개의 정적 데이터.
    /// Assets/_Project/ScriptableObjects/Events/ 또는 별도 폴더에 저장합니다.
    /// </summary>
    [CreateAssetMenu(fileName = "Zone_", menuName = "HDT/Zone/Delivery Zone Data")]
    public class DeliveryZoneData : ScriptableObject
    {
        [Header("기본 정보")]
        public string id;
        public string displayName;

        [TextArea(2, 3)]
        public string description;

        [Tooltip("구역 번호 (0부터 시작, 낮을수록 초반)")]
        public int zoneIndex = 0;

        [Header("잠금 해제 조건")]
        [Tooltip("해금에 필요한 코인")]
        public double unlockCoinCost = 0;

        [Tooltip("해금에 필요한 이전 구역 수익 달성량")]
        public double requiredPreviousZoneRevenue = 0;

        [Tooltip("해금에 필요한 허브 레벨")]
        public int requiredHubLevel = 1;

        [Header("수익 설정")]
        [Tooltip("구역 수익 배율 (기준 주문 가치에 곱해짐)")]
        [Range(1f, 100f)]
        public float zoneRevenueMultiplier = 1.0f;

        [Tooltip("구역 내 최대 동시 배달 주문 수")]
        [Range(1, 20)]
        public int maxConcurrentOrders = 3;

        [Tooltip("구역 주문 생성 간격 배율 (낮을수록 빠른 주문 생성)")]
        [Range(0.1f, 2f)]
        public float orderIntervalMultiplier = 1.0f;

        [Header("이벤트 구역 설정")]
        [Tooltip("이벤트 한정 구역 여부")]
        public bool isEventZone = false;

        [Tooltip("이벤트 구역 활성화 기간 (초, 0 = 영구)")]
        public float eventDurationSeconds = 0;

        [Header("에셋 참조")]
        public Sprite zoneMapIcon;
        public Sprite zoneBackgroundSprite;
        public AssetReferenceGameObject zonePrefabReference;

        [Header("사운드")]
        [Tooltip("구역 배경음악 클립 이름")]
        public string bgmClipName;

        /// <summary>이 구역에서 단일 배달의 기대 수익 계산 (기준값 × 구역 배율)</summary>
        public double CalculateExpectedRevenue(double baseOrderValue)
        {
            return baseOrderValue * zoneRevenueMultiplier;
        }
    }
}
