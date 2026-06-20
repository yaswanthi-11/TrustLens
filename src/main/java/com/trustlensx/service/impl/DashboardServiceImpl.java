package com.trustlensx.service.impl;

import com.trustlensx.dto.DashboardDTO;
import com.trustlensx.entity.UrlScan;
import com.trustlensx.entity.User;
import com.trustlensx.repository.UrlScanRepository;
import com.trustlensx.repository.UserRepository;
import com.trustlensx.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UrlScanRepository urlScanRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardDTO getDashboardStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        if (isAdmin) {
            long total = urlScanRepository.count();
            long safe = urlScanRepository.countByThreatLevel("Safe");
            long low = urlScanRepository.countByThreatLevel("Low Risk");
            long suspicious = urlScanRepository.countByThreatLevel("Suspicious");
            long dangerous = urlScanRepository.countByThreatLevel("Dangerous");

            return DashboardDTO.builder()
                    .totalScans(total)
                    .safeScans(safe)
                    .lowRiskScans(low)
                    .suspiciousScans(suspicious)
                    .dangerousScans(dangerous)
                    .build();
        } else {
            // Compute user specific stats
            List<UrlScan> scans = urlScanRepository.findByUserOrderByScanDateDesc(user);
            
            long total = scans.size();
            long safe = scans.stream().filter(s -> "Safe".equalsIgnoreCase(s.getThreatLevel())).count();
            long low = scans.stream().filter(s -> "Low Risk".equalsIgnoreCase(s.getThreatLevel())).count();
            long suspicious = scans.stream().filter(s -> "Suspicious".equalsIgnoreCase(s.getThreatLevel())).count();
            long dangerous = scans.stream().filter(s -> "Dangerous".equalsIgnoreCase(s.getThreatLevel())).count();

            return DashboardDTO.builder()
                    .totalScans(total)
                    .safeScans(safe)
                    .lowRiskScans(low)
                    .suspiciousScans(suspicious)
                    .dangerousScans(dangerous)
                    .build();
        }
    }
}
