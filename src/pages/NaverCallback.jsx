import { useEffect } from 'react'

export default function NaverCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payload = {
      source: 'moayo-naver-oauth',
      provider: 'naver',
      code: params.get('code') || '',
      state: params.get('state') || '',
      error: params.get('error_description') || params.get('error') || '',
    }

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin)
      window.close()
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <h1 className="mt-4 text-base font-semibold text-[var(--text-primary)]">네이버 로그인을 완료하는 중입니다</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">창이 자동으로 닫히지 않으면 원래 창으로 돌아가 다시 시도해주세요.</p>
      </div>
    </div>
  )
}
