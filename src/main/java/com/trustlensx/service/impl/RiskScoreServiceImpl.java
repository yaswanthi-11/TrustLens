package com.trustlensx.service.impl;

import com.trustlensx.service.RiskScoreService;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class RiskScoreServiceImpl implements RiskScoreService {

    private static final List<String> SUSPICIOUS_KEYWORDS = Arrays.asList(
            "login", "security", "update", "signin", "bank", "verify", "account", "secure",
            "support", "admin", "password", "wallet", "claims", "verification", "oauth",
            "portal", "billing", "recovery", "refunding", "free", "gift", "prize"
    );

    private static final List<String> POPULAR_BRANDS = Arrays.asList(
            "amazon", "paypal", "netflix", "google", "apple", "microsoft", "facebook",
            "instagram", "twitter", "chase", "bankofamerica", "wellsfargo", "binance",
            "coinbase", "steam", "linkedin", "yahoo"
    );

    private static final List<String> SUSPICIOUS_TLDS = Arrays.asList(
            ".xyz", ".cc", ".top", ".info", ".club", ".tk", ".ml", ".ga", ".cf", ".gq",
            ".zip", ".fit", ".live", ".ru", ".work", ".online", ".click", ".biz", ".icu",
            ".vip", ".date", ".loan", ".party", ".science", ".download", ".gdn"
    );

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$"
    );

    @Override
    public RiskAnalysisResult analyzeUrl(String rawUrl) {
        String url = rawUrl.trim();
        List<String> reasons = new ArrayList<>();
        int score = 0;

        // 1. HTTP vs HTTPS
        boolean isHttps = url.toLowerCase().startsWith("https://");
        boolean isHttp = url.toLowerCase().startsWith("http://");
        if (isHttp) {
            score += 15;
            reasons.add("HTTP protocol used (unencrypted and insecure transmission)");
        } else if (!isHttps) {
            score += 10;
            reasons.add("No secure protocol (HTTPS) specified in input URL");
        }

        // Clean URL for parsing
        String normalizedUrl = url;
        if (!isHttp && !isHttps) {
            normalizedUrl = "http://" + url; // temp prefix for URI parsing
        }

        String host = "";
        String path = "";
        try {
            URI uri = new java.net.URI(normalizedUrl);
            host = uri.getHost();
            path = uri.getPath();
            if (host == null) {
                // Fallback for simple domain strings
                int slashIdx = normalizedUrl.indexOf('/', 7);
                host = slashIdx == -1 ? normalizedUrl.substring(7) : normalizedUrl.substring(7, slashIdx);
            }
        } catch (Exception e) {
            host = url.replaceAll("https?://", "").split("/")[0];
        }

        if (host == null) {
            host = "";
        }
        host = host.toLowerCase();
        if (path == null) {
            path = "";
        }
        path = path.toLowerCase();

        // 2. Suspicious Keywords Check
        int keywordMatches = 0;
        List<String> matchedKeywords = new ArrayList<>();
        for (String keyword : SUSPICIOUS_KEYWORDS) {
            if (host.contains(keyword) || path.contains(keyword)) {
                keywordMatches++;
                matchedKeywords.add(keyword);
            }
        }
        if (keywordMatches > 0) {
            int keywordScore = Math.min(keywordMatches * 10, 30);
            score += keywordScore;
            reasons.add("URL contains suspicious keywords: " + String.join(", ", matchedKeywords));
        }

        // 3. URL Length
        if (url.length() > 100) {
            score += 20;
            reasons.add("URL is extremely long (" + url.length() + " characters), often used to hide malicious paths");
        } else if (url.length() > 75) {
            score += 10;
            reasons.add("URL is moderately long (" + url.length() + " characters)");
        }

        // 4. Excessive Hyphens
        int hyphenCount = 0;
        for (char c : host.toCharArray()) {
            if (c == '-') hyphenCount++;
        }
        if (hyphenCount > 2) {
            score += 15;
            reasons.add("Excessive hyphens (" + hyphenCount + ") in domain name (common typosquatting technique)");
        }

        // 5. Brand Impersonation
        boolean brandImpersonated = false;
        String normalizedHost = host.replace("0", "o")
                                     .replace("1", "i")
                                     .replace("l", "i")
                                     .replace("vv", "w");
        for (String brand : POPULAR_BRANDS) {
            // If host contains brand name or typo-similar brand name but is not the official brand site
            if ((host.contains(brand) || normalizedHost.contains(brand)) &&
                    !host.equals(brand + ".com") &&
                    !host.endsWith("." + brand + ".com") &&
                    !host.equals(brand + ".org") &&
                    !host.endsWith("." + brand + ".org") &&
                    !host.equals(brand + ".net") &&
                    !host.endsWith("." + brand + ".net") &&
                    !host.equals(brand + ".co") &&
                    !host.endsWith("." + brand + ".co")) {
                brandImpersonated = true;
                score += 25;
                reasons.add("Potential brand impersonation detected targeting '" + brand + "'");
                break; // Alert once
            }
        }

        // 6. IP Address Usage
        String cleanHost = host;
        if (host.contains(":")) {
            cleanHost = host.split(":")[0];
        }
        if (IPV4_PATTERN.matcher(cleanHost).matches()) {
            score += 20;
            reasons.add("URL uses raw IPv4 address as host instead of registered domain name");
        }

        // 7. Suspicious TLD
        for (String tld : SUSPICIOUS_TLDS) {
            if (host.endsWith(tld)) {
                score += 15;
                reasons.add("Uses top-level domain (TLD) '" + tld + "' highly associated with phishing/spam");
                break;
            }
        }

        // 8. Multiple Subdomains
        String[] domainParts = host.split("\\.");
        // Ignore "www" and final TLD, e.g., info.update.secure.google.com has parts info, update, secure, google, com -> length 5
        int subdomainsCount = domainParts.length;
        if (domainParts.length > 0 && domainParts[0].equals("www")) {
            subdomainsCount--;
        }
        if (subdomainsCount > 3) {
            score += 15;
            reasons.add("URL has excessive subdomains (" + (subdomainsCount - 2) + " levels), indicating subdomain hijacking or masking");
        }

        // 9. Special Characters
        if (url.contains("@") || url.contains("%")) {
            score += 10;
            reasons.add("Contains suspicious special characters like '@' or '%' used to obfuscate destinations");
        }

        // 10. Domain Age Simulation
        // Generate a deterministic pseudo-random age from 1 to 730 days based on host hash
        int hostHash = Math.abs(host.hashCode());
        int simulatedAgeDays = (hostHash % 730) + 1;
        if (simulatedAgeDays < 90) {
            score += 20;
            reasons.add("Simulated domain age is very young (" + simulatedAgeDays + " days), indicating high threat velocity");
        } else if (simulatedAgeDays < 365) {
            score += 10;
            reasons.add("Simulated domain age is relatively new (" + simulatedAgeDays + " days)");
        }

        // Bound final score between 0 and 100
        score = Math.max(0, Math.min(score, 100));

        // If score is 0 and no threat reasons matched, add default safe comment
        if (reasons.isEmpty() && score == 0) {
            reasons.add("No suspicious heuristics patterns detected in the URL structure");
        }

        // Determine Threat Level
        String threatLevel;
        String recommendation;
        if (score <= 20) {
            threatLevel = "Safe";
            recommendation = "This URL appears secure. No suspicious patterns were detected. You may visit it safely.";
        } else if (score <= 50) {
            threatLevel = "Low Risk";
            recommendation = "Minor anomalies detected. Use basic caution. Verify request context if requested to type credentials.";
        } else if (score <= 80) {
            threatLevel = "Suspicious";
            recommendation = "Warning: Multiple phishing patterns detected. Do not log in, download files, or submit sensitive information on this page.";
        } else {
            threatLevel = "Dangerous";
            recommendation = "Alert: High phishing indicator match. Avoid visiting this website. It displays signature structures of malicious content.";
        }

        return RiskAnalysisResult.builder()
                .riskScore(score)
                .threatLevel(threatLevel)
                .reasons(reasons)
                .recommendation(recommendation)
                .build();
    }
}
