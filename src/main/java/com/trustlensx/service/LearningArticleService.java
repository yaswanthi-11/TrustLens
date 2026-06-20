package com.trustlensx.service;

import com.trustlensx.dto.LearningArticleDTO;
import java.util.List;

public interface LearningArticleService {
    List<LearningArticleDTO> getAllArticles();
    List<LearningArticleDTO> getArticlesByTopic(String topic);
    LearningArticleDTO getArticleById(Long id);
    LearningArticleDTO createArticle(LearningArticleDTO dto, String author);
    LearningArticleDTO updateArticle(Long id, LearningArticleDTO dto);
    void deleteArticle(Long id);
}
