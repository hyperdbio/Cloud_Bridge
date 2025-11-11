import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getServiceDetail } from '../../utils/guidanceSearch'
import {
  CASES_STORAGE_KEY,
  CASES_UPDATED_EVENT,
  getCaseByServiceId,
  type CaseTrackerStatus,
  upsertCase,
} from '../../utils/caseTracker'
import {
  CHECKLIST_STORAGE_PREFIX,
  DOCUMENT_CHECKLIST_EVENT,
  readChecklist,
  toggleChecklistEntry,
  writeChecklist,
} from '../../utils/documentChecklist'
import styles from './DocumentChecklistPage.module.css'
import { loadNaverMap, type NaverMapInstance } from '../../utils/naver'

const DocumentChecklistPage = () => {
  // 항상 유효하다고 가정 → non-null 단언 사용
  const { serviceId } = useParams()
  const id = serviceId!
  const navigate = useNavigate()

  // 해당 민원 상세(문서 목록 포함). 항상 존재한다고 가정 → non-null 단언
  const detail = useMemo(() => getServiceDetail(id)!, [id])
  const docs = detail.documentChecklistDetails
  const mapContainerId = `service-map-${id}`

  const [checked, setChecked] = useState<Set<string>>(() => readChecklist(id))
  const [caseStatus, setCaseStatus] = useState<CaseTrackerStatus>(() => {
    const entry = getCaseByServiceId(id)
    return entry?.status ?? 'idle'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 체크리스트 페이지 진입 시 항상 상단부터 보여준다.
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  // 로컬 스토리지 및 커스텀 이벤트를 감지해 체크리스트·케이스 상태를 동기화한다.
  useEffect(() => {
    setChecked(readChecklist(id))
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncChecklist = () => setChecked(readChecklist(id))
    const syncCaseStatus = () => {
      const entry = getCaseByServiceId(id)
      setCaseStatus(entry?.status ?? 'idle')
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CASES_STORAGE_KEY) {
        syncCaseStatus()
      }
      if (event.key?.startsWith(CHECKLIST_STORAGE_PREFIX) && event.key.endsWith(id)) {
        syncChecklist()
      }
    }

    const handleChecklistEvent = (event: Event) => {
      const custom = event as CustomEvent<{ serviceId?: string }>
      if (!custom.detail || custom.detail.serviceId === id) syncChecklist()
    }

    const handleCasesUpdated = () => syncCaseStatus()

    syncCaseStatus()

    window.addEventListener(DOCUMENT_CHECKLIST_EVENT, handleChecklistEvent)
    window.addEventListener('storage', handleStorage)
    window.addEventListener(CASES_UPDATED_EVENT, handleCasesUpdated)

    return () => {
      window.removeEventListener(DOCUMENT_CHECKLIST_EVENT, handleChecklistEvent)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CASES_UPDATED_EVENT, handleCasesUpdated)
    }
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let map: NaverMapInstance | null = null
    let canceled = false

    loadNaverMap()
      .then(() => {
        if (canceled) return
        const container = document.getElementById(mapContainerId)
        if (!container || !window.naver) return

        const center = new window.naver.maps.LatLng(35.1595454, 126.8526012)
        map = new window.naver.maps.Map(container, {
          center,
          zoom: 13,
        })

        new window.naver.maps.Marker({
          map,
          position: center,
          title: detail.title,
        })
      })
      .catch((error) => {
        console.error('네이버 지도 로드 실패', error)
      })

    return () => {
      canceled = true
      map = null
    }
  }, [mapContainerId, detail.title])

  const allIds = docs.map((d) => d.id)
  const allDone = allIds.length > 0 && allIds.every((docId) => checked.has(docId))

  // 단일 문서 완료 상태를 토글하며 localStorage와 동기화한다.
  const toggle = (docId: string) => setChecked(new Set(toggleChecklistEntry(id, docId)))
  // 체크리스트 전체를 완료로 표시해 사용자가 빠르게 마무리할 수 있게 돕는다.
  const markAll = () => {
    writeChecklist(id, allIds)
    setChecked(new Set(allIds))
  }
  // 전체 완료 표시를 초기화해 재시작할 수 있게 한다.
  const clearAll = () => {
    writeChecklist(id, [])
    setChecked(new Set())
  }

  // 케이스 상태별 라벨. 팀원이 상태 추가 시 이 맵만 확장하면 된다.
  const statusLabelMap: Record<CaseTrackerStatus, string> = {
    idle: '미진행',
    'in-progress': '진행 중',
    completed: '완료',
  }
  const statusLabel = statusLabelMap[caseStatus] ?? '미진행'

  // 케이스를 생성하거나 갱신한 뒤 즉시 "나의 민원" 페이지로 이동시킨다.
  const handleStartCase = () => {
    // TODO: 백엔드에 "나의 민원" 진행중 케이스를 생성하는 API를 연결하세요.
    upsertCase(detail)
    setCaseStatus('in-progress')
    navigate('/my-complaints')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.lead}>필수 서류 체크리스트</p>
          <h1>{detail.title}</h1>
          <p className={styles.summary}>{detail.summary}</p>
        </div>
        <div className={styles.actions}>
          {!allDone ? (
            <button type="button" onClick={markAll} className={styles.primary}>
              모두 완료로 표시
            </button>
          ) : (
            <button type="button" onClick={clearAll} className={styles.secondary}>
              모두 초기화
            </button>
          )}
        </div>
      </header>

      {/* 표 기반 체크리스트 */}
      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" style={{ width: 72 }}>
                완료
              </th>
              <th scope="col">서류명</th>
              <th scope="col">발급기관</th>
              <th scope="col">발급 방법</th>
              <th scope="col">비고</th>
              <th scope="col">링크</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => {
              const nameId = `name-${doc.id}`
              const chkId = `chk-${doc.id}`
              return (
                <tr key={doc.id}>
                  <td>
                    <input
                      id={chkId}
                      type="checkbox"
                      aria-labelledby={nameId}
                      checked={checked.has(doc.id)}
                      onChange={() => toggle(doc.id)}
                    />
                  </td>
                  <td id={nameId} className={styles.nameCell}>
                    {doc.name}
                  </td>
                  <td className={styles.metaCell}>{doc.issuingAuthority}</td>
                  <td>{doc.availableFormats.join(', ')}</td>
                  <td>{doc.preparationNotes ?? ''}</td>
                  <td>
                    {doc.downloadUrl ? (
                      <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                        다운로드
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <div className={styles.actionCard}>
          <div>
            <h2>신청 진행 상태</h2>
            <p className={styles.actionDescription}>
              진행하기를 누르면 나의 민원으로 이동하여 체크리스트를 활용하실 수 있습니다.            </p>
            <span className={styles.statusBadge}>현재 상태: {statusLabel}</span>
          </div>
          {/* 진행하기 버튼: 체크리스트 뷰에서도 언제든 노출합니다. */}
          <button type="button" className={styles.actionButton} onClick={handleStartCase}>
            진행하기
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>상담 및 방문 안내</h2>
          
        </div>
        <div className={styles.supportGrid}>
          <div className={styles.mapRow}>
            <div className={styles.mapPanel}>
              <h3>가까운 관공서</h3>
              <div
                id={mapContainerId}
                className={styles.mapFrame}
                aria-label="관공서 위치 지도 영역"
              >
                {/* TODO: 지도 API 연동 시 이 컨테이너에 지도를 그려주세요. */}
                <span>지도 API 연동 준비 중입니다.</span>
              </div>
            </div>
          </div>
          <div className={styles.supportCardsRow}>
            {detail.supportChannelDetails.map((channel) => (
              <article key={channel.id} className={styles.supportCard}>
                <h3>{channel.name}</h3>
                <p className={styles.metaText}>{channel.type}</p>
                {channel.address && <p>{channel.address}</p>}
                {channel.hours && <p>운영시간 {channel.hours}</p>}
                {channel.contact && <p>문의 {channel.contact}</p>}
                {channel.notes && <p>{channel.notes}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DocumentChecklistPage
