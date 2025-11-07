package com.cloudbridge.repository;

import com.cloudbridge.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    /**
     * 로그인 시: 이름과 전화번호로 회원을 찾습니다.
     * ⚠️ 엔티티 필드명이 camelCase이므로, 반드시 Name/Phone 으로 써야 JPA가 인식합니다.
     */
    Optional<Member> findByNameAndPhone(String name, String phone); // ✅ 필드명 camelCase

    /**
     * 회원가입 시: 이미 등록된 전화번호인지 확인합니다.
     * ⚠️ 엔티티 필드명이 phone이므로 existsByPhone 으로 작성해야 합니다.
     */
    boolean existsByPhone(String phone); // ✅ 여기 소문자 필드명에 맞게 수정

    /**
     * 🚀 현재 등록된 회원 중 가장 마지막 MEMBER_ID 조회
     * 예) U1, U2, U3 → U3 반환
     * REGEXP + CONVERT를 사용해 문자열의 숫자 부분을 정확히 정렬
     */
    @Query(
            value = "SELECT MEMBER_ID " +
                    "FROM member " +
                    "WHERE MEMBER_ID REGEXP '^U[0-9]+$' " +
                    "ORDER BY CONVERT(SUBSTRING(MEMBER_ID, 2), UNSIGNED) DESC " +
                    "LIMIT 1",
            nativeQuery = true
    )
    String findLastMemberId();
}
