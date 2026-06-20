package com.trustlensx.service;

import com.trustlensx.service.impl.CyberDNAResult;

public interface CyberDNAService {
    CyberDNAResult generateCyberDNA(String url, int riskScore);
}
