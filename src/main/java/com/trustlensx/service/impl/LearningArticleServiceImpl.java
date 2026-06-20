package com.trustlensx.service.impl;

import com.trustlensx.dto.LearningArticleDTO;
import com.trustlensx.entity.LearningArticle;
import com.trustlensx.repository.LearningArticleRepository;
import com.trustlensx.service.LearningArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningArticleServiceImpl implements LearningArticleService {

    private final LearningArticleRepository learningArticleRepository;

    @Override
    public List<LearningArticleDTO> getAllArticles() {
        return learningArticleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LearningArticleDTO> getArticlesByTopic(String topic) {
        return learningArticleRepository.findByTopicIgnoreCase(topic).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LearningArticleDTO getArticleById(Long id) {
        LearningArticle article = learningArticleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));
        return mapToDTO(article);
    }

    @Override
    @Transactional
    public LearningArticleDTO createArticle(LearningArticleDTO dto, String author) {
        LearningArticle article = LearningArticle.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .topic(dto.getTopic())
                .author(author != null ? author : "System")
                .build();

        LearningArticle saved = learningArticleRepository.save(article);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public LearningArticleDTO updateArticle(Long id, LearningArticleDTO dto) {
        LearningArticle article = learningArticleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));

        article.setTitle(dto.getTitle());
        article.setContent(dto.getContent());
        article.setTopic(dto.getTopic());
        if (dto.getAuthor() != null) {
            article.setAuthor(dto.getAuthor());
        }

        LearningArticle saved = learningArticleRepository.save(article);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        LearningArticle article = learningArticleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));
        learningArticleRepository.delete(article);
    }

    private LearningArticleDTO mapToDTO(LearningArticle article) {
        return LearningArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .topic(article.getTopic())
                .author(article.getAuthor())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
