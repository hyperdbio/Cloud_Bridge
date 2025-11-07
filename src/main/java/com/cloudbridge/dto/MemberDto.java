package com.cloudbridge.dto;

import com.cloudbridge.entity.Member;
import lombok.Getter;
import lombok.Setter;

/**
 * MemberDto
 * 프론트엔드 <-> 백엔드 데이터 교환용 DTO
 */
public class MemberDto {

    /**
     * 1. 프론트엔드 -> 백엔드 요청용 DTO
     */
    @Getter
    @Setter
    public static class AuthRequest {
        private String name;
        private String phone;
    }

    /**
     * 2. 백엔드 -> 프론트엔드 응답용 DTO
     */
    @Getter
    public static class Response {
        private String memberId;
        private String name;
        private String phone;

        // ✅ Member 엔티티 -> DTO 변환 생성자
        public Response(Member member) {
            // 엔티티의 실제 getter를 호출
            this.memberId = member.getMemberId(); // 이미 "U1" 형태로 들어있음
            this.name = member.getName();
            this.phone = member.getPhone();
        }
    }
}
