import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LineChart, PieChart, Wallet } from 'lucide-react'
import { BrandIcon } from '../components/ui/BrandIcon.jsx'
import { Button } from '../components/ui/Button.jsx'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'

const MARKET_TICKERS = [
  ['KOSPI', '2,742.10', '+0.84%'],
  ['KOSDAQ', '861.22', '+1.12%'],
  ['USD/KRW', '1,356.40', '-0.18%'],
  ['S&P 500', '5,308.15', '+0.31%'],
]

const HOLDINGS = [
  ['삼성전자', '18,420,000원', '+4.2%', '18%'],
  ['KODEX 200', '14,180,000원', '+1.1%', '14%'],
  ['TIGER 미국S&P500', '21,900,000원', '+8.7%', '22%'],
  ['채권 ETF', '9,840,000원', '-0.3%', '10%'],
]

function MarketTicker() {
  return (
    <div className="border-y border-[#E5E7EB] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#EEF2F7] px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6">
        {MARKET_TICKERS.map(([name, value, change]) => (
          <div key={name} className="flex items-center justify-between gap-3 px-3 py-3 first:pl-0 last:pr-0">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#667085]">{name}</p>
              <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-[#101828]">{value}</p>
            </div>
            <span className={change.startsWith('+') ? 'text-xs font-semibold text-[#E5484D]' : 'text-xs font-semibold text-[#2563EB]'}>
              {change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllocationDonut() {
  return (
    <div className="relative h-28 w-28 shrink-0 rounded-full bg-[conic-gradient(#2563EB_0deg_142deg,#1F7A8C_142deg_245deg,#DDEB57_245deg_318deg,#E5E7EB_318deg_360deg)]">
      <div className="absolute inset-6 rounded-full bg-white" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold tabular-nums text-[#101828]">92</p>
          <p className="text-[10px] font-medium text-[#667085]">score</p>
        </div>
      </div>
    </div>
  )
}

function PortfolioPreview() {
  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[8px] border border-[#D9E2EC] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <BrandIcon size={24} />
          <p className="text-sm font-semibold text-[#101828]">Moayo</p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-[#667085] sm:flex">
          <LineChart size={13} />
          Live
        </div>
      </div>

      <div className="grid bg-[#F8FAFC] lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085]">총 자산</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-normal text-[#101828]">128,420,000원</h2>
            </div>
            <span className="w-fit rounded-[6px] bg-[#ECFDF3] px-2.5 py-1 text-xs font-semibold text-[#039855]">
              +12.4%
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['평가 손익', '+8,340,000원'],
              ['현금 비중', '8.6%'],
              ['주의 항목', '3건'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-[#E5E7EB] bg-white p-4">
                <p className="text-xs font-medium text-[#667085]">{label}</p>
                <p className="mt-2 text-lg font-semibold tabular-nums text-[#101828]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[8px] border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#101828]">수익률</p>
              <span className="text-xs font-semibold text-[#E5484D]">+18.2%</span>
            </div>
            <svg viewBox="0 0 520 180" className="h-44 w-full" role="img" aria-label="포트폴리오 수익률 차트">
              <path d="M20 145H500M20 100H500M20 55H500" stroke="#EEF2F7" strokeWidth="1" />
              <path d="M28 140L88 120L144 128L202 92L260 108L318 62L382 46L482 26V155H28Z" fill="#2563EB" opacity="0.10" />
              <path d="M28 140L88 120L144 128L202 92L260 108L318 62L382 46L482 26" fill="none" stroke="#2563EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            </svg>
          </div>

          <div className="mt-4 overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white">
            {HOLDINGS.map(([name, amount, change, weight]) => (
              <div key={name} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[#EEF2F7] px-4 py-3 text-sm last:border-b-0">
                <span className="min-w-0 truncate font-medium text-[#101828]">{name}</span>
                <span className="tabular-nums text-[#475467]">{amount}</span>
                <span className={change.startsWith('+') ? 'font-semibold text-[#E5484D]' : 'font-semibold text-[#2563EB]'}>
                  {change} · {weight}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="border-t border-[#E5E7EB] bg-white p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2">
            <PieChart size={15} className="text-[#2563EB]" />
            <p className="text-sm font-semibold text-[#101828]">배분</p>
          </div>
          <div className="mt-5 flex justify-center">
            <AllocationDonut />
          </div>
          <div className="mt-5 space-y-2 text-xs font-medium text-[#667085]">
            <div className="flex justify-between"><span>해외주식</span><span>44%</span></div>
            <div className="flex justify-between"><span>국내주식</span><span>38%</span></div>
            <div className="flex justify-between"><span>채권·현금</span><span>18%</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { enterGuestMode } = useAuthStore()
  const { markLoaded } = usePortfolioStore()

  const startGuest = () => {
    enterGuestMode()
    markLoaded()
    navigate('/portfolio')
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#101828]">
      <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandIcon size={28} />
            <span className="text-lg font-semibold tracking-normal text-[#101828]">Moayo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-[6px] px-3 py-2 text-sm font-medium text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828] sm:inline-flex">
              로그인
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-[#101828] hover:bg-[#1D2939]">
                시작하기
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 text-center sm:px-6 lg:pt-20">
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#101828] sm:text-6xl lg:text-7xl">
            Moayo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl font-medium leading-8 text-[#344054] sm:text-2xl">
            한국 주식 포트폴리오를 한곳에서 정리합니다.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" icon={Wallet} onClick={startGuest} className="h-12 bg-[#101828] px-6 hover:bg-[#1D2939]">
              게스트로 시작
            </Button>
            <Link to="/register">
              <Button size="lg" variant="secondary" iconRight={ArrowRight} className="h-12 w-full border-[#D0D5DD] bg-white px-6 sm:w-auto">
                계정 만들기
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium text-[#667085]">
            {['계좌 통합', '실시간 시세', '목표 비중', '리밸런싱'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#D9E2EC] bg-white px-3 py-1.5">
                <CheckCircle2 size={12} className="text-[#2563EB]" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-6">
          <PortfolioPreview />
        </div>

        <MarketTicker />
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <BrandIcon size={18} />
            <span className="font-medium text-[#475467]">Moayo</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/terms" className="hover:text-[#101828]">이용약관</Link>
            <Link to="/privacy" className="hover:text-[#101828]">개인정보처리방침</Link>
            <Link to="/disclaimer" className="hover:text-[#101828]">고지</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
