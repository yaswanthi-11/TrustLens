package com.trustlensx.service.impl;

import com.trustlensx.dto.AnalyticsDTO;
import com.trustlensx.entity.ScanReason;
import com.trustlensx.entity.UrlScan;
import com.trustlensx.entity.User;
import com.trustlensx.repository.UrlScanRepository;
import com.trustlensx.repository.UserRepository;
import com.trustlensx.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UrlScanRepository urlScanRepository;
    private final UserRepository userRepository;

    @Override
    public AnalyticsDTO getAnalyticsStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        List<UrlScan> scans;
        if (isAdmin) {
            scans = urlScanRepository.findAllByOrderByScanDateDesc();
        } else {
            scans = urlScanRepository.findByUserOrderByScanDateDesc(user);
        }

        // 1. Risk Distribution
        Map<String, Long> riskDistribution = new LinkedHashMap<>();
        riskDistribution.put("Safe", 0L);
        riskDistribution.put("Low Risk", 0L);
        riskDistribution.put("Suspicious", 0L);
        riskDistribution.put("Dangerous", 0L);
        
        for (UrlScan scan : scans) {
            String level = scan.getThreatLevel();
            riskDistribution.put(level, riskDistribution.getOrDefault(level, 0L) + 1);
        }

        // 2. Daily Trends (last 14 days or all, sorted chronologically)
        DateTimeFormatter dailyFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> dailyTrends = new TreeMap<>(); // TreeMap keeps dates sorted
        
        // 3. Monthly Trends
        DateTimeFormatter monthlyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> monthlyTrends = new TreeMap<>();

        // 4. Threat Category Breakdown
        Map<String, Long> threatCategoryBreakdown = new LinkedHashMap<>();
        threatCategoryBreakdown.put("Insecure HTTP", 0L);
        threatCategoryBreakdown.put("Brand Impersonation", 0L);
        threatCategoryBreakdown.put("Suspicious Keywords", 0L);
        threatCategoryBreakdown.put("IP Address Usage", 0L);
        threatCategoryBreakdown.put("Suspicious TLD", 0L);
        threatCategoryBreakdown.put("Excessive Hyphens", 0L);
        threatCategoryBreakdown.put("Subdomain Tunneling", 0L);
        threatCategoryBreakdown.put("Special Characters", 0L);
        threatCategoryBreakdown.put("New Domain", 0L);

        for (UrlScan scan : scans) {
            if (scan.getScanDate() != null) {
                String dayStr = scan.getScanDate().format(dailyFormatter);
                dailyTrends.put(dayStr, dailyTrends.getOrDefault(dayStr, 0L) + 1);

                String monthStr = scan.getScanDate().format(monthlyFormatter);
                monthlyTrends.put(monthStr, monthlyTrends.getOrDefault(monthStr, 0L) + 1);
            }

            // Parse reasons to break down threat triggers
            for (ScanReason reason : scan.getReasons()) {
                String text = reason.getReason().toLowerCase();
                if (text.contains("http protocol") || text.contains("secure protocol")) {
                    threatCategoryBreakdown.put("Insecure HTTP", threatCategoryBreakdown.get("Insecure HTTP") + 1);
                }
                if (text.contains("brand impersonation")) {
                    threatCategoryBreakdown.put("Brand Impersonation", threatCategoryBreakdown.get("Brand Impersonation") + 1);
                }
                if (text.contains("suspicious keywords")) {
                    threatCategoryBreakdown.put("Suspicious Keywords", threatCategoryBreakdown.get("Suspicious Keywords") + 1);
                }
                if (text.contains("ipv4") || text.contains("ip address")) {
                    threatCategoryBreakdown.put("IP Address Usage", threatCategoryBreakdown.get("IP Address Usage") + 1);
                }
                if (text.contains("tld") || text.contains("top-level domain")) {
                    threatCategoryBreakdown.put("Suspicious TLD", threatCategoryBreakdown.get("Suspicious TLD") + 1);
                }
                if (text.contains("hyphens")) {
                    threatCategoryBreakdown.put("Excessive Hyphens", threatCategoryBreakdown.get("Excessive Hyphens") + 1);
                }
                if (text.contains("subdomains") || text.contains("subdomain")) {
                    threatCategoryBreakdown.put("Subdomain Tunneling", threatCategoryBreakdown.get("Subdomain Tunneling") + 1);
                }
                if (text.contains("special characters")) {
                    threatCategoryBreakdown.put("Special Characters", threatCategoryBreakdown.get("Special Characters") + 1);
                }
                if (text.contains("domain age") || text.contains("young") || text.contains("newly registered")) {
                    threatCategoryBreakdown.put("New Domain", threatCategoryBreakdown.get("New Domain") + 1);
                }
            }
        }

        // Limit daily trends to the last 14 days if it grows too large, but keep tree map sorted
        if (dailyTrends.size() > 14) {
            List<String> keys = new ArrayList<>(dailyTrends.keySet());
            Map<String, Long> limitedDaily = new LinkedHashMap<>();
            for (int i = keys.size() - 14; i < keys.size(); i++) {
                limitedDaily.put(keys.get(i), dailyTrends.get(keys.get(i)));
            }
            dailyTrends = limitedDaily;
        }

        return AnalyticsDTO.builder()
                .riskDistribution(riskDistribution)
                .dailyTrends(dailyTrends)
                .monthlyTrends(monthlyTrends)
                .threatCategoryBreakdown(threatCategoryBreakdown)
                .build();
    }
}
