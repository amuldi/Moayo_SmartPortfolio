import { Component } from 'react'

function isBuildChunkError(error) {
  const message = String(error?.message || error || '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|preload/i.test(message)
}

function reloadOnceForUpdatedBuild() {
  const key = 'moayo-last-build-reload'
  const lastReload = Number(sessionStorage.getItem(key) || 0)
  if (Date.now() - lastReload < 15000) return false
  sessionStorage.setItem(key, String(Date.now()))
  window.location.reload()
  return true
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error('App render error:', error)
    if (isBuildChunkError(error)) reloadOnceForUpdatedBuild()
  }

  resetToStart = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = isBuildChunkError(this.state.error)
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">문제가 발생했습니다</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {isChunkError
                ? '새 버전이 배포되어 화면 파일을 다시 불러와야 합니다.'
                : '일시적인 오류입니다. 처음 화면으로 돌아가 다시 시도해 주세요.'}
            </p>
            <button
              type="button"
              onClick={this.resetToStart}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-medium text-white"
            >
              처음 화면으로 이동
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
