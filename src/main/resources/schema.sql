-- TrustLens X MySQL Database Schema

-- Drop tables if they exist to allow clean initial seeding
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `scan_reasons`;
DROP TABLE IF EXISTS `url_scans`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `learning_articles`;
SET FOREIGN_KEY_CHECKS = 1;

-- Create users table
CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create roles table
CREATE TABLE `roles` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create join table for user and roles
CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create url_scans table
CREATE TABLE `url_scans` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT DEFAULT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `scan_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `risk_score` INT NOT NULL,
  `threat_level` VARCHAR(20) NOT NULL,
  `cyber_dna` VARCHAR(50) NOT NULL,
  `trust_score` INT NOT NULL,
  `phishing_probability` INT NOT NULL,
  `domain_reputation` VARCHAR(50) NOT NULL,
  `recommendations` TEXT DEFAULT NULL,
  `virus_total_status` VARCHAR(50) DEFAULT 'Not Scanned',
  `virus_total_positives` INT DEFAULT 0,
  `virus_total_total` INT DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_scan_date` (`scan_date`),
  INDEX `idx_risk_score` (`risk_score`),
  INDEX `idx_cyber_dna` (`cyber_dna`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create scan_reasons table
CREATE TABLE `scan_reasons` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `url_scan_id` BIGINT NOT NULL,
  `reason` TEXT NOT NULL,
  FOREIGN KEY (`url_scan_id`) REFERENCES `url_scans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create learning_articles table
CREATE TABLE `learning_articles` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `topic` VARCHAR(100) NOT NULL,
  `author` VARCHAR(100) DEFAULT 'System',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO `roles` (`name`) VALUES ('ROLE_USER');
INSERT INTO `roles` (`name`) VALUES ('ROLE_ADMIN');
