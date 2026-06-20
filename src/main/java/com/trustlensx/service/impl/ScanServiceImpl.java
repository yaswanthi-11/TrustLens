package com.trustlensx.service.impl;

import com.trustlensx.dto.ScanRequestDTO;
import com.trustlensx.dto.ScanResponseDTO;
import com.trustlensx.entity.ScanReason;
import com.trustlensx.entity.UrlScan;
import com.trustlensx.entity.User;
import com.trustlensx.repository.UrlScanRepository;
import com.trustlensx.repository.UserRepository;
import com.trustlensx.service.CyberDNAService;
import com.trustlensx.service.EmailService;
import com.trustlensx.service.RiskScoreService;
import com.trustlensx.service.ScanService;
import com.trustlensx.service.VirusTotalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final UrlScanRepository urlScanRepository;
    private final UserRepository userRepository;
    private final RiskScoreService riskScoreService;
    private final CyberDNAService cyberDNAService;
    private final VirusTotalService virusTotalService;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ScanResponseDTO scanUrl(ScanRequestDTO request, String username) {
        String rawUrl = request.getUrl().trim();
        if (rawUrl.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL cannot be empty");
        }

        // Heuristic analysis
        RiskAnalysisResult analysisResult = riskScoreService.analyzeUrl(rawUrl);
        
        // CyberDNA fingerprinting
        CyberDNAResult dnaResult = cyberDNAService.generateCyberDNA(rawUrl, analysisResult.getRiskScore());

        User user = null;
        if (username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        // Build entity
        UrlScan scan = UrlScan.builder()
                .url(rawUrl)
                .scanDate(LocalDateTime.now())
                .riskScore(analysisResult.getRiskScore())
                .threatLevel(analysisResult.getThreatLevel())
                .cyberDna(dnaResult.getCyberDNA())
                .trustScore(dnaResult.getTrustScore())
                .phishingProbability(dnaResult.getPhishingProbability())
                .domainReputation(dnaResult.getDomainReputation())
                .recommendations(analysisResult.getRecommendation())
                .user(user)
                .build();

        // Convert reasons list to ScanReason entities
        for (String reasonStr : analysisResult.getReasons()) {
            scan.addReason(ScanReason.builder().reason(reasonStr).build());
        }

        // Save scan
        UrlScan savedScan = urlScanRepository.save(scan);

        // Asynchronously check VirusTotal (updates DB and sends WebSocket update when done)
        try {
            virusTotalService.scanUrlAsync(savedScan);
        } catch (Exception e) {
            // Log & ignore so main process succeeds
        }

        // Trigger email alerts for Dangerous URLs if user is logged in and has an email
        if ("Dangerous".equalsIgnoreCase(savedScan.getThreatLevel()) && user != null && user.getEmail() != null) {
            try {
                emailService.sendEmailAlert(
                        user.getEmail(),
                        savedScan.getUrl(),
                        savedScan.getRiskScore(),
                        savedScan.getThreatLevel(),
                        analysisResult.getReasons()
                );
            } catch (Exception e) {
                // Log and ignore so API request doesn't crash on email failure
            }
        }

        // Map to Response DTO
        ScanResponseDTO responseDTO = mapToResponseDTO(savedScan);

        // Broadcast to real-time WebSocket dashboard
        try {
            messagingTemplate.convertAndSend("/topic/scans", responseDTO);
        } catch (Exception e) {
            // Ignore websocket errors (e.g. if ws server not connected)
        }

        return responseDTO;
    }

    @Override
    public List<ScanResponseDTO> getScanHistory(String username) {
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // If user is Admin, they can view ALL history. If User, only their own scans.
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        
        List<UrlScan> scans;
        if (isAdmin) {
            scans = urlScanRepository.findAllByOrderByScanDateDesc();
        } else {
            scans = urlScanRepository.findByUserOrderByScanDateDesc(user);
        }

        return scans.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public ScanResponseDTO getScanById(Long id, String username) {
        UrlScan scan = urlScanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scan record not found"));

        // Validate access
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
                if (!isAdmin && (scan.getUser() == null || !scan.getUser().getId().equals(user.getId()))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to scan record");
                }
            }
        } else if (scan.getUser() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to anonymous request");
        }

        return mapToResponseDTO(scan);
    }

    @Override
    @Transactional
    public void deleteScan(Long id, String username) {
        UrlScan scan = urlScanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scan record not found"));

        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Must be authenticated");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only administrators can delete scan records");
        }

        urlScanRepository.delete(scan);
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
