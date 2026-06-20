package com.trustlensx.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "scan_reasons",
        indexes = {
                @Index(name = "idx_scan_reasons_url_scan_id", columnList = "url_scan_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "urlScan")
public class ScanReason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "url_scan_id", nullable = false)
    private UrlScan urlScan;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;
}
