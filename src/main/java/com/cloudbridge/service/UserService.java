package com.cloudbridge.service;

import com.cloudbridge.dto.MemberDto;
import com.cloudbridge.entity.Member;
import com.cloudbridge.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final MemberRepository memberRepository;

    @Autowired
    public UserService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    /**
     * 회원가입 로직
     * "U1", "U2", "U3" 형태로 ID를 자동 생성하여 저장
     */
    public MemberDto.Response register(MemberDto.AuthRequest request) {
        // 1. 휴대전화 중복 체크
        if (memberRepository.existsByPhone(request.getPhone())) {  // ✅ 수정됨
            throw new IllegalArgumentException("이미 가입된 휴대전화 번호입니다.");
        }

        // 2. 새 ID 생성
        String newMemberId = generateNewMemberId();

        // === 디버그 로그 추가 시작 ===
        System.out.println("🔥 [DEBUG] lastId from DB (inside register) : " + /* optional read again */ memberRepository.findLastMemberId());
        System.out.println("🔥 [DEBUG] newly generated ID (inside register) : " + newMemberId);
        // === 디버그 로그 추가 끝 ===

        // 3. Member 엔티티 생성 및 값 세팅
        Member newMember = new Member();
        newMember.setMemberId(newMemberId);
        newMember.setName(request.getName());
        newMember.setPhone(request.getPhone());

        // 4. 저장
        Member savedMember = memberRepository.save(newMember);
        System.out.println("🔥 [DEBUG] savedMember.getMemberId(): " + savedMember.getMemberId());

        // 5. DTO로 변환 후 반환
        return new MemberDto.Response(savedMember);
    }

    /**
     * 로그인 로직
     */
    @Transactional(readOnly = true)
    public MemberDto.Response login(MemberDto.AuthRequest request) {
        Member member = memberRepository.findByNameAndPhone(  // ✅ 수정됨
                request.getName(),
                request.getPhone()
        ).orElseThrow(() -> new IllegalArgumentException("이름 또는 휴대전화 번호가 일치하지 않습니다."));

        return new MemberDto.Response(member);
    }

    /**
     * DB에서 가장 최근 MEMBER_ID를 조회하여 +1한 새 ID 생성
     * (U1 → U2 → U3 ...)
     */
    private String generateNewMemberId() {
        String lastId = memberRepository.findLastMemberId();

        // 🔥 디버그 로그 추가
        System.out.println("🔥 [DEBUG] Last ID from DB: " + lastId);

        if (lastId == null) {
            return "U1"; // 첫 회원일 경우
        }

        try {
            int lastNum = Integer.parseInt(lastId.substring(1));
            return "U" + (lastNum + 1);
        } catch (NumberFormatException e) {
            return "U1";
        }
    }
}
