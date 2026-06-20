package com.trustlensx.repository;

import com.trustlensx.entity.ScanReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScanReasonRepository extends JpaRepository<ScanReason, Long> {
}
