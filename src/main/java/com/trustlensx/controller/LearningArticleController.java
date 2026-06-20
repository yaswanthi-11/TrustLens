package com.trustlensx.controller;

import com.trustlensx.dto.LearningArticleDTO;
import com.trustlensx.service.LearningArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LearningArticleController {

    private final LearningArticleService learningArticleService;

    @GetMapping
    public ResponseEntity<List<LearningArticleDTO>> getAllArticles(
            @RequestParam(required = false) String topic
    ) {
        if (topic != null && !topic.trim().isEmpty()) {
            return ResponseEntity.ok(learningArticleService.getArticlesByTopic(topic));
        }
        return ResponseEntity.ok(learningArticleService.getAllArticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningArticleDTO> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(learningArticleService.getArticleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LearningArticleDTO> createArticle(
            @Valid @RequestBody LearningArticleDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String author = (userDetails != null) ? userDetails.getUsername() : "Admin";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(learningArticleService.createArticle(dto, author));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LearningArticleDTO> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody LearningArticleDTO dto
    ) {
        return ResponseEntity.ok(learningArticleService.updateArticle(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        learningArticleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}
