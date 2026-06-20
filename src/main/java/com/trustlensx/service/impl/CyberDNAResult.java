package com.trustlensx.service.impl;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CyberDNAResult {
    private String cyberDNA;
    private int trustScore;
    private int phishingProbability;
    private String domainReputation;
}
