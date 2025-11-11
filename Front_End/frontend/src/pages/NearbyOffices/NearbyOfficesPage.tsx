import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NearbyOfficesPage.module.css'
import {
  loadNaverMap,
  type NaverMapInstance,
  type NaverMarkerInstance,
} from '../../utils/naver'

type OfficeCategory = 'all' | 'welfare' | 'civil' | 'employment'
type RegionOption = {
  id: string
  label: string
  center: { lat: number; lng: number }
}
type OfficeInfo = {
  id: string
  name: string
  category: OfficeCategory
  regionId: RegionOption['id']
  address: string
  distanceKm: number
  phone?: string
  openingHours?: string
  mapPosition: { lat: number; lng: number }
}

const regions: RegionOption[] = [
  { id: 'gwangju-dong', label: '광주광역시 동구', center: { lat: 35.146, lng: 126.9235 } },
  { id: 'gwangju-seo', label: '광주광역시 서구', center: { lat: 35.1522, lng: 126.8912 } },
  { id: 'gwangju-nam', label: '광주광역시 남구', center: { lat: 35.1294, lng: 126.9027 } },
  { id: 'gwangju-buk', label: '광주광역시 북구', center: { lat: 35.1743, lng: 126.9121 } },
  { id: 'gwangju-gwangsan', label: '광주광역시 광산구', center: { lat: 35.1394, lng: 126.7931 } },
]

// TODO: 추후 백엔드 API와 연동해 offices 데이터를 받아오세요.

const NearbyOfficesPage = () => {
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption['id']>(regions[0].id)
  const [offices, setOffices] = useState<OfficeInfo[]>([])
  const mapRef = useRef<NaverMapInstance | null>(null)
  const markersRef = useRef<NaverMarkerInstance[]>([])

  const filteredOffices = useMemo(
    () => offices.filter((office) => office.regionId === selectedRegion),
    [offices, selectedRegion],
  )
  const selectedRegionInfo = regions.find((region) => region.id === selectedRegion) ?? regions[0]

  useEffect(() => {
    // TODO: API 연동 시 setOffices(서버에서 받아온 데이터) 로 교체하세요.
    setOffices([])
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mapContainer = document.getElementById('nearby-map')
    if (!mapContainer) return

    let canceled = false

    loadNaverMap()
      .then(() => {
        if (canceled) return
        const container = document.getElementById('nearby-map')
        if (!container || !window.naver) return
        const center = new window.naver.maps.LatLng(regions[0].center.lat, regions[0].center.lng)
        mapRef.current = new window.naver.maps.Map(container, {
          center,
          zoom: 12,
        })
        setMapError(null)
      })
      .catch((error) => {
        console.error('네이버 지도 로드 실패', error)
        if (!canceled) {
          setMapError('지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        }
      })

    return () => {
      canceled = true
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!window.naver || !mapRef.current) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    const regionCenter = new window.naver.maps.LatLng(
      selectedRegionInfo.center.lat,
      selectedRegionInfo.center.lng,
    )

    const regionMarker = new window.naver.maps.Marker({
      map: mapRef.current,
      position: regionCenter,
      title: `${selectedRegionInfo.label}청`,
    })
    markersRef.current.push(regionMarker)

    if (filteredOffices.length === 0) {
      mapRef.current.setCenter(regionCenter)
      mapRef.current.setZoom(12)
      return
    }

    const bounds = new window.naver.maps.LatLngBounds(regionCenter, regionCenter)
    filteredOffices.forEach((office) => {
      const position = new window.naver.maps.LatLng(office.mapPosition.lat, office.mapPosition.lng)
      const marker = new window.naver.maps.Marker({
        map: mapRef.current!,
        position,
        title: office.name,
      })
      markersRef.current.push(marker)
      bounds.extend(position)
    })
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds)
    }
  }, [
    filteredOffices,
    selectedRegionInfo.center.lat,
    selectedRegionInfo.center.lng,
    selectedRegionInfo.label,
  ])

  const focusOfficeOnMap = (officeId: string) => {
    if (!mapRef.current || !window.naver) return
    const target = filteredOffices.find((office) => office.id === officeId)
    if (!target) return
    const position = new window.naver.maps.LatLng(target.mapPosition.lat, target.mapPosition.lng)
    mapRef.current.setZoom(14)
    mapRef.current.panTo(position)
  }

  return (
    <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.pageTitle}>
            <h1>가까운 관공서 찾기</h1>
            <p>내 주변의 복지·민원 기관을 지도에서 바로 확인하고, 연락처와 운영시간도 함께 살펴보세요.</p>
          </div>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="region-select">검색 지역</label>
              <select
                id="region-select"
                className={styles.selectControl}
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.mapSection}>
            <div
              id="nearby-map"
              className={styles.mapFrame}
              aria-label="관공서 위치 지도"
            >
              {mapError ? (
                <div className={styles.mapError}>{mapError}</div>
              ) : (
                <span className={styles.mapPlaceholder}>지도 로딩 중…</span>
              )}
            </div>
            <p className={styles.mapHelper}>지도를 확대·축소하거나 마커를 눌러 상세 정보를 확인하세요.</p>
          </section>

          <section className={styles.listSection}>
            <div className={styles.regionSummary}>
              <h2>{selectedRegionInfo.label}</h2>
              
            </div>
            {filteredOffices.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>{selectedRegionInfo.label}에서 등록된 관공서를 찾지 못했습니다.</strong>
                <span>다른 지역을 선택하거나 나중에 다시 확인해 주세요.</span>
              </div>
            ) : (
              filteredOffices.map((office) => (
                <article key={office.id} className={styles.officeCard}>
                  <header>
                    <h3>{office.name}</h3>
                    <span className={styles.badge}>{office.category}</span>
                  </header>
                  <p className={styles.meta}>{office.address}</p>
                  <p className={styles.meta}>거리 약 {office.distanceKm}km</p>
                  {office.phone && <p>전화: {office.phone}</p>}
                  {office.openingHours && <p>운영 시간: {office.openingHours}</p>}
                  <button
                    type="button"
                    className={styles.focusButton}
                    onClick={() => focusOfficeOnMap(office.id)}
                  >
                    지도에서 보기
                  </button>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    )
  }

  export default NearbyOfficesPage
