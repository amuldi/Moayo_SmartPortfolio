import { Component } from 'react'
import { Link } from 'react-router-dom'

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('App render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">문제가 발생했습니다</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              일시적인 오류입니다. 홈으로 돌아가 다시 시도해 주세요.
            </p>
            <Link
              to="/home"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-medium text-white"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
