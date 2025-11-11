import { useCallback, useMemo, useState } from 'react'
import { guidanceContent } from '../../data/serviceGuidance'
import { ChatbotInput } from '../../components/chatbot/ChatbotInput'
import { ChatbotGuidance } from '../../components/chatbot/ChatbotGuidance'
import { LeftNavRail } from '../../components/navigation/LeftNavRail'
import {
  buildGuidanceSearchSuggestion,
  getServiceDetail,
  searchServices,
} from '../../utils/guidanceSearch'
import type { ServiceGuidanceDetail } from '../../types/guidance'
import styles from './HomePage.module.css'

type ChatbotStatus = 'idle' | 'success' | 'not-found'

export const HomePage = () => {
  // 랜딩 화면에서도 즉시 안내가 보이도록 챗봇 위젯과 동일한 상태를 가집니다.
  // 상태 구조를 바꾸면 ChatbotWidget.tsx와 동기화 로직이 달라질 수 있으니 함께 수정하세요.
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ChatbotStatus>('idle')
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const detail: ServiceGuidanceDetail | null = useMemo(() => {
    if (!selectedServiceId) return null
    return getServiceDetail(selectedServiceId, guidanceContent)
  }, [selectedServiceId])

  const handleSearch = useCallback(
    (input: string) => {
      if (!input) {
        setStatus('idle')
        setSelectedServiceId(null)
        return
      }

      const found = searchServices(input, guidanceContent)

      if (found.length === 0) {
        setStatus('not-found')
        setSelectedServiceId(null)
        return
      }

      setSelectedServiceId(found[0].id)
      setStatus('success')
    },
    [],
  )

  const handleReset = useCallback(() => {
    setQuery('')
    setStatus('idle')
    setSelectedServiceId(null)
  }, [])

  return (
    <div className={styles.page}>
      {/* 좌측 네비게이션과 본문을 2열로 묶어 데스크톱에서 섹션 이동을 돕습니다. */}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <LeftNavRail />
          </div>
        </aside>
        <div className={styles.sectionStack}>
          {/* 히어로 영역: 서비스 소개와 챗봇 섹션으로 이동하는 링크를 제공합니다.
              텍스트나 강조 색상을 바꾸려면 HomePage.module.css와 함께 조정하세요. */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <p className={styles.sectionLabel}>공공복지 안내</p>
              <h1 className={styles.heading}>
                민원 서류 준비 챗봇이 안내해 줄게요
              </h1>
              <p className={styles.description}>
                궁금한 민원명을 입력하면 온라인·오프라인 준비방법을 한 번에 알려드립니다.
              </p>
              <a className={styles.cta} href="\#chatbot">
                챗봇에게 민원 물어보기
              </a>
            </div>
            
          </section>


          {/* 챗봇 구간: 페이지 이동 없이 민원 안내 흐름을 체험할 수 있습니다.
              이곳의 배치를 변경하면 챗봇 위젯과 내용이 중복되지 않도록 주의하세요. */}
          <section
            id="chatbot"
            data-section
            data-title="챗봇 안내"
            className={styles.chatbotShell}
            style={{ scrollMarginTop: '80px' }}
          >
            <h2>챗봇으로 바로 민원 안내 받기</h2>
            <p className={styles.helperText}>
              상황과 사유를 입력하면 단계별로 안내해드립니다.
            </p>
            <ChatbotInput
              value={query}
              onChange={setQuery}
              onSubmit={(value) => {
                setQuery(value)
                handleSearch(value)
              }}
              suggestion={buildGuidanceSearchSuggestion(query)}
            />
            <ChatbotGuidance
              status={status}
              query={query}
              detail={detail}
              onReset={handleReset}
            />
          </section>
          
        </div>
      </div>
    </div>
  )
}

export default HomePage
