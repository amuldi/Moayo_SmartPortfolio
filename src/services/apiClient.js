export function unwrapApiResponse(payload) {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data
  }
  return payload
}

let csrfToken = null

export async function getCsrfToken() {
  if (csrfToken) return csrfToken
  const response = await fetch('/api/auth/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })
  const data = await readApiJson(response, '보안 토큰을 가져오지 못했습니다')
  csrfToken = data.csrfToken
  return csrfToken
}

export async function apiFetch(input, init = {}) {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers || {})

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-CSRF-Token', await getCsrfToken())
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
    cache: init.cache || 'no-store',
  })

  if (response.status !== 403) return response

  const cloned = response.clone()
  const payload = await cloned.json().catch(() => ({}))
  if (payload?.code !== 'CSRF_FAILED') return response

  csrfToken = null
  headers.set('X-CSRF-Token', await getCsrfToken())
  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
    cache: init.cache || 'no-store',
  })
}

export async function apiJson(input, init = {}, fallbackMessage) {
  return readApiJson(await apiFetch(input, init), fallbackMessage)
}

export function getApiErrorMessage(payload, fallback = '요청을 처리하지 못했습니다') {
  if (!payload || typeof payload !== 'object') return fallback
  return payload.message || payload.error || fallback
}

export async function readApiJson(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(getApiErrorMessage(payload, fallbackMessage))
    error.payload = payload
    error.code = payload?.code
    error.details = payload?.details
    throw error
  }
  return unwrapApiResponse(payload)
}
