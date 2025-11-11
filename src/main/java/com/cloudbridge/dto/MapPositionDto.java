package com.cloudbridge.dto;

import lombok.Getter;

/**
 * 위도(lat)와 경도(lng)를 담기 위한 DTO
 * OfficeDto에서 사용됩니다.
 */
@Getter
public class MapPositionDto {
    private double lat;
    private double lng;

    public MapPositionDto(double lat, double lng) {
        this.lat = lat;
        this.lng = lng;
    }
}