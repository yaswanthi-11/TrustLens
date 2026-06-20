package com.trustlensx.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.trustlensx.entity.ScanReason;
import com.trustlensx.entity.UrlScan;
import com.trustlensx.entity.User;
import com.trustlensx.repository.UrlScanRepository;
import com.trustlensx.repository.UserRepository;
import com.trustlensx.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UrlScanRepository urlScanRepository;
    private final UserRepository userRepository;

    @Override
    public byte[] generateScanReportPdf(Long scanId, String username) {
        UrlScan scan = urlScanRepository.findById(scanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scan record not found"));

        // Validate access
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
                if (!isAdmin && (scan.getUser() == null || !scan.getUser().getId().equals(user.getId()))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to scan record");
                }
            }
        } else if (scan.getUser() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to anonymous request");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Title
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(15, 23, 42)); // #0F172A
            Paragraph title = new Paragraph("TRUSTLENS X - THREAT INTELLIGENCE REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Subtitle
            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY);
            Paragraph subtitle = new Paragraph("Generated on: " + scan.getScanDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " UTC", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25);
            document.add(subtitle);

            // Verdict Container Table
            PdfPTable verdictTable = new PdfPTable(1);
            verdictTable.setWidthPercentage(100);
            
            Color bannerColor;
            String verdictText = scan.getThreatLevel().toUpperCase();
            if ("Safe".equalsIgnoreCase(scan.getThreatLevel())) {
                bannerColor = new Color(34, 197, 94); // #22C55E
            } else if ("Low Risk".equalsIgnoreCase(scan.getThreatLevel())) {
                bannerColor = new Color(234, 179, 8); // Warning yellow
            } else if ("Suspicious".equalsIgnoreCase(scan.getThreatLevel())) {
                bannerColor = new Color(249, 115, 22); // Orange
            } else {
                bannerColor = new Color(239, 68, 68); // #EF4444
            }

            PdfPCell cell = new PdfPCell(new Phrase("VERDICT: " + verdictText + " (" + scan.getRiskScore() + "/100 Risk Score)", new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE)));
            cell.setBackgroundColor(bannerColor);
            cell.setPadding(10);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            verdictTable.addCell(cell);
            verdictTable.setSpacingAfter(20);
            document.add(verdictTable);

            // Details Section Header
            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59)); // #1E293B
            Paragraph detailsHeader = new Paragraph("URL METADATA & TELEMETRY", sectionFont);
            detailsHeader.setSpacingAfter(10);
            document.add(detailsHeader);

            // Table of Metadata
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);
            
            metaTable.addCell("URL Target:");
            metaTable.addCell(scan.getUrl());
            
            metaTable.addCell("CyberDNA Fingerprint:");
            metaTable.addCell(scan.getCyberDna());
            
            metaTable.addCell("Trust Score:");
            metaTable.addCell(scan.getTrustScore() + "%");
            
            metaTable.addCell("Phishing Probability:");
            metaTable.addCell(scan.getPhishingProbability() + "%");
            
            metaTable.addCell("Domain Reputation:");
            metaTable.addCell(scan.getDomainReputation());

            metaTable.addCell("VirusTotal Status:");
            String vtDetails = scan.getVirusTotalStatus();
            if ("Scanned".equalsIgnoreCase(scan.getVirusTotalStatus())) {
                vtDetails += " (Detected: " + scan.getVirusTotalPositives() + "/" + scan.getVirusTotalTotal() + " engines)";
            }
            metaTable.addCell(vtDetails);
            document.add(metaTable);

            // Threat Reasons Section
            Paragraph reasonsHeader = new Paragraph("RULE DETECTION LOGS", sectionFont);
            reasonsHeader.setSpacingAfter(10);
            document.add(reasonsHeader);

            Font reasonFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            if (scan.getReasons().isEmpty()) {
                document.add(new Paragraph("• No suspicious heuristics matches found.", reasonFont));
            } else {
                for (ScanReason reason : scan.getReasons()) {
                    Paragraph r = new Paragraph("• " + reason.getReason(), reasonFont);
                    r.setSpacingAfter(5);
                    document.add(r);
                }
            }
            
            // Spacing
            Paragraph spacing = new Paragraph(" ");
            spacing.setSpacingAfter(15);
            document.add(spacing);

            // Recommendations Section
            Paragraph recHeader = new Paragraph("RECOMMENDATIONS & SAFEGUARDS", sectionFont);
            recHeader.setSpacingAfter(10);
            document.add(recHeader);

            Font recFont = new Font(Font.HELVETICA, 11, Font.BOLD, bannerColor);
            Paragraph recContent = new Paragraph(scan.getRecommendations(), recFont);
            document.add(recContent);

            // Footer disclaimer
            Paragraph disclaimer = new Paragraph("\n\n\n\nDisclaimer: This report is generated dynamically by TrustLens X using automated static rule intelligence heuristics. Use online caution as no system can detect 100% of advanced persistent phishing campaigns.", new Font(Font.HELVETICA, 8, Font.ITALIC, Color.LIGHT_GRAY));
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            document.add(disclaimer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred during PDF generation", e);
        }
    }
}
