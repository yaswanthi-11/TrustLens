package com.trustlensx.repository;

import com.trustlensx.entity.UrlScan;
import com.trustlensx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UrlScanRepository extends JpaRepository<UrlScan, Long> {
    List<UrlScan> findByUserOrderByScanDateDesc(User user);
    List<UrlScan> findAllByOrderByScanDateDesc();
    long countByThreatLevel(String threatLevel);
    
    // Admin features - search all scans by URL or threat level
    @Query("SELECT u FROM UrlScan u WHERE LOWER(u.url) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.threatLevel) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY u.scanDate DESC")
    List<UrlScan> searchScans(@Param("keyword") String keyword);
}
