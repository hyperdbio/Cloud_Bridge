package com.cloudbridge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 일반적인 Spring MVC 설정을 담당하는 클래스입니다.
 * CORS 설정은 SecurityConfig에서 처리하도록 위임했습니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ✅ 기존의 CorsFilter Bean은 SecurityConfig에서 통합 처리하므로 제거했습니다.
    // 이곳에 다른 Web MVC 관련 설정을 추가할 수 있습니다.
}