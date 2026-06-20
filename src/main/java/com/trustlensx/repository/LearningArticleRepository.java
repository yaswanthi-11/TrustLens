package com.trustlensx.repository;

import com.trustlensx.entity.LearningArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningArticleRepository extends JpaRepository<LearningArticle, Long> {
    List<LearningArticle> findByTopicIgnoreCase(String topic);
}
