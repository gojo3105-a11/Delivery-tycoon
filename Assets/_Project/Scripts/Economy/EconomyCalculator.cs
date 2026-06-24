// Assets/_Project/Scripts/Economy/EconomyCalculator.cs
// 모든 경제 수치 계산 공식 모음 (순수 계산 유틸리티)

using System;
using UnityEngine;
using HedgehogDeliveryTycoon.Core;
using HedgehogDeliveryTycoon.Data;

namespace HedgehogDeliveryTycoon.Economy
{
    /// <summary>
    /// 게임 내 모든 경제 계산을 담당하는 정적 유틸리티 클래스.
    /// MonoBehaviour가 아니므로 어디서든 호출 가능합니다.
    ///
    /// 수식 문서: docs/ECONOMY.md 참조
    /// </summary>
    public static class EconomyCalculator
    {
        // ── 1. 시설 업그레이드 비용 ────────────────────────────────────────
        /// <summary>
        /// 시설 현재 레벨에서의 다음 업그레이드 비용.
        /// cost = baseCost * pow(costGrowthRate, currentLevel)
        /// </summary>
        public static double CalculateFacilityUpgradeCost(FacilityData data, int currentLevel)
        {
            if (data == null) return double.MaxValue;
            return data.baseCost * Math.Pow(data.costGrowthRate, currentLevel);
        }

        /// <summary>currentLevel → targetLevel 까지의 총 업그레이드 비용</summary>
        public static double CalculateFacilityTotalCost(FacilityData data, int currentLevel, int targetLevel)
        {
            if (data == null || targetLevel <= currentLevel) return 0;
            double total = 0;
            for (int i = currentLevel; i < targetLevel; i++)
                total += CalculateFacilityUpgradeCost(data, i);
            return total;
        }

        // ── 2. 시설 수익 ──────────────────────────────────────────────────
        /// <summary>
        /// 특정 레벨에서 시설의 초당 수익 기여도.
        /// revenue = baseRevenue * pow(revenueGrowthRate, level - 1)
        /// </summary>
        public static double CalculateFacilityRevenue(FacilityData data, int level)
        {
            if (data == null || level <= 0) return 0;
            return data.baseRevenue * Math.Pow(data.revenueGrowthRate, level - 1);
        }

        // ── 3. 택배원 효율 ─────────────────────────────────────────────────
        /// <summary>
        /// 택배원의 종합 배달 효율.
        /// efficiency = baseSpeed * rarityMultiplier * levelMultiplier * vehicleBonus
        /// </summary>
        public static float CalculateCourierEfficiency(
            float baseSpeed,
            float rarityMultiplier,
            int characterLevel,
            float levelGrowthRate,
            float vehicleSpeedBonus)
        {
            float levelMultiplier = Mathf.Pow(levelGrowthRate, characterLevel - 1);
            return baseSpeed * rarityMultiplier * levelMultiplier * vehicleSpeedBonus;
        }

        // ── 4. 배달 수익 ──────────────────────────────────────────────────
        /// <summary>
        /// 단일 배달 완료 시 수익.
        /// revenue = baseOrderValue * zoneMultiplier * facilityMultiplier * courierBonus * prestigeMultiplier
        /// </summary>
        public static double CalculateDeliveryRevenue(
            double baseOrderValue,
            float zoneMultiplier,
            float facilityMultiplier,
            float courierRevenueBonus,
            float prestigeMultiplier)
        {
            return baseOrderValue
                   * zoneMultiplier
                   * facilityMultiplier
                   * courierRevenueBonus
                   * prestigeMultiplier;
        }

        // ── 5. 오프라인 보상 ──────────────────────────────────────────────
        /// <summary>
        /// 오프라인 동안 누적된 수익 계산.
        /// offlineReward = avgRevenuePerSecond * min(offlineSeconds, maxHours*3600) * efficiencyRate
        /// </summary>
        public static double CalculateOfflineReward(
            double averageRevenuePerSecond,
            float offlineSeconds,
            float offlineMaxHours,
            float offlineEfficiencyRate)
        {
            float cappedSeconds = Mathf.Min(offlineSeconds, offlineMaxHours * 3600f);
            return averageRevenuePerSecond * cappedSeconds * offlineEfficiencyRate;
        }

        // ── 6. 광고 보상 배율 적용 ────────────────────────────────────────
        /// <summary>
        /// 보상형 광고 시청 후 최종 보상.
        /// finalReward = baseReward * rewardedAdMultiplier
        /// </summary>
        public static double ApplyAdMultiplier(double baseReward, float multiplier)
        {
            return baseReward * multiplier;
        }

        // ── 7. 현재 초당 평균 수익 계산 ──────────────────────────────────
        /// <summary>
        /// 모든 시설과 배치된 택배원을 기반으로 초당 평균 수익 추정.
        /// UI 표시용 및 오프라인 보상 계산에 사용됩니다.
        /// </summary>
        public static double EstimateRevenuePerSecond(
            double totalFacilityRevenue,
            int deployedCourierCount,
            float avgCourierEfficiency,
            float prestigeMultiplier)
        {
            // 시설 수익 + 택배원 기여분 (택배원이 없으면 시설 수익만)
            double courierContribution = deployedCourierCount > 0
                ? totalFacilityRevenue * (avgCourierEfficiency * 0.1f)
                : 0;
            return (totalFacilityRevenue + courierContribution) * prestigeMultiplier;
        }

        // ── 8. 구역 해금 비용 (구역 인덱스 기반) ──────────────────────────
        public static double CalculateZoneUnlockCost(int zoneIndex, double baseZoneCost, float growthRate)
        {
            return baseZoneCost * Math.Pow(growthRate, zoneIndex);
        }

        // ── 9. 보유 코인으로 최대 몇 레벨 업그레이드 가능한지 계산 ────────
        public static int CalculateMaxAffordableUpgrades(FacilityData data, int currentLevel, double availableCoins)
        {
            double remaining = availableCoins;
            int levels = 0;
            int lv = currentLevel;
            while (lv < data.maxLevel)
            {
                double cost = CalculateFacilityUpgradeCost(data, lv);
                if (remaining < cost) break;
                remaining -= cost;
                lv++;
                levels++;
            }
            return levels;
        }
    }
}
