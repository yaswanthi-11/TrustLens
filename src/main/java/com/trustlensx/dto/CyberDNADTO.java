package com.trustlensx.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CyberDNADTO {

    private String cyberDNA;
    private int trustScore;
    private int phishingProbability;
    private String domainReputation;
}
