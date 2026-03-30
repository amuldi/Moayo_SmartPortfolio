import { Palette, Type, Layout, Moon, Sun, Database, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import useSettingsStore, { ACCENT_PRESETS } from '../store/settingsStore.js'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: 'var(--accent)' }} />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme, accentKey, setAccent, fontSize, setFontSize, density, setDensity } = useSettingsStore()
  const { token, logout } = useAuthStore()
  const { reset, loadFromServer } = usePortfolioStore()

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* 헤더 */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">설정</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">앱 표시 방식과 데이터를 관리하세요</p>
        </div>

        {/* 테마 & 색상 */}
        <Section icon={Palette} title="화면 설정">
          {/* 테마 */}
          <div className="mb-6">
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">테마</p>
            <div className="flex gap-3">
              {[
                { id: 'dark',  label: '다크 모드',  icon: Moon },
                { id: 'light', label: '라이트 모드', icon: Sun  },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border text-xs font-medium transition-all',
                    theme === id
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 액센트 색상 */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">강조 색상</p>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setAccent(key)}
                  title={preset.label}
                  className={clsx(
                    'w-9 h-9 rounded-full border-2 transition-all duration-150',
                    accentKey === key ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  )}
                  style={{ background: preset.value }}
                >
                  {accentKey === key && (
                    <span className="flex items-center justify-center w-full h-full text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              선택됨:{' '}
              <span className="font-medium" style={{ color: 'var(--accent)' }}>
                {ACCENT_PRESETS[accentKey]?.label}
              </span>
            </p>
          </div>
        </Section>

        {/* 글자 크기 */}
        <Section icon={Type} title="글자 크기">
          <div className="flex gap-2">
            {[
              { id: 'small',   label: '작게',   size: '12px', desc: '더 많은 정보 표시' },
              { id: 'default', label: '기본',   size: '14px', desc: '기본값'           },
              { id: 'large',   label: '크게',   size: '16px', desc: '가독성 우선'      },
            ].map(({ id, label, size, desc }) => (
              <button
                key={id}
                onClick={() => setFontSize(id)}
                className={clsx(
                  'flex-1 px-3 py-3 rounded-[var(--radius-md)] border text-left transition-all',
                  fontSize === id
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--accent)]'
                )}
              >
                <p className={clsx('font-semibold', fontSize === id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}
                   style={{ fontSize: size }}>
                  {label}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* 레이아웃 밀도 */}
        <Section icon={Layout} title="레이아웃 밀도">
          <div className="flex gap-2">
            {[
              { id: 'compact',     label: '빽빽하게', desc: '정보 밀도 최대화'   },
              { id: 'comfortable', label: '기본',     desc: '균형 잡힌 배치'     },
              { id: 'spacious',    label: '여유롭게', desc: '넓은 여백 우선'     },
            ].map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => setDensity(id)}
                className={clsx(
                  'flex-1 px-3 py-3 rounded-[var(--radius-md)] border text-left transition-all',
                  density === id
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--accent)]'
                )}
              >
                <p className={clsx('text-xs font-medium', density === id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
                  {label}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database size={14} style={{ color: 'var(--accent)' }} />
              <CardTitle>데이터 관리</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--warning-soft)] border border-[var(--warning)]/30">
              <p className="text-xs font-semibold text-[var(--warning)] mb-1">주의</p>
              <p className="text-xs text-[var(--text-secondary)]">
                포트폴리오 데이터는 브라우저 로컬 스토리지에 저장됩니다.
                초기화하면 모든 계좌, 종목, 목표 포트폴리오 정보가 삭제되며 복구할 수 없습니다.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={RotateCcw}
              onClick={async () => {
                if (!confirm('모든 포트폴리오 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return
                try {
                  await fetch('/api/portfolio', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ accounts: [] }),
                  })
                  await loadFromServer(token)
                } catch {
                  alert('초기화 중 오류가 발생했습니다')
                }
              }}
            >
              데이터 초기화
            </Button>
          </CardBody>
        </Card>

        {/* 앱 정보 */}
        <div className="text-center py-4">
          <p className="text-xs text-[var(--text-muted)]">주식 포트폴리오 매니저 v2.0</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">React · Vite · Zustand · Recharts</p>
        </div>

      </div>
    </div>
  )
}
