package com.cloudbridge.dto;

import com.cloudbridge.entity.Institution;
import com.cloudbridge.dto.MapPositionDto;
import lombok.Builder;
import lombok.Getter;

/**
 * 프론트엔드에 관공서 정보를 전달하기 위한 DTO
 */
@Getter
@Builder
public class OfficeDto {
    private String id;
    private String name;
    private String category;
    private String address;
    private double distanceKm;
    private String phone;
    private String openingHours;
    private MapPositionDto mapPosition;

    /**
     * Institution 엔티티를 OfficeDto로 변환하는 정적 메소드
     */
    public static OfficeDto fromEntity(Institution entity) {

        MapPositionDto position = null;

        // 💡 Institution 엔티티의 String 타입 좌표를 Double로 변환하는 안전한 로직
        // NumberFormatException을 방지하기 위해 try-catch를 적용합니다.
        if (entity.getLatitude() != null && entity.getLongitude() != null) {
            try {
                position = new MapPositionDto(
                        Double.parseDouble(entity.getLatitude()),  // String -> Double 파싱
                        Double.parseDouble(entity.getLongitude())  // String -> Double 파싱
                );
            } catch (NumberFormatException e) {
                // 파싱 실패 시 예외 처리 (로그는 MapController에서 출력됨)
                position = null;
            }
        }

        return OfficeDto.builder()
                .id(entity.getInstitutionId())
                .name(entity.getInstName())
                .address(entity.getAddress())
                .mapPosition(position)
                .category("institution") // 임시 카테고리 (필요 시 DB에서 추가 필드로 매핑)
                .distanceKm(0.0) // 임시 거리 (추후 계산 로직 추가 필요)
                .build();
    }
}