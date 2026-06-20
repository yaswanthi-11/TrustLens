package com.trustlensx.service;

import com.trustlensx.service.impl.RiskAnalysisResult;

public interface RiskScoreService {
    RiskAnalysisResult analyzeUrl(String url);
}
