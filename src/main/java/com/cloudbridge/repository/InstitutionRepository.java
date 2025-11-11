package com.cloudbridge.repository;

import com.cloudbridge.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // ✅ [추가]
import org.springframework.stereotype.Repository;

import java.util.List; // ✅ [추가]

/**
 * INSTITUTION 테이블을 조회하기 위한 Spring Data JPA 리포지토리
 */
@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {

    // 🚨 [최종 해결책] Hibernate의 Naming Strategy(소문자 강제)를 무시하고
    // DB에 존재하는 '대문자' INSTITUTION 테이블을 직접 조회합니다.
    // 🚨 [수정] 104개가 아닌 5개의 데이터만 가져오도록 LIMIT 5 추가
    @Query(value = "SELECT * FROM INSTITUTION LIMIT 5", nativeQuery = true)
    List<Institution> findAllNative();
}