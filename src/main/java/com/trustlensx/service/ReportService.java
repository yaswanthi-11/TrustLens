package com.trustlensx.service;

public interface ReportService {
    byte[] generateScanReportPdf(Long scanId, String username);
}
