package com.trustlensx.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "learning_articles",
        indexes = {
                @Index(name = "idx_learning_articles_topic", columnList = "topic"),
                @Index(name = "idx_learning_articles_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningArticle {

    public static final String TOPIC_PHISHING = "Phishing Attacks";
    public static final String TOPIC_SOCIAL_ENGINEERING = "Social Engineering";
    public static final String TOPIC_SAFE_BROWSING = "Safe Browsing";
    public static final String TOPIC_PASSWORD_SECURITY = "Password Security";
    public static final String TOPIC_SCAM_DETECTION = "Scam Detection";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String topic;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String author = "System";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
