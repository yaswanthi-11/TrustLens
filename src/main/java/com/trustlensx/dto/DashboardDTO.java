package com.trustlensx.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    private long totalScans;
    private long safeScans;
    private long lowRiskScans;
    private long suspiciousScans;
    private long dangerousScans;
}
