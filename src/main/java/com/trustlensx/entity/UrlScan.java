package com.trustlensx.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "url_scans",
        indexes = {
                @Index(name = "idx_url_scans_user_id", columnList = "user_id"),
                @Index(name = "idx_url_scans_scan_date", columnList = "scan_date"),
                @Index(name = "idx_url_scans_risk_score", columnList = "risk_score"),
                @Index(name = "idx_url_scans_threat_level", columnList = "threat_level"),
                @Index(name = "idx_url_scans_cyber_dna", columnList = "cyber_dna")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlScan {

    public static final String THREAT_SAFE = "Safe";
    public static final String THREAT_LOW = "Low Risk";
    public static final String THREAT_SUSPICIOUS = "Suspicious";
    public static final String THREAT_DANGEROUS = "Dangerous";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(name = "scan_date", nullable = false)
    private LocalDateTime scanDate;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "threat_level", nullable = false, length = 20)
    private String threatLevel;

    @Column(name = "cyber_dna", nullable = false, length = 50)
    private String cyberDna;

    @Column(name = "trust_score", nullable = false)
    private int trustScore;

    @Column(name = "phishing_probability", nullable = false)
    private int phishingProbability;

    @Column(name = "domain_reputation", nullable = false, length = 50)
    private String domainReputation;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "virus_total_status", nullable = false, length = 50)
    @Builder.Default
    private String virusTotalStatus = "Not Scanned";

    @Column(name = "virus_total_positives", nullable = false)
    @Builder.Default
    private int virusTotalPositives = 0;

    @Column(name = "virus_total_total", nullable = false)
    @Builder.Default
    private int virusTotalTotal = 0;

    @OneToMany(mappedBy = "urlScan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ScanReason> reasons = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (scanDate == null) {
            scanDate = LocalDateTime.now();
        }
    }

    public void addReason(ScanReason reason) {
        reasons.add(reason);
        reason.setUrlScan(this);
    }

    public void addReason(String reasonText) {
        addReason(ScanReason.builder().reason(reasonText).build());
    }

    public boolean isDangerous() {
        return THREAT_DANGEROUS.equalsIgnoreCase(threatLevel);
    }
}
