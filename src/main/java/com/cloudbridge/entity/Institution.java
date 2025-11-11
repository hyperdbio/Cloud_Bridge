package com.cloudbridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 🚨 주의: import java.math.BigDecimal; 이 줄은 반드시 삭제해야 합니다.

/**
 * INSTITUTION 테이블과 매핑되는 엔티티 (관공서 정보)
 */
@Entity
// 🚨 [핵심 수정 1] DB에 실제로 존재하는 '대문자' 테이블 이름으로 고정합니다.
@Table(name = "INSTITUTION")
@Getter
@NoArgsConstructor
public class Institution {

    @Id
    @Column(name = "INSTITUTION_ID", nullable = false, length = 50)
    private String institutionId;

    @Column(name = "INST_NAME", nullable = false, length = 100)
    private String instName;

    @Column(name = "ADDRESS", nullable = false, length = 200)
    private String address;

    // 💡 [핵심 수정 2] DB의 NUMBER/DECIMAL 좌표 타입을 가장 안전한 String으로 매핑합니다.
    // 기존 대문자 테이블명 시도 시 이 필드가 문제를 일으켰을 가능성이 높습니다.
    @Column(name = "LATITUDE")
    private String latitude;

    @Column(name = "LONGITUDE")
    private String longitude;
}