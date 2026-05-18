import clsx from 'clsx'
import {
  Check, Database, Layout, Moon, Palette, RotateCcw, Server, Sun, Type, User,
} from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import useSettingsStore, { ACCENT_PRESETS } from '../store/settingsStore.js'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'
import { apiFetch, readApiJson } from '../services/apiClient.js'

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon size={15} />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

function ChoiceButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'min-h-11 rounded-[var(--radius-md)] border p-3 text-left transition-all',
        active
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]'
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className={active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />}
        <p className={clsx('text-sm font-semibold', active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>{label}</p>
      </div>
    </button>
  )
}

export default function Settings() {
  const { theme, setTheme, accentKey, setAccent, fontSize, setFontSize, density, setDensity } = useSettingsStore()
  const { user, isGuest } = useAuthStore()
  const { reset, loadFromServer } = usePortfolioStore()

  const displayName = user?.username || (isGuest ? '게스트' : '사용자')
  const syncLabel = user && !isGuest ? '서버 동기화' : '브라우저 로컬 저장'

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-secondary)]">
      <div className="settings-grid mx-auto max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:py-6">
        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white">
                <User size={20} />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">설정</h1>
            </div>
            <CardBody className="space-y-3">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <p className="text-xs text-[var(--text-muted)]">접속 계정</p>
                <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <p className="text-xs text-[var(--text-muted)]">데이터 저장 방식</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{syncLabel}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <p className="text-xs text-[var(--text-muted)]">현재 화면 설정</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {theme === 'dark' ? '다크' : '라이트'} · {ACCENT_PRESETS[accentKey]?.label}
                </p>
              </div>
            </CardBody>
          </Card>

        </aside>

        <main className="space-y-5">
          <Section icon={Palette} title="화면 테마" desc="증권앱처럼 정보 대비가 분명한 톤으로 화면을 맞춥니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'light', label: '라이트 모드', desc: '업무 화면과 리포트에 적합한 밝은 배경', icon: Sun },
                { id: 'dark', label: '다크 모드', desc: '장시간 모니터링에 적합한 낮은 밝기', icon: Moon },
              ].map(({ id, label, desc, icon }) => (
                <ChoiceButton
                  key={id}
                  active={theme === id}
                  icon={icon}
                  label={label}
                  desc={desc}
                  onClick={() => setTheme(id)}
                />
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold text-[var(--text-secondary)]">강조 색상</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccent(key)}
                    className={clsx(
                      'flex items-center justify-between rounded-[var(--radius-md)] border bg-[var(--bg-elevated)] px-3 py-2 text-left transition-all',
                      accentKey === key ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--accent)]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full" style={{ background: preset.value }} />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{preset.label}</span>
                    </span>
                    {accentKey === key && <Check size={14} className="text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <div className="grid gap-5 xl:grid-cols-2">
            <Section icon={Type} title="글자 크기" desc="데이터 테이블과 카드의 읽기 밀도를 조정합니다.">
              <div className="grid gap-2">
                {[
                  { id: 'small', label: '작게', desc: '한 화면에 더 많은 종목을 표시' },
                  { id: 'default', label: '기본', desc: '기본 정보량과 가독성 균형' },
                  { id: 'large', label: '크게', desc: '숫자와 라벨 가독성 우선' },
                ].map(({ id, label, desc }) => (
                  <ChoiceButton key={id} active={fontSize === id} label={label} desc={desc} onClick={() => setFontSize(id)} />
                ))}
              </div>
            </Section>

            <Section icon={Layout} title="레이아웃 밀도" desc="반복적으로 보는 화면의 여백과 정보량을 선택합니다.">
              <div className="grid gap-2">
                {[
                  { id: 'compact', label: '컴팩트', desc: '테이블 중심의 높은 정보 밀도' },
                  { id: 'comfortable', label: '기본', desc: '대부분의 화면에 맞는 표준 간격' },
                  { id: 'spacious', label: '여유롭게', desc: '카드와 섹션 구분을 크게 표시' },
                ].map(({ id, label, desc }) => (
                  <ChoiceButton key={id} active={density === id} label={label} desc={desc} onClick={() => setDensity(id)} />
                ))}
              </div>
            </Section>
          </div>

          <Section icon={Database} title="데이터 관리" desc="포트폴리오 원장, 종목, 목표 비중 데이터를 초기화합니다.">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
              <div className="rounded-[var(--radius-md)] border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-4">
                <div className="flex items-start gap-3">
                  <Server size={16} className="mt-0.5 text-[var(--warning)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">초기화 전 확인</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      모든 포트폴리오 데이터가 삭제됩니다.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="danger"
                icon={RotateCcw}
                className="w-full"
                onClick={async () => {
                  if (!confirm('모든 포트폴리오 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return
                  try {
                    if (user && !isGuest) {
                      const response = await apiFetch('/api/portfolio', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accounts: [] }),
                      })
                      await readApiJson(response, '서버 데이터 초기화에 실패했습니다')
                      await loadFromServer()
                    } else {
                      reset()
                    }
                  } catch {
                    alert('초기화 중 오류가 발생했습니다')
                  }
                }}
              >
                데이터 초기화
              </Button>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
