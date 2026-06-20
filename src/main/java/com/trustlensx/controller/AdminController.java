package com.trustlensx.controller;

import com.trustlensx.dto.ScanResponseDTO;
import com.trustlensx.entity.ScanReason;
import com.trustlensx.entity.UrlScan;
import com.trustlensx.repository.UrlScanRepository;
import com.trustlensx.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UrlScanRepository urlScanRepository;
    private final ScanService scanService;

    @GetMapping("/scans")
    public ResponseEntity<List<ScanResponseDTO>> searchScans(
            @RequestParam(required = false) String query
    ) {
        List<UrlScan> scans;
        if (query != null && !query.trim().isEmpty()) {
            scans = urlScanRepository.searchScans(query.trim());
        } else {
            scans = urlScanRepository.findAllByOrderByScanDateDesc();
        }

        List<ScanResponseDTO> response = scans.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/scan/{id}")
    public ResponseEntity<Void> deleteScan(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        scanService.deleteScan(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    private ScanResponseDTO mapToResponseDTO(UrlScan scan) {
        List<String> reasons = scan.getReasons().stream()
                .map(ScanReason::getReason)
                .collect(Collectors.toList());

        return ScanResponseDTO.builder()
                .id(scan.getId())
                .url(scan.getUrl())
                .scanDate(scan.getScanDate())
                .riskScore(scan.getRiskScore())
                .threatLevel(scan.getThreatLevel())
                .cyberDna(scan.getCyberDna())
                .trustScore(scan.getTrustScore())
                .phishingProbability(scan.getPhishingProbability())
                .domainReputation(scan.getDomainReputation())
                .recommendations(scan.getRecommendations())
                .reasons(reasons)
                .virusTotalStatus(scan.getVirusTotalStatus())
                .virusTotalPositives(scan.getVirusTotalPositives())
                .virusTotalTotal(scan.getVirusTotalTotal())
                .build();
    }
}
