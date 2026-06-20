package com.trustlensx.service;

import com.trustlensx.dto.ScanRequestDTO;
import com.trustlensx.dto.ScanResponseDTO;
import java.util.List;

public interface ScanService {
    ScanResponseDTO scanUrl(ScanRequestDTO request, String username);
    List<ScanResponseDTO> getScanHistory(String username);
    ScanResponseDTO getScanById(Long id, String username);
    void deleteScan(Long id, String username);
}
