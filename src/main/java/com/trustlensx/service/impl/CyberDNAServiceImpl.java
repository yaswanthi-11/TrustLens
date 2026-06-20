package com.trustlensx.service.impl;

import com.trustlensx.service.CyberDNAService;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class CyberDNAServiceImpl implements CyberDNAService {

    @Override
    public CyberDNAResult generateCyberDNA(String url, int riskScore) {
        String fingerprint = generateSha256Fingerprint(url);
        
        // Trust Score is inversely proportional to risk score
        int trustScore = Math.max(0, 100 - riskScore);
        
        // Phishing probability is roughly equal to the risk score
        int phishingProbability = riskScore;
        
        // Determine domain reputation based on risk score categories
        String domainReputation;
        if (riskScore <= 20) {
            domainReputation = "Good";
        } else if (riskScore <= 50) {
            domainReputation = "Neutral";
        } else if (riskScore <= 80) {
            domainReputation = "Poor";
        } else {
            domainReputation = "High Risk";
        }

        return CyberDNAResult.builder()
                .cyberDNA(fingerprint)
                .trustScore(trustScore)
                .phishingProbability(phishingProbability)
                .domainReputation(domainReputation)
                .build();
    }

    private String generateSha256Fingerprint(String url) {
        try {
            // Clean url to make fingerprint domain-centric
            String cleanUrl = url.toLowerCase()
                    .replaceAll("https?://", "")
                    .replaceAll("www\\.", "")
                    .split("/")[0];

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(cleanUrl.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            String hex = hexString.toString().toUpperCase();
            
            // Format: TLX-XXXX-XXXX
            // Take portions of the SHA-256 hash
            String segment1 = hex.substring(0, 4);
            String segment2 = hex.substring(4, 8);
            
            return "TLX-" + segment1 + "-" + segment2;
        } catch (Exception e) {
            // Fallback unique ID in case of digest errors
            return "TLX-ERR-" + String.format("%04X", Math.abs(url.hashCode() % 65535));
        }
    }
}
