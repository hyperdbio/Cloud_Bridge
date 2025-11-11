import { useNavigate } from 'react-router-dom'
import type { ServiceGuidanceDetail } from '../../types/guidance'
import styles from './ChatbotGuidance.module.css'

type GuidanceStatus = 'idle' | 'success' | 'not-found'

type ChatbotGuidanceProps = {
  status: GuidanceStatus
  query: string
  detail: ServiceGuidanceDetail | null
  onReset: () => void
}

// NOTE: 메인 화면에 정적으로 노출되는 챗봇 안내 카드 컴포넌트입니다.
// 실시간 대화 느낌이 필요한 위젯(우측 하단)과는 별도로 유지합니다.
export const ChatbotGuidance = ({
  status,
  query,
  detail,
  onReset,
}: ChatbotGuidanceProps) => {
  const navigate = useNavigate()
  if (status === 'idle') {
    return (
      <div className={styles.placeholder}>
        {/* 아직 검색하지 않은 상태: 예시 질문을 제공해서 방향을 제시합니다. */}
        <p>궁금한 민원을 입력하면 맞춤 안내를 보여드릴게요.</p>
        <ul>
          <li>“내 생애 최초 주택 자금 대출 조건”</li>
          <li>“광주 청년 월세 지원 기간”</li>
          <li>“주택도시기금 서류 체크”</li>
        </ul>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className={styles.empty}>
        {/* 검색 결과가 없을 때는 메시지와 재검색 버튼만 깔끔하게 보여줍니다. */}
        <h3>해당 민원 정보를 찾을 수 없습니다</h3>
        <p>
          <strong>{query}</strong>와(과) 비슷한 공공복지 민원 정보를 찾을 수 없었습니다. 다른 표현으로
          다시 검색해 보시겠어요?
        </p>
        <button type="button" onClick={onReset} className={styles.resetButton}>
          다른 민원 검색하기
        </button>
      </div>
    )
  }

  if (!detail) return null

  const documentNameMap = new Map(
    detail.documentChecklistDetails.map((doc) => [doc.id, doc.name]),
  )

  const formatDocumentList = (documentIds: string[] = []) =>
    // 각 단계에서 필요한 서류를 보기 좋게 쉼표로 묶어서 보여줍니다.
    documentIds.map((id) => documentNameMap.get(id) ?? id).join(', ')

  return (
    <div className={styles.result}>
      <header className={styles.header}>
        <div>
          <p className={styles.lead}>챗봇 추천 민원</p>
          <h2>{detail.title}</h2>
          <p className={styles.summary}>{detail.summary}</p>
        </div>
        <button type="button" onClick={onReset} className={styles.resetButton}>
          다른 민원 찾기
        </button>
      </header>

      <section className={styles.section}>
        <h3>지원 대상 요약</h3>
        <ul className={styles.bulletList}>
          {detail.eligibilityHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.stepGroup}>
        <article>
          <h3>온라인 신청 단계</h3>
          <ol className={styles.stepList}>
            {detail.onlineSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                  <p className={styles.stepNote}>
                    준비 서류: {formatDocumentList(step.requiredDocuments)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </article>
        <article>
          <h3>방문 신청 단계</h3>
          <ol className={styles.stepList}>
            {detail.offlineSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                {step.estimatedTime && (
                  <p className={styles.stepNote}>예상 소요시간: {step.estimatedTime}</p>
                )}
                {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                  <p className={styles.stepNote}>
                    준비 서류: {formatDocumentList(step.requiredDocuments)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </article>
        <div className={styles.ctaRow}>
          {/* 상세 체크리스트로 이동하는 메인 버튼 (가운데 정렬) */}
          <button
            type="button"
            onClick={() => navigate(`/services/${detail.id}/checklist`)}
            className={styles.ctaButton}
          >
            필수 서류 체크리스트 보기
          </button>
        </div>
      </section>

      

    </div>
  )
}

export default ChatbotGuidance
