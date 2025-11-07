package com.cloudbridge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 설정을 담당하는 클래스입니다.
 * JWT 기반의 STATELESS 인증 및 CORS 설정을 정의합니다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF 보호 비활성화 (REST API 기본)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. CORS 활성화: corsConfigurationSource Bean을 사용하도록 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. 세션을 STATELESS로 (JWT 인증 구조용)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // ✅ 회원가입, 로그인 허용
                        .requestMatchers("/public/**").permitAll() // 필요하다면 공개된 경로 추가
                        .anyRequest().authenticated() // 나머지는 인증 필요
                );

        return http.build();
    }

    /**
     * 모든 프론트엔드 개발 서버 포트를 허용하도록 CORS 설정을 정의하는 Bean입니다.
     * Spring Security의 필터 체인에 의해 사용됩니다.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🚨 [핵심] 모든 프론트엔드 출처(Origin)를 이곳에 통합하여 정의합니다.
        List<String> allowedOrigins = Arrays.asList(
                "http://localhost:5173", // 기존 포트
                "http://localhost:5180", // WebConfig에서 통합된 포트
                "http://127.0.0.1:5180"  // WebConfig에서 통합된 포트
        );
        config.setAllowedOrigins(allowedOrigins);

        config.addAllowedMethod("*"); // 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
        config.addAllowedHeader("*"); // 모든 헤더 허용
        config.setAllowCredentials(true); // 쿠키/인증정보 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}