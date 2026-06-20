package com.trustlensx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningArticleDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 20, message = "Content must be at least 20 characters")
    private String content;

    @NotBlank(message = "Topic is required")
    @Size(max = 100, message = "Topic cannot exceed 100 characters")
    private String topic;

    @Size(max = 100, message = "Author cannot exceed 100 characters")
    private String author;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
