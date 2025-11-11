package com.cloudbridge.dto;

import lombok.Getter;

/**
 * Naver Map Client ID를 프론트엔드로 전달하기 위한 DTO
 * MapController에서 사용됩니다.
 */
@Getter
public class MapConfigDto {
    private String clientId;

    public MapConfigDto(String clientId) {
        this.clientId = clientId;
    }
}