import { Link } from 'react-router-dom'
import { BarChart3, ShieldCheck, Sparkles, ArrowRight, TrendingUp, PieChart, Zap, CheckCircle2 } from 'lucide-react'
import { BrandIcon } from '../components/ui/BrandIcon.jsx'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'

// ── 히어로 섹션용 Mock 미니 차트 ─────────────────────────
function MiniSparkline({ color = '#5BA3CF', up = true }) {
  const points = up
    ? '0,60 20,52 40,45 60,38 80,28 100,18 120,22 140,12 160,8 180,14 200,4'
    : '0,10 20,18 40,28 60,22 80,35 100,30 120,40 140,38 160,48 180,44 200,55'
  return (
    <svg viewBox="0 0 200 70" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,70 ${points} 200,70`}
        fill={`url(#grad-${color.replace('#','')})`}
      />
    </svg>
  )
}

// ── 히어로 Mock 카드들 ────────────────────────────────────
function HeroCard({ ticker, name, price, change, up, color, delay = '0s' }) {
  return (
    <div
      className="rounded-2xl border p-4 backdrop-blur-sm animate-float"
      style={{
        background: 'rgba(255,255,255,0.85)',
        borderColor: '#E2E8F0',
        boxShadow: '0 8px 32px rgba(15,23,42,0.10)',
        animationDelay: delay,
        minWidth: '180px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] font-mono text-slate-400">{ticker}</p>
          <p className="text-sm font-bold text-slate-800 leading-tight">{name}</p>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: up ? '#ECFDF5' : '#FEF2F2', color: up ? '#10B981' : '#EF4444' }}
        >
          {up ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900 mb-2">{price}</p>
      <div className="h-10">
        <MiniSparkline color={color} up={up} />
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: PieChart,
    title: '현재 구조 빠른 진단',
    desc: '보유 종목과 계좌 종류를 입력하면 집중도, 섹터 쏠림, 계좌 역할 충돌을 바로 정리합니다.',
  },
  {
    icon: ShieldCheck,
    title: '계좌별 역할 가이드',
    desc: 'ISA, 연금저축, 종합계좌를 성장·절세·장기 적립 관점으로 나눠 조정 우선순위를 제안합니다.',
  },
  {
    icon: Sparkles,
    title: '추천 포트폴리오 비교',
    desc: '성장형, 균형형, 배당형 등 목표에 맞는 대안을 카드형으로 비교하고 바로 선택할 수 있습니다.',
  },
  {
    icon: TrendingUp,
    title: '포트폴리오 조정안',
    desc: '지금 무엇을 줄이고 무엇을 늘려야 하는지, 한 번에 바꿀지 나눠 바꿀지까지 자연어로 보여줍니다.',
  },
  {
    icon: Zap,
    title: '공유 가능한 결과 화면',
    desc: '진단 결과와 조정 가이드를 저장하고 다시 보거나 요약 문구로 공유할 수 있습니다.',
  },
  {
    icon: BarChart3,
    title: '예시 포트폴리오 체험',
    desc: '로그인 없이도 예시 데이터를 불러와 결과 화면까지 바로 체험할 수 있습니다.',
  },
]

const STATS = [
  { value: '5+',   label: '지원 계좌 유형' },
  { value: '100+', label: '국내외 종목' },
  { value: '6년',  label: '백테스팅 기간' },
  { value: '즉시', label: '조정안 생성' },
]

export default function Landing() {
  const { enterGuestMode } = useAuthStore()
  const { markLoaded } = usePortfolioStore()

  const handleGuestMode = () => {
    enterGuestMode()
    markLoaded()
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC', color: '#0F172A' }}>

      {/* ── 네비게이션 ─────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(248,250,252,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandIcon size={26} />
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Moay<span style={{ color: '#5BA3CF' }}>o</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90"
              style={{ background: '#5BA3CF' }}
            >
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 히어로 ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* 텍스트 */}
          <div className="animate-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(91,163,207,0.12)', color: '#5BA3CF' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5BA3CF] animate-pulse" />
              리밸런싱 워크스페이스
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              내 포트폴리오<br />
              <span style={{
                background: 'linear-gradient(135deg, #5BA3CF, #7BBFE0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                진단 받으러 가기
              </span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
              현재 포트폴리오 구조를 진단하고, 더 나은 목표 포트폴리오와
              계좌별 매수·매도 순서를 한 번에 정리하세요.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ background: '#5BA3CF', boxShadow: '0 4px 16px rgba(91,163,207,0.40)' }}
              >
                바로 포트폴리오 진단받기
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 transition-all"
              >
                로그인
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>로그인 없이 체험 · 예시 포트폴리오 제공</span>
              <Link to="/home" onClick={handleGuestMode} className="font-medium text-[#5BA3CF] hover:underline">
                로그인 없이 진단받기
              </Link>
            </div>
          </div>

          {/* Mock 카드 비주얼 */}
          <div className="relative h-72 lg:h-80 hidden lg:flex items-center justify-center">
            <div className="absolute top-0 left-8">
              <HeroCard ticker="005930" name="삼성전자" price="₩190,300" change={-4.56} up={false} color="#EF4444" delay="0s" />
            </div>
            <div className="absolute top-12 right-0">
              <HeroCard ticker="SPY" name="S&P 500 ETF" price="$648.57" change={-1.43} up={false} color="#EF4444" delay="0.8s" />
            </div>
            <div className="absolute bottom-0 left-20">
              <HeroCard ticker="QQQ" name="나스닥 ETF" price="$582.06" change={2.14} up color="#10B981" delay="1.6s" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 스탯 바 ────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 기능 그리드 ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            실행까지 이어지는 포트폴리오 앱
          </h2>
          <p className="text-slate-500">분석에서 끝나지 않고 다음 액션까지 바로 정리합니다.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(91,163,207,0.12)' }}
              >
                <f.icon size={18} style={{ color: '#5BA3CF' }} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 사용 흐름 ───────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">어떻게 쓰는지 한눈에</h2>
          <p className="text-slate-500">현재 구조를 입력하면 목표 포트폴리오와 조정 가이드를 바로 받는 흐름입니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['1. 현재 계좌 입력', '보유 종목, 수량, 계좌 종류만 입력하면 현재 구조를 진단합니다.'],
              ['2. 목표 포트폴리오 선택', '성장형·균형형·배당형 추천안을 비교하고 내게 맞는 구조를 고릅니다.'],
              ['3. 조정 가이드 확인', '무엇을 먼저 줄이고 늘릴지, 어떤 계좌에서 시작할지 바로 제안합니다.'],
            ].map(([title, desc]) => (
              <div key={title} className="p-7 rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(91,163,207,0.12)' }}>
                  <CheckCircle2 size={18} style={{ color: '#5BA3CF' }} />
                </div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ───────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-slate-500 mb-8">
          첫 포트폴리오를 만들고 조정 가이드까지 확인하는 데 오래 걸리지 않습니다.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
          style={{ background: '#5BA3CF', boxShadow: '0 4px 20px rgba(91,163,207,0.40)' }}
        >
          바로 포트폴리오 진단받기
          <ArrowRight size={15} />
        </Link>
      </section>

      {/* ── 푸터 ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandIcon size={20} />
            <span className="text-sm font-bold text-slate-700">
              Moay<span style={{ color: '#5BA3CF' }}>o</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">© 2026 Moayo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
