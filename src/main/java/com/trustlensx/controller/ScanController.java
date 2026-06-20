package com.trustlensx.controller;

import com.trustlensx.dto.ScanRequestDTO;
import com.trustlensx.dto.ScanResponseDTO;
import com.trustlensx.service.ScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ScanController {

    private final ScanService scanService;
    private final com.trustlensx.service.ReportService reportService;

    @PostMapping
    public ResponseEntity<ScanResponseDTO> scanUrl(
            @Valid @RequestBody ScanRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        return ResponseEntity.ok(scanService.scanUrl(request, username));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ScanResponseDTO>> getScanHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        return ResponseEntity.ok(scanService.getScanHistory(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScanResponseDTO> getScanById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        return ResponseEntity.ok(scanService.getScanById(id, username));
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReportPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        byte[] pdfBytes = reportService.generateScanReportPdf(id, username);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"trustlensx-report-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScan(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        scanService.deleteScan(id, username);
        return ResponseEntity.noContent().build();
    }
}
