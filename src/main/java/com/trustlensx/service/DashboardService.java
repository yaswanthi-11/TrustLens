package com.trustlensx.service;

import com.trustlensx.dto.DashboardDTO;

public interface DashboardService {
    DashboardDTO getDashboardStats(String username);
}
