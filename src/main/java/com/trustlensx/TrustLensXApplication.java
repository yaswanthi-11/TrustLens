package com.trustlensx;

import com.trustlensx.entity.*;
import com.trustlensx.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
@EnableAsync
public class TrustLensXApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrustLensXApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            LearningArticleRepository learningArticleRepository,
            UrlScanRepository urlScanRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // 1. Seed Roles
            Role roleUser = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
            
            Role roleAdmin = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

            // 2. Seed Default Users (Admin and standard user)
            User admin = null;
            if (!userRepository.existsByUsername("admin")) {
                admin = User.builder()
                        .username("admin")
                        .email("admin@trustlensx.com")
                        .password(passwordEncoder.encode("admin123"))
                        .enabled(true)
                        .roles(new HashSet<>(Arrays.asList(roleUser, roleAdmin)))
                        .build();
                userRepository.save(admin);
            } else {
                admin = userRepository.findByUsername("admin").orElse(null);
            }

            if (!userRepository.existsByUsername("user")) {
                User standardUser = User.builder()
                        .username("user")
                        .email("user@trustlensx.com")
                        .password(passwordEncoder.encode("user123"))
                        .enabled(true)
                        .roles(new HashSet<>(List.of(roleUser)))
                        .build();
                userRepository.save(standardUser);
            }

            // 3. Seed Learning Articles if empty
            if (learningArticleRepository.count() == 0) {
                List<LearningArticle> articles = Arrays.asList(
                    LearningArticle.builder()
                        .title("How to Spot Phishing Emails and Malicious Links")
                        .topic("Phishing Attacks")
                        .content("Phishing attacks are one of the most common security challenges. Threat actors mimic legitimate brands, banking portals, or colleagues to trick you into entering credentials or clicking malicious links. Keep an eye out for spelling errors, strange domain structures (e.g. paypa1-verification.com instead of paypal.com), and urgent warnings demanding immediate actions.")
                        .author("Security Operations Center")
                        .build(),
                    LearningArticle.builder()
                        .title("The Psychology of Social Engineering")
                        .topic("Social Engineering")
                        .content("Social engineering is the art of manipulating people so they give up confidential information. Attackers exploit emotions like fear, curiosity, or urgency. Always verify the identity of anyone asking for passwords or sensitive files, even if they claim to be from internal IT or executive management.")
                        .author("Risk Analyst Team")
                        .build(),
                    LearningArticle.builder()
                        .title("Ten Commandments of Safe Web Browsing")
                        .topic("Safe Browsing")
                        .content("To ensure safe browsing: 1. Always look for HTTPS (padlock icon). 2. Avoid clicking links in unsolicited emails. 3. Use an ad-blocker. 4. Never bypass browser warning pages. 5. Scan URLs using platforms like TrustLens X. 6. Keep your browser and extensions updated. 7. Do not install unknown profiles or trust unverified root certificates.")
                        .author("Threat Intell Division")
                        .build(),
                    LearningArticle.builder()
                        .title("Creating Unbreakable Passwords and Multi-Factor Rules")
                        .topic("Password Security")
                        .content("Your password is the first line of defense. Avoid using dictionaries, birthdays, or common keywords. Use phrases of at least 14 characters containing uppercase, lowercase, numbers, and special characters. Crucially, activate Multi-Factor Authentication (MFA) on all financial, work, and personal email accounts.")
                        .author("Cyber Security Lead")
                        .build(),
                    LearningArticle.builder()
                        .title("Advanced Scam Detection: Identifying Typosquatting")
                        .topic("Scam Detection")
                        .content("Typosquatting is a form of cybersquatting which targets internet users who incorrectly type a website address into their web browser. Common examples include: goggle.com, facebo0k.com, or amazn-support-portal.info. Malicious actors purchase these domains to infect systems or harvest login details.")
                        .author("SOC Analyst")
                        .build()
                );
                learningArticleRepository.saveAll(articles);
            }

            // 4. Seed Mock Scan Records if empty (to give visual life to Dashboard graphs immediately)
            if (urlScanRepository.count() == 0 && admin != null) {
                // Safe scan
                UrlScan scan1 = UrlScan.builder()
                        .url("https://www.google.com")
                        .scanDate(LocalDateTime.now().minusDays(3))
                        .riskScore(0)
                        .threatLevel("Safe")
                        .cyberDna("TLX-A0B1-C2D3")
                        .trustScore(100)
                        .phishingProbability(0)
                        .domainReputation("Good")
                        .recommendations("This URL appears secure. No suspicious patterns were detected. You may visit it safely.")
                        .virusTotalStatus("Scanned")
                        .virusTotalPositives(0)
                        .virusTotalTotal(72)
                        .user(admin)
                        .build();
                scan1.addReason(ScanReason.builder().reason("No suspicious heuristics patterns detected in the URL structure").build());
                urlScanRepository.save(scan1);

                // Low Risk scan
                UrlScan scan2 = UrlScan.builder()
                        .url("http://wikipedia.org/wiki/Phishing")
                        .scanDate(LocalDateTime.now().minusDays(2))
                        .riskScore(25)
                        .threatLevel("Low Risk")
                        .cyberDna("TLX-D4E5-F6A7")
                        .trustScore(75)
                        .phishingProbability(25)
                        .domainReputation("Neutral")
                        .recommendations("Minor anomalies detected. Use basic caution. Verify request context if requested to type credentials.")
                        .virusTotalStatus("Scanned")
                        .virusTotalPositives(1)
                        .virusTotalTotal(74)
                        .user(admin)
                        .build();
                scan2.addReason(ScanReason.builder().reason("HTTP protocol used (unencrypted and insecure transmission)").build());
                scan2.addReason(ScanReason.builder().reason("URL contains suspicious keywords: phishing").build());
                urlScanRepository.save(scan2);

                // Suspicious scan
                UrlScan scan3 = UrlScan.builder()
                        .url("https://secure-login-netflx.xyz")
                        .scanDate(LocalDateTime.now().minusDays(1))
                        .riskScore(65)
                        .threatLevel("Suspicious")
                        .cyberDna("TLX-B8C9-D0E1")
                        .trustScore(35)
                        .phishingProbability(65)
                        .domainReputation("Poor")
                        .recommendations("Warning: Multiple phishing patterns detected. Do not log in, download files, or submit sensitive information on this page.")
                        .virusTotalStatus("Scanned")
                        .virusTotalPositives(8)
                        .virusTotalTotal(75)
                        .user(admin)
                        .build();
                scan3.addReason(ScanReason.builder().reason("Uses top-level domain (TLD) '.xyz' highly associated with phishing/spam").build());
                scan3.addReason(ScanReason.builder().reason("URL contains suspicious keywords: secure, login").build());
                scan3.addReason(ScanReason.builder().reason("Potential brand impersonation detected targeting 'netflix'").build());
                urlScanRepository.save(scan3);

                // Dangerous scan
                UrlScan scan4 = UrlScan.builder()
                        .url("http://amaz0n-login-security.com")
                        .scanDate(LocalDateTime.now())
                        .riskScore(88)
                        .threatLevel("Dangerous")
                        .cyberDna("TLX-F2A3-B4C5")
                        .trustScore(12)
                        .phishingProbability(88)
                        .domainReputation("High Risk")
                        .recommendations("Alert: High phishing indicator match. Avoid visiting this website. It displays signature structures of malicious content.")
                        .virusTotalStatus("Scanned")
                        .virusTotalPositives(22)
                        .virusTotalTotal(75)
                        .user(admin)
                        .build();
                scan4.addReason(ScanReason.builder().reason("HTTP protocol used (unencrypted and insecure transmission)").build());
                scan4.addReason(ScanReason.builder().reason("URL contains suspicious keywords: login, security").build());
                scan4.addReason(ScanReason.builder().reason("Potential brand impersonation detected targeting 'amazon'").build());
                scan4.addReason(ScanReason.builder().reason("Excessive hyphens (2) in domain name (common typosquatting technique)").build());
                urlScanRepository.save(scan4);
            }
        };
    }
}
