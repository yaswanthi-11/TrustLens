package com.trustlensx.dto;

import lombok.*;

import java.util.Map;

/**
 * Chart.js-compatible analytics payload.
 * Maps serialize to JSON objects: { "Safe": 12, "Dangerous": 3 }
 * Frontend uses Object.keys() / Object.values() for chart labels and datasets.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDTO {

    private Map<String, Long> riskDistribution;
    private Map<String, Long> dailyTrends;
    private Map<String, Long> monthlyTrends;
    private Map<String, Long> threatCategoryBreakdown;
}
