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
    title: '계좌별 통합 관리',
    desc: 'ISA, 연금저축, IRP, 종합위탁, CMA — 모든 계좌를 하나의 대시보드에서.',
  },
  {
    icon: ShieldCheck,
    title: '한국 세금 최적화',
    desc: '계좌 유형별 세금 구조를 분석해 연간 절세 전략을 자동으로 수립합니다.',
  },
  {
    icon: Sparkles,
    title: 'AI 포트폴리오 진단',
    desc: '집중도 리스크, 지역 편중, 자산군 불균형을 AI가 즉시 감지하고 개선안을 제시합니다.',
  },
  {
    icon: TrendingUp,
    title: '백테스팅 엔진',
    desc: '최대 6년 시뮬레이션으로 내 포트폴리오의 과거 성과와 변동성을 검증하세요.',
  },
  {
    icon: Zap,
    title: '실시간 시세',
    desc: '국내외 전 종목을 Yahoo Finance 기반으로 실시간으로 불러옵니다. API 키 불필요.',
  },
  {
    icon: BarChart3,
    title: '벤치마크 비교',
    desc: 'S&P 500, 글로벌 시장, 올웨더 전략과 내 포트폴리오를 한 화면에서 비교합니다.',
  },
]

const STATS = [
  { value: '5+',   label: '지원 계좌 유형' },
  { value: '100+', label: '국내외 종목' },
  { value: '6년',  label: '백테스팅 기간' },
  { value: '무료', label: '가격' },
]

const PLANS = [
  {
    name: 'Free',
    price: '무료',
    desc: '개인 투자자를 위한 핵심 기능',
    features: ['포트폴리오 1개', '실시간 시세', 'AI 기본 진단', '세금 분석'],
    cta: '무료로 시작',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '월 9,900원',
    desc: '진지한 투자자를 위한 전문 기능',
    features: ['포트폴리오 무제한', '가격 알림', '백테스팅 고급', 'CSV 내보내기', 'AI 심층 분석'],
    cta: '14일 무료 체험',
    highlight: true,
  },
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
              실시간 포트폴리오 플랫폼
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              내 투자를<br />
              <span style={{
                background: 'linear-gradient(135deg, #5BA3CF, #7BBFE0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                제대로 파악하세요
              </span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
              ISA부터 연금저축까지, 흩어진 계좌를 한 곳에서 관리하고
              세금 최적화와 AI 분석으로 수익률을 높이세요.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ background: '#5BA3CF', boxShadow: '0 4px 16px rgba(91,163,207,0.40)' }}
              >
                무료로 시작하기
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
              <span>신용카드 불필요 · 즉시 시작</span>
              <Link to="/home" onClick={handleGuestMode} className="font-medium text-[#5BA3CF] hover:underline">
                로그인 없이 체험하기
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
            투자의 모든 것, 하나로
          </h2>
          <p className="text-slate-500">개인 투자자에게 필요한 도구를 한 플랫폼에 담았습니다.</p>
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

      {/* ── 요금제 ─────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">간단한 가격 정책</h2>
            <p className="text-slate-500">복잡한 요금제 없이, 필요한 기능만 선택하세요.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="p-7 rounded-2xl border"
                style={{
                  background: plan.highlight ? '#5BA3CF' : '#FFFFFF',
                  borderColor: plan.highlight ? '#5BA3CF' : '#E2E8F0',
                  boxShadow: plan.highlight ? '0 8px 32px rgba(91,163,207,0.35)' : 'none',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                  {plan.name}
                </p>
                <p className="text-2xl font-extrabold mb-1"
                  style={{ color: plan.highlight ? '#FFFFFF' : '#0F172A' }}>
                  {plan.price}
                </p>
                <p className="text-xs mb-6"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.75)' : '#64748B' }}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                      <CheckCircle2 size={14} style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#10B981', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    background: plan.highlight ? 'rgba(255,255,255,0.20)' : '#5BA3CF',
                    color: '#FFFFFF',
                    border: plan.highlight ? '1px solid rgba(255,255,255,0.30)' : 'none',
                  }}
                >
                  {plan.cta}
                </Link>
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
          가입 후 30초 안에 포트폴리오를 만들 수 있습니다.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
          style={{ background: '#5BA3CF', boxShadow: '0 4px 20px rgba(91,163,207,0.40)' }}
        >
          무료로 시작하기
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
