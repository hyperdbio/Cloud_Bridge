package com.cloudbridge.controller;

import com.cloudbridge.dto.OfficeDto;
import com.cloudbridge.entity.Institution;
import com.cloudbridge.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * [주의] DB의 관공서(기관) 정보를 프론트로 전달하는 로직은 MapController로 이동되었습니다.
 * 이 컨트롤러는 더 이상 사용되지 않거나, 다른 전용 기능을 위해 남겨두는 경우에만 존재해야 합니다.
 * 현재 이 파일에는 활성화된 엔드포인트가 없습니다.
 */
@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5180", "http://127.0.0.1:5180"})
public class OfficeController {

    private final InstitutionRepository institutionRepository;

    // 기존의 getAllOffices() 메서드는 MapController.java로 이동되었으므로 삭제되었습니다.
}
