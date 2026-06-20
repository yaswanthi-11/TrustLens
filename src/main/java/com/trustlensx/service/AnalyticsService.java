package com.trustlensx.service;

import com.trustlensx.dto.AnalyticsDTO;

public interface AnalyticsService {
    AnalyticsDTO getAnalyticsStats(String username);
}
