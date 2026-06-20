-- =============================================================================
-- TrustLens X – Smart Threat Intelligence Platform
-- MySQL 8.x Database Schema
-- =============================================================================
-- Run:  mysql -u root -p < database/schema.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `trustlensx`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `trustlensx`;

-- -----------------------------------------------------------------------------
-- Cleanup (development / re-seed only)
-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `scan_reasons`;
DROP TABLE IF EXISTS `url_scans`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `learning_articles`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Table: users
-- Stores registered platform users
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `username`   VARCHAR(50)  NOT NULL,
  `email`      VARCHAR(100) NOT NULL,
  `password`   VARCHAR(100) NOT NULL COMMENT 'BCrypt-encoded password hash',
  `enabled`    TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email`    (`email`),
  KEY `idx_users_enabled`        (`enabled`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Application users';

-- -----------------------------------------------------------------------------
-- Table: roles
-- RBAC role definitions
-- -----------------------------------------------------------------------------
CREATE TABLE `roles` (
  `id`   BIGINT      NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Security roles (ROLE_USER, ROLE_ADMIN)';

-- -----------------------------------------------------------------------------
-- Table: user_roles
-- Many-to-many join between users and roles
-- -----------------------------------------------------------------------------
CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='User-to-role assignments';

-- -----------------------------------------------------------------------------
-- Table: url_scans
-- URL threat intelligence scan results
-- -----------------------------------------------------------------------------
CREATE TABLE `url_scans` (
  `id`                     BIGINT        NOT NULL AUTO_INCREMENT,
  `user_id`                BIGINT        NULL,
  `url`                    VARCHAR(2048) NOT NULL,
  `scan_date`              DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `risk_score`             INT           NOT NULL COMMENT '0-100 composite risk score',
  `threat_level`           VARCHAR(20)   NOT NULL COMMENT 'Safe | Low Risk | Suspicious | Dangerous',
  `cyber_dna`              VARCHAR(50)   NOT NULL COMMENT 'SHA-256 derived fingerprint e.g. TLX-A7F2-X91D',
  `trust_score`            INT           NOT NULL COMMENT '0-100 domain trust score',
  `phishing_probability`   INT           NOT NULL COMMENT '0-100 phishing likelihood',
  `domain_reputation`      VARCHAR(50)   NOT NULL COMMENT 'Excellent | Good | Fair | Poor | Unknown',
  `recommendations`        TEXT          NULL,
  `virus_total_status`     VARCHAR(50)   NOT NULL DEFAULT 'Not Scanned',
  `virus_total_positives`  INT           NOT NULL DEFAULT 0,
  `virus_total_total`      INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_url_scans_user_id`      (`user_id`),
  KEY `idx_url_scans_scan_date`    (`scan_date`),
  KEY `idx_url_scans_risk_score`   (`risk_score`),
  KEY `idx_url_scans_threat_level` (`threat_level`),
  KEY `idx_url_scans_cyber_dna`    (`cyber_dna`),
  KEY `idx_url_scans_url`          (`url`(255)),
  CONSTRAINT `fk_url_scans_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_url_scans_risk_score`
    CHECK (`risk_score` BETWEEN 0 AND 100),
  CONSTRAINT `chk_url_scans_trust_score`
    CHECK (`trust_score` BETWEEN 0 AND 100),
  CONSTRAINT `chk_url_scans_phishing_probability`
    CHECK (`phishing_probability` BETWEEN 0 AND 100)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='URL scan history and threat intelligence results';

-- -----------------------------------------------------------------------------
-- Table: scan_reasons
-- Individual threat indicators detected during a scan
-- -----------------------------------------------------------------------------
CREATE TABLE `scan_reasons` (
  `id`          BIGINT NOT NULL AUTO_INCREMENT,
  `url_scan_id` BIGINT NOT NULL,
  `reason`      TEXT   NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_scan_reasons_url_scan_id` (`url_scan_id`),
  CONSTRAINT `fk_scan_reasons_url_scan`
    FOREIGN KEY (`url_scan_id`) REFERENCES `url_scans` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Threat reasons linked to a URL scan';

-- -----------------------------------------------------------------------------
-- Table: learning_articles
-- Cybersecurity educational content for the Learning Center
-- -----------------------------------------------------------------------------
CREATE TABLE `learning_articles` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(255) NOT NULL,
  `content`    TEXT         NOT NULL,
  `topic`      VARCHAR(100) NOT NULL COMMENT 'Phishing Attacks | Social Engineering | Safe Browsing | Password Security | Scam Detection',
  `author`     VARCHAR(100) NOT NULL DEFAULT 'System',
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_learning_articles_topic`      (`topic`),
  KEY `idx_learning_articles_created_at` (`created_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Learning Center articles';

-- -----------------------------------------------------------------------------
-- Seed: Default RBAC roles
-- -----------------------------------------------------------------------------
INSERT INTO `roles` (`name`) VALUES
  ('ROLE_USER'),
  ('ROLE_ADMIN');

-- =============================================================================
-- End of TrustLens X schema
-- =============================================================================
