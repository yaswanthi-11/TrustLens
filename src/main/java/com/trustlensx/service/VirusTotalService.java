package com.trustlensx.service;

import com.trustlensx.entity.UrlScan;

public interface VirusTotalService {
    void scanUrlAsync(UrlScan scan);
}
