import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import useSettingsStore from '../../store/settingsStore.js'
import useAuthStore from '../../store/authStore.js'
import usePortfolioStore from '../../store/portfolioStore.js'
import { BrandIcon } from '../ui/BrandIcon.jsx'

const NAV = [
  { path: '/home',      label: '홈'           },
  { path: '/portfolio', label: '내 포트폴리오' },
  { path: '/analysis',  label: '분석'          },
  { path: '/settings',  label: '설정'          },
]

export function TopNav() {
  const { theme, setTheme } = useSettingsStore()
  const { user, logout } = useAuthStore()
  const { reset } = usePortfolioStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    reset()
    navigate('/')
  }

  return (
    <header
      className="h-14 shrink-0 flex items-center px-5 gap-6 sticky top-0 z-40"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-2.5 shrink-0">
        <BrandIcon size={26} />
        <span
          className="text-sm font-bold hidden sm:block tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Moay<span style={{ color: 'var(--accent)' }}>o</span>
        </span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex items-center gap-0.5 flex-1">
        {NAV.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/home'}
            className={({ isActive }) =>
              clsx(
                'px-3.5 py-1.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 우측: 테마 + 유저 메뉴 */}
      <div className="flex items-center gap-1.5">
        {/* 테마 토글 */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* 유저 메뉴 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={clsx(
              'flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-md)] border text-xs font-medium transition-all',
            )}
            style={{
              borderColor: menuOpen ? 'var(--accent)' : 'var(--border)',
              color: menuOpen ? 'var(--accent)' : 'var(--text-secondary)',
              background: menuOpen ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <User size={10} className="text-white" />
            </div>
            <span className="hidden sm:block max-w-[80px] truncate">{user?.username}</span>
            <ChevronDown size={11} className={clsx('transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-48 rounded-[var(--radius-card)] overflow-hidden z-50"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                className="px-3 py-2.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.username}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors"
                style={{ color: 'var(--negative)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--negative-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={13} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
