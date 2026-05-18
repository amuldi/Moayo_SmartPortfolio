import { readApiJson } from './apiClient.js'

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || ''
const NAVER_STATE_KEY = 'moayo_naver_oauth_state'
const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize'

function createOAuthState() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()

  const bytes = new Uint8Array(16)
  window.crypto?.getRandomValues?.(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getRedirectUri() {
  return `${window.location.origin}/oauth/naver/callback`
}

function openCenteredPopup(url) {
  const width = 480
  const height = 720
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)

  return window.open(
    url,
    'moayo_naver_oauth',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  )
}

export function isNaverOAuthConfigured() {
  return Boolean(NAVER_CLIENT_ID)
}

export function getNaverCallbackUrl() {
  return getRedirectUri()
}

export function startNaverLogin() {
  if (!NAVER_CLIENT_ID) {
    return Promise.reject(new Error('네이버 로그인을 사용하려면 VITE_NAVER_CLIENT_ID 환경변수를 등록해주세요.'))
  }

  const state = createOAuthState()
  const redirectUri = getRedirectUri()
  sessionStorage.setItem(NAVER_STATE_KEY, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
  })
  const popup = openCenteredPopup(`${NAVER_AUTHORIZE_URL}?${params.toString()}`)
  if (!popup) {
    sessionStorage.removeItem(NAVER_STATE_KEY)
    return Promise.reject(new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.'))
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(closeCheck)
      clearTimeout(timeout)
    }

    const rejectAndCleanup = (error) => {
      cleanup()
      sessionStorage.removeItem(NAVER_STATE_KEY)
      reject(error)
    }

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.source !== 'moayo-naver-oauth') return

      if (event.data.error) {
        rejectAndCleanup(new Error(event.data.error))
        return
      }

      const savedState = sessionStorage.getItem(NAVER_STATE_KEY)
      if (!event.data.code || !event.data.state || event.data.state !== savedState) {
        rejectAndCleanup(new Error('네이버 로그인 상태 검증에 실패했습니다. 다시 시도해주세요.'))
        return
      }

      cleanup()
      sessionStorage.removeItem(NAVER_STATE_KEY)

      try {
        const response = await fetch('/api/auth/naver', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: event.data.code,
            state: event.data.state,
            redirectUri,
          }),
        })
        const data = await readApiJson(response, '네이버 로그인 실패')
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }

    const closeCheck = setInterval(() => {
      if (popup.closed) {
        rejectAndCleanup(new Error('네이버 로그인이 취소되었습니다.'))
      }
    }, 700)

    const timeout = setTimeout(() => {
      try { popup.close() } catch {}
      rejectAndCleanup(new Error('네이버 로그인 시간이 초과되었습니다. 다시 시도해주세요.'))
    }, 2 * 60 * 1000)

    window.addEventListener('message', handleMessage)
  })
}
