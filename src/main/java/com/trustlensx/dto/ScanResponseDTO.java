package com.trustlensx.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanResponseDTO {

    private Long id;
    private String url;
    private LocalDateTime scanDate;
    private int riskScore;
    private String threatLevel;
    private String cyberDna;
    private int trustScore;
    private int phishingProbability;
    private String domainReputation;
    private String recommendations;
    private List<String> reasons;

    private String virusTotalStatus;
    private int virusTotalPositives;
    private int virusTotalTotal;

    public CyberDNADTO toCyberDNA() {
        return CyberDNADTO.builder()
                .cyberDNA(cyberDna)
                .trustScore(trustScore)
                .phishingProbability(phishingProbability)
                .domainReputation(domainReputation)
                .build();
    }
}
