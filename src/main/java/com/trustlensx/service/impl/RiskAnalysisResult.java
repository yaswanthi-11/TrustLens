package com.trustlensx.service.impl;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAnalysisResult {
    private int riskScore;
    private String threatLevel;
    private List<String> reasons;
    private String recommendation;
}
