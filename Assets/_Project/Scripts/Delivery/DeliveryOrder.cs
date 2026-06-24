// Assets/_Project/Scripts/Delivery/DeliveryOrder.cs
// 배달 주문 데이터 모델

using System;

namespace HedgehogDeliveryTycoon.Delivery
{
    /// <summary>
    /// 단일 배달 주문의 런타임 데이터.
    /// DeliveryManager가 생성하고 관리합니다.
    /// </summary>
    public class DeliveryOrder
    {
        public string OrderId { get; }
        public string ZoneId  { get; }
        public double RewardCoins { get; }
        public float  DeliveryDurationSeconds { get; }

        public DeliveryOrderStatus Status { get; private set; }
        public string AssignedCourierInstanceId { get; private set; }

        public float StartTime   { get; private set; }
        public float CompleteTime => StartTime + DeliveryDurationSeconds;

        public DeliveryOrder(string zoneId, double rewardCoins, float durationSeconds)
        {
            OrderId               = Guid.NewGuid().ToString("N")[..8]; // 짧은 ID
            ZoneId                = zoneId;
            RewardCoins           = rewardCoins;
            DeliveryDurationSeconds = durationSeconds;
            Status                = DeliveryOrderStatus.Pending;
        }

        public void Assign(string courierInstanceId, float currentTime)
        {
            AssignedCourierInstanceId = courierInstanceId;
            StartTime = currentTime;
            Status    = DeliveryOrderStatus.InProgress;
        }

        public void Complete()
        {
            Status = DeliveryOrderStatus.Completed;
        }

        public void Cancel()
        {
            Status = DeliveryOrderStatus.Cancelled;
        }

        public float GetProgress(float currentTime)
        {
            if (Status != DeliveryOrderStatus.InProgress) return 0f;
            return UnityEngine.Mathf.Clamp01((currentTime - StartTime) / DeliveryDurationSeconds);
        }

        public override string ToString() =>
            $"[Order {OrderId}] Zone:{ZoneId} Reward:{RewardCoins:F0} Status:{Status}";
    }

    public enum DeliveryOrderStatus
    {
        Pending,     // 배차 대기
        InProgress,  // 배달 중
        Completed,   // 완료
        Cancelled,   // 취소
    }
}
