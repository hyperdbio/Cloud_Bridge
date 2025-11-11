package com.cloudbridge.controller;

import com.cloudbridge.dto.MapConfigDto;
import com.cloudbridge.dto.OfficeDto;
import com.cloudbridge.entity.Institution;
import com.cloudbridge.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 지도 관련 데이터(지도키 + 기관정보)를 제공하는 컨트롤러
 * - /api/map/config: 지도 클라이언트 ID 제공
 * - /api/offices: 관공서 목록 제공
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MapController {

    private final InstitutionRepository institutionRepository;

    // ✅ application.properties 또는 application.yml 에서 Client ID 읽어오기
    @Value("${naver.map.client-id}")
    private String naverMapClientId;

    /**
     * ✅ API 1: 네이버 지도 Client ID 반환
     * 프론트엔드가 /api/map/config 로 호출하면 아래 JSON 응답이 내려감:
     * { "clientId": "tbn355x42m" }
     */
    @GetMapping("/map/config")
    public MapConfigDto getMapConfig() {
        return new MapConfigDto(naverMapClientId);
    }

    /**
     * ✅ API 2: 관공서 목록 반환
     * 프론트엔드가 /api/offices 로 호출하면 DB 데이터를 DTO로 변환 후 반환.
     */
    @GetMapping("/offices")
    public ResponseEntity<List<OfficeDto>> getAllOffices() {
        try {
            // 1️⃣ DB에서 모든 기관 조회
            List<Institution> institutions = institutionRepository.findAllNative();

            // 2️⃣ DTO 변환 + 유효한 위치만 필터링
            List<OfficeDto> officeDtos = institutions.stream()
                    .map(OfficeDto::fromEntity)
                    .filter(dto -> dto.getMapPosition() != null)
                    .collect(Collectors.toList());

            // 3️⃣ 정상 응답 반환
            return ResponseEntity.ok(officeDtos);

        } catch (Exception e) {
            System.err.println("🚨 [MapController] /api/offices 처리 중 오류 발생:");
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
