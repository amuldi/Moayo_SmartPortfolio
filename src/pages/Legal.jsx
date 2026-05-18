import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { BrandIcon } from '../components/ui/BrandIcon.jsx'

const PAGES = {
  terms: {
    title: '이용약관',
    sections: [
      ['서비스 성격', 'Moayo는 사용자가 직접 입력한 자산 정보를 정리하고 목표 비중 대비 차이를 보여주는 포트폴리오 관리 도구입니다.'],
      ['사용자 책임', '입력 데이터의 정확성, 최종 투자 판단, 실제 거래 실행 여부는 사용자 본인의 책임입니다.'],
      ['서비스 제한', '시세와 분석 정보는 지연되거나 누락될 수 있으며, 서비스는 특정 수익률이나 투자 성과를 보장하지 않습니다.'],
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    sections: [
      ['수집 정보', '이메일, 사용자 이름, 인증 제공자 식별자, 사용자가 직접 입력한 포트폴리오 데이터를 저장합니다.'],
      ['이용 목적', '계정 인증, 포트폴리오 저장/복원, 서비스 품질 개선, 장애 대응 목적으로만 사용합니다.'],
      ['보관과 삭제', '사용자가 계정 삭제를 요청하면 법령상 보존 의무가 있는 정보를 제외하고 관련 데이터를 삭제합니다.'],
    ],
  },
  disclaimer: {
    title: '투자 참고 고지',
    sections: [
      ['투자 자문 아님', 'Moayo의 분석, 리밸런싱 차이, 백테스트, 세금 메모는 투자 자문이나 매매 권유가 아닌 참고 정보입니다.'],
      ['데이터 한계', '무료 시세 데이터와 사용자가 입력한 정보를 기반으로 계산하므로 실제 증권사 평가금액과 다를 수 있습니다.'],
      ['최종 판단', '투자 결정 전 세금, 수수료, 상품 설명서, 본인의 재무 상황을 별도로 확인해야 합니다.'],
    ],
  },
}

export default function Legal() {
  const { page } = useParams()
  const location = useLocation()
  const resolvedPage = page || location.pathname.replace('/', '')
  const content = PAGES[resolvedPage]
  if (!content) return <Navigate to="/terms" replace />

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandIcon size={24} />
            <span className="text-sm font-bold">Moay<span className="text-[var(--accent)]">o</span></span>
          </Link>
          <Link to="/" className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          공개 베타 운영을 위한 기본 고지입니다. 정식 서비스 전 법무 검토를 거쳐 보완됩니다.
        </p>
        <div className="mt-8 grid gap-4">
          {content.sections.map(([title, body]) => (
            <section key={title} className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
