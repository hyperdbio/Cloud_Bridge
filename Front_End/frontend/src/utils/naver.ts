const NAVER_CLIENT_ID = 'tbn355x42m'

export type NaverLatLng = unknown
export interface NaverLatLngBounds {
  extend: (latLng: NaverLatLng) => void
}
export interface NaverMapInstance {
  setCenter: (latLng: NaverLatLng) => void
  setZoom: (zoom: number) => void
  panTo: (latLng: NaverLatLng) => void
  fitBounds: (bounds: NaverLatLngBounds) => void
}
export interface NaverMarkerInstance {
  setMap: (map: NaverMapInstance | null) => void
}
interface NaverMapsNamespace {
  Map: new (container: HTMLElement, options: { center: NaverLatLng; zoom?: number }) => NaverMapInstance
  LatLng: new (lat: number, lng: number) => NaverLatLng
  Marker: new (options: { map: NaverMapInstance; position: NaverLatLng; title?: string }) => NaverMarkerInstance
  LatLngBounds: new (southWest: NaverLatLng, northEast: NaverLatLng) => NaverLatLngBounds
}

declare global {
  interface Window {
    naver?: {
      maps: NaverMapsNamespace
    }
  }
}

let naverScriptPromise: Promise<void> | null = null

export const loadNaverMap = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window is not defined'))
  }
  if (window.naver && window.naver.maps) {
    return Promise.resolve()
  }
  if (!naverScriptPromise) {
    naverScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`
      script.async = true
      script.onload = () => {
        if (!window.naver || !window.naver.maps) {
          reject(new Error('naver global not available'))
          return
        }
        resolve()
      }
      script.onerror = () => reject(new Error('Naver maps script failed to load'))
      document.head.appendChild(script)
    })
  }
  return naverScriptPromise
}

export {}
