package com.trustlensx.service.impl;

import com.trustlensx.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmailAlert(String toEmail, String url, int riskScore, String threatLevel, List<String> reasons) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("⚠️ TrustLens X - Critical Security Threat Alert!");
            
            // Build visual HTML body
            StringBuilder body = new StringBuilder();
            body.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #EF4444; border-radius: 8px;'>");
            body.append("<h2 style='color: #EF4444; text-align: center; border-bottom: 2px solid #EF4444; padding-bottom: 10px;'>TrustLens X Security Alert</h2>");
            body.append("<p>Hello,</p>");
            body.append("<p>Our automated URL Threat Intelligence Engine detected a <strong>Critical Threat</strong> while analyzing a URL associated with your active session.</p>");
            
            body.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>");
            body.append("<tr style='background: #1E293B; color: white;'>");
            body.append("<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Metric</th>");
            body.append("<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Telemetry Value</th>");
            body.append("</tr>");
            body.append("<tr>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd;'><strong>URL Analyzed</strong></td>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd; word-break: break-all;'>").append(url).append("</td>");
            body.append("</tr>");
            body.append("<tr>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd;'><strong>Risk Score</strong></td>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd; color: #EF4444; font-weight: bold;'>").append(riskScore).append("/100</td>");
            body.append("</tr>");
            body.append("<tr>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd;'><strong>Threat Classification</strong></td>");
            body.append("<td style='padding: 10px; border: 1px solid #ddd; color: #EF4444; font-weight: bold;'>").append(threatLevel).append("</td>");
            body.append("</tr>");
            body.append("</table>");

            body.append("<h3 style='color: #1E293B;'>Detected Threat Signatures:</h3>");
            body.append("<ul>");
            for (String reason : reasons) {
                body.append("<li style='margin-bottom: 5px;'>").append(reason).append("</li>");
            }
            body.append("</ul>");

            body.append("<div style='background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin-top: 20px;'>");
            body.append("<h4 style='margin: 0 0 5px 0; color: #991B1B;'>Critical Recommendation:</h4>");
            body.append("<p style='margin: 0; color: #7F1D1D;'><strong>Avoid visiting this website.</strong> Do not download attachments, provide credit credentials, or enter passwords.</p>");
            body.append("</div>");

            body.append("<p style='margin-top: 35px; border-top: 1px solid #eee; padding-top: 10px; font-size: 11px; color: #94A3B8; text-align: center;'>");
            body.append("TrustLens X – Smart Threat Intelligence Platform. This is an automated security broadcast.");
            body.append("</p>");
            body.append("</div>");

            helper.setText(body.toString(), true);
            mailSender.send(message);
        } catch (Exception e) {
            // Graceful fallback for SMTP failures
            System.err.println("SMTP Alert failed to send: " + e.getMessage());
        }
    }
}
