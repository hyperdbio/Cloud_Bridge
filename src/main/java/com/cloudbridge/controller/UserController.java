package com.cloudbridge.controller;

import com.cloudbridge.dto.MemberDto; // 🚨 UserDto 대신 MemberDto import
import com.cloudbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // 이 클래스가 REST API 컨트롤러임을 알립니다.
@RequestMapping("/api/auth") // 이 컨트롤러의 모든 경로는 /api/auth 로 시작합니다.
@CrossOrigin(origins = "http://localhost:5173") // ✅ React 개발 서버 허용
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 회원가입 API
     * POST /api/auth/register
     */
    @PostMapping("/register")
    // 🚨 UserDto.AuthRequest 대신 MemberDto.AuthRequest 사용
    public ResponseEntity<?> register(@RequestBody MemberDto.AuthRequest request) {
        try {
            // 🚨 UserDto.Response 대신 MemberDto.Response 사용
            MemberDto.Response response = userService.register(request);
            // 성공 시: 200 OK 상태와 사용자 정보 반환
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // 실패 시(중복 등): 400 Bad Request 상태와 에러 메시지 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 로그인 API
     * POST /api/auth/login
     */
    @PostMapping("/login")
    // 🚨 UserDto.AuthRequest 대신 MemberDto.AuthRequest 사용
    public ResponseEntity<?> login(@RequestBody MemberDto.AuthRequest request) {
        try {
            // 🚨 UserDto.Response 대신 MemberDto.Response 사용
            MemberDto.Response response = userService.login(request);
            // 성공 시: 200 OK 상태와 사용자 정보 반환
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // 실패 시(정보 불일치): 401 Unauthorized 상태와 에러 메시지 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}