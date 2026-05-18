import { create } from 'zustand'
import { fetchQuotes } from '../services/stockAPI.js'
import { apiFetch, readApiJson } from '../services/apiClient.js'
import {
  createDefaultAccountName,
  DEFAULT_PORTFOLIO_PREFERENCES,
  FX_RATES,
  normalizeAccount,
  normalizeHolding,
} from '../features/portfolio/schema.js'

const STORAGE_KEY = 'portfolio-data-v2'

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toIsoTime(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function buildSnapshotPayload(state) {
  return {
    id: state.currentPortfolioId,
    name: state.currentPortfolioName,
    accounts: state.accounts,
    watchlist: state.watchlist,
    recentTickers: state.recentTickers,
    preferences: state.preferences,
    updatedAt: Date.now(),
  }
}

function buildServerPortfolioPayload(state) {
  return {
    currentPortfolioId: state.currentPortfolioId,
    currentPortfolioName: state.currentPortfolioName,
    accounts: state.accounts,
    savedPortfolios: syncCurrentPortfolioSnapshot(state),
    watchlist: state.watchlist,
    recentTickers: state.recentTickers,
    preferences: state.preferences,
  }
}

function syncCurrentPortfolioSnapshot(state) {
  if (!state.currentPortfolioId) return state.savedPortfolios || []

  const payload = buildSnapshotPayload(state)
  const next = Array.isArray(state.savedPortfolios) ? [...state.savedPortfolios] : []
  const index = next.findIndex((item) => item.id === payload.id)

  if (index >= 0) next[index] = payload
  else next.unshift(payload)

  return next.sort((left, right) => right.updatedAt - left.updatedAt)
}

function hasServerSession() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth-data'))?.state
    return Boolean(auth?.user && !auth?.isGuest && auth.user.role !== 'guest')
  } catch {
    return false
  }
}

function readLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      accounts: Array.isArray(data.accounts) ? data.accounts.map(normalizeAccount) : [],
      watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
      preferences: { ...DEFAULT_PORTFOLIO_PREFERENCES, ...(data.preferences || {}) },
      lastSavedAt: data.lastSavedAt || null,
      currentPortfolioId: data.currentPortfolioId || 'default',
      currentPortfolioName: data.currentPortfolioName || '기본 포트폴리오',
      savedPortfolios: Array.isArray(data.savedPortfolios) ? data.savedPortfolios : [],
      recentTickers: Array.isArray(data.recentTickers) ? data.recentTickers : [],
    }
  } catch {
    return null
  }
}

function persistLocalState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accounts: state.accounts,
        watchlist: state.watchlist,
        preferences: state.preferences,
        lastSavedAt: state.lastSavedAt,
        currentPortfolioId: state.currentPortfolioId,
        currentPortfolioName: state.currentPortfolioName,
        savedPortfolios: state.savedPortfolios,
        recentTickers: state.recentTickers,
      })
    )
  } catch (error) {
    console.error('로컬 저장 실패:', error)
  }
}

let saveTimer = null

const cached = readLocalState()

const usePortfolioStore = create((set, get) => ({
  accounts: cached?.accounts || [],
  livePrices: {},
  fxRates: FX_RATES,
  watchlist: cached?.watchlist || [],
  preferences: cached?.preferences || DEFAULT_PORTFOLIO_PREFERENCES,
  currentPortfolioId: cached?.currentPortfolioId || 'default',
  currentPortfolioName: cached?.currentPortfolioName || '기본 포트폴리오',
  savedPortfolios: cached?.savedPortfolios?.length
    ? cached.savedPortfolios
    : [{
        id: 'default',
        name: '기본 포트폴리오',
        accounts: cached?.accounts || [],
        watchlist: cached?.watchlist || [],
        recentTickers: cached?.recentTickers || [],
        updatedAt: Date.now(),
      }],
  recentTickers: cached?.recentTickers || [],
  saveStatus: 'idle',
  saveError: null,
  refreshStatus: 'idle',
  refreshError: null,
  realtimeStatus: 'idle',
  realtimeError: null,
  lastSavedAt: cached?.lastSavedAt || null,
  lastPriceUpdateAt: null,
  hasUnsavedChanges: false,
  isLoaded: cached ? true : false,

  setPortfolioPreferences: (partial) =>
    set((state) => {
      const next = { ...state.preferences, ...partial }
      const updated = { ...state, preferences: next, savedPortfolios: syncCurrentPortfolioSnapshot({ ...state, preferences: next }) }
      persistLocalState(updated)
      return { preferences: next, savedPortfolios: updated.savedPortfolios }
    }),

  resetPortfolioPreferences: () =>
    set((state) => {
      const updated = {
        ...state,
        preferences: DEFAULT_PORTFOLIO_PREFERENCES,
        savedPortfolios: syncCurrentPortfolioSnapshot({ ...state, preferences: DEFAULT_PORTFOLIO_PREFERENCES }),
      }
      persistLocalState(updated)
      return { preferences: DEFAULT_PORTFOLIO_PREFERENCES, savedPortfolios: updated.savedPortfolios }
    }),

  saveLocalSnapshot: () => {
    const state = get()
    persistLocalState(state)
  },

  markLoaded: () => set({ isLoaded: true, loadError: null }),

  renameCurrentPortfolio: (name) =>
    set((state) => {
      const nextName = name?.trim() || '이름 없는 포트폴리오'
      const nextState = {
        ...state,
        currentPortfolioName: nextName,
      }
      nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)
      persistLocalState(nextState)
      return {
        currentPortfolioName: nextName,
        savedPortfolios: nextState.savedPortfolios,
      }
    }),

  createPortfolioWorkspace: (name) =>
    set((state) => {
      const currentPortfolioId = createId('portfolio')
      const currentPortfolioName = name?.trim() || '새 포트폴리오'
      const nextState = {
        ...state,
        currentPortfolioId,
        currentPortfolioName,
        accounts: [],
        watchlist: [],
        recentTickers: [],
        preferences: DEFAULT_PORTFOLIO_PREFERENCES,
        hasUnsavedChanges: false,
      }
      nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)
      persistLocalState(nextState)
      return {
        currentPortfolioId,
        currentPortfolioName,
        accounts: [],
        watchlist: [],
        recentTickers: [],
        preferences: DEFAULT_PORTFOLIO_PREFERENCES,
        savedPortfolios: nextState.savedPortfolios,
        hasUnsavedChanges: false,
      }
    }),

  replaceCurrentPortfolio: (portfolio) =>
    set((state) => {
      const normalizedAccounts = []
      ;(portfolio.accounts || []).forEach((account) => {
        const accountInput = {
          ...account,
          id: createId('account'),
          holdings: Array.isArray(account.holdings)
            ? account.holdings.map((holding) => ({ ...holding, id: createId('holding') }))
            : [],
        }
        if (!accountInput.name?.trim()) {
          accountInput.name = createDefaultAccountName(accountInput.type, normalizedAccounts)
        }
        normalizedAccounts.push(normalizeAccount(accountInput))
      })

      const nextState = {
        ...state,
        currentPortfolioId: createId('portfolio'),
        currentPortfolioName: portfolio.name?.trim() || '불러온 포트폴리오',
        accounts: normalizedAccounts,
        watchlist: Array.isArray(portfolio.watchlist) ? portfolio.watchlist : state.watchlist,
        recentTickers: Array.isArray(portfolio.recentTickers) ? portfolio.recentTickers : state.recentTickers,
        preferences: { ...DEFAULT_PORTFOLIO_PREFERENCES, ...(portfolio.preferences || {}) },
        livePrices: {},
        hasUnsavedChanges: true,
      }
      nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)
      persistLocalState(nextState)
      queueMicrotask(() => get().scheduleSave())
      return {
        currentPortfolioId: nextState.currentPortfolioId,
        currentPortfolioName: nextState.currentPortfolioName,
        accounts: nextState.accounts,
        watchlist: nextState.watchlist,
        recentTickers: nextState.recentTickers,
        preferences: nextState.preferences,
        livePrices: {},
        hasUnsavedChanges: true,
        savedPortfolios: nextState.savedPortfolios,
      }
    }),

  loadPreviewPortfolio: (portfolio) =>
    set((state) => {
      const accounts = (portfolio.accounts || []).map(normalizeAccount)
      return {
        ...state,
        accounts,
        currentPortfolioId: portfolio.id || 'figma-preview',
        currentPortfolioName: portfolio.name || '프리뷰 포트폴리오',
        watchlist: Array.isArray(portfolio.watchlist) ? portfolio.watchlist : [],
        recentTickers: Array.isArray(portfolio.recentTickers) ? portfolio.recentTickers : [],
        preferences: DEFAULT_PORTFOLIO_PREFERENCES,
        savedPortfolios: [{
          id: portfolio.id || 'figma-preview',
          name: portfolio.name || '프리뷰 포트폴리오',
          accounts,
          watchlist: Array.isArray(portfolio.watchlist) ? portfolio.watchlist : [],
          recentTickers: Array.isArray(portfolio.recentTickers) ? portfolio.recentTickers : [],
          updatedAt: Date.now(),
        }],
        isLoaded: true,
        saveStatus: 'idle',
        saveError: null,
        hasUnsavedChanges: false,
      }
    }),

  loadPortfolioSnapshot: (id) =>
    set((state) => {
      const snapshot = state.savedPortfolios.find((item) => item.id === id)
      if (!snapshot) return state
      const accounts = Array.isArray(snapshot.accounts) ? snapshot.accounts.map(normalizeAccount) : []
      const watchlist = Array.isArray(snapshot.watchlist) ? snapshot.watchlist : []
      const recentTickers = Array.isArray(snapshot.recentTickers) ? snapshot.recentTickers : []
      const nextState = {
        ...state,
        currentPortfolioId: snapshot.id,
        currentPortfolioName: snapshot.name,
        accounts,
        watchlist,
        recentTickers,
        hasUnsavedChanges: false,
      }
      persistLocalState(nextState)
      return {
        currentPortfolioId: snapshot.id,
        currentPortfolioName: snapshot.name,
        accounts,
        watchlist,
        recentTickers,
        hasUnsavedChanges: false,
      }
    }),

  deletePortfolioSnapshot: (id) =>
    set((state) => {
      const savedPortfolios = state.savedPortfolios.filter((item) => item.id !== id)
      const deletingCurrent = state.currentPortfolioId === id
      const fallback = savedPortfolios[0]
      const nextState = {
        ...state,
        savedPortfolios,
      }

      if (deletingCurrent) {
        nextState.currentPortfolioId = fallback?.id || createId('portfolio')
        nextState.currentPortfolioName = fallback?.name || '새 포트폴리오'
        nextState.accounts = fallback?.accounts?.map(normalizeAccount) || []
        nextState.watchlist = fallback?.watchlist || []
        nextState.recentTickers = fallback?.recentTickers || []
      }

      persistLocalState(nextState)
      return {
        savedPortfolios,
        ...(deletingCurrent ? {
          currentPortfolioId: nextState.currentPortfolioId,
          currentPortfolioName: nextState.currentPortfolioName,
          accounts: nextState.accounts,
          watchlist: nextState.watchlist,
          recentTickers: nextState.recentTickers,
        } : {}),
      }
    }),

  recordRecentTicker: (ticker) =>
    set((state) => {
      const recentTickers = [ticker, ...state.recentTickers.filter((item) => item !== ticker)].slice(0, 8)
      const nextState = { ...state, recentTickers }
      nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)
      persistLocalState(nextState)
      return {
        recentTickers,
        savedPortfolios: nextState.savedPortfolios,
      }
    }),

  scheduleSave: () => {
    const state = get()
    const shouldSync = hasServerSession()
    const nextState = {
      ...state,
      saveStatus: shouldSync ? 'saving' : 'saved',
      saveError: null,
      lastSavedAt: Date.now(),
      hasUnsavedChanges: false,
    }
    nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)

    persistLocalState(nextState)
    set({
      saveStatus: shouldSync ? 'saving' : 'saved',
      saveError: null,
      lastSavedAt: nextState.lastSavedAt,
      hasUnsavedChanges: false,
      savedPortfolios: nextState.savedPortfolios,
    })

    if (!shouldSync) return

    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        const response = await apiFetch('/api/portfolio', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildServerPortfolioPayload(get())),
        })
        await readApiJson(response, '서버 저장에 실패했습니다')
        const syncedState = { ...get(), lastSavedAt: Date.now(), hasUnsavedChanges: false }
        syncedState.savedPortfolios = syncCurrentPortfolioSnapshot(syncedState)
        set({
          saveStatus: 'saved',
          saveError: null,
          lastSavedAt: syncedState.lastSavedAt,
          hasUnsavedChanges: false,
          savedPortfolios: syncedState.savedPortfolios,
        })
        persistLocalState(syncedState)
      } catch {
        set({
          saveStatus: 'error',
          saveError: '서버 동기화에 실패했습니다. 로컬에는 저장되었습니다.',
          hasUnsavedChanges: true,
        })
      }
    }, 700)
  },

  refreshPrices: async () => {
    const tickers = [
      ...new Set([
        ...get().accounts.flatMap((account) => account.holdings.map((holding) => holding.ticker)),
        ...get().watchlist.map((item) => item.ticker),
      ].map((ticker) => String(ticker || '').trim()).filter(Boolean)),
    ]

    if (!tickers.length) {
      set({ refreshStatus: 'idle', refreshError: null })
      return
    }

    set({ refreshStatus: 'loading', refreshError: null })

    try {
      const { quotes, updatedAt, fx } = await fetchQuotes(tickers)
      set({
        livePrices: { ...get().livePrices, ...(quotes || {}) },
        fxRates: fx?.rates || get().fxRates,
        refreshStatus: 'success',
        refreshError: null,
        lastPriceUpdateAt: updatedAt || new Date().toISOString(),
      })
    } catch {
      set({
        refreshStatus: 'error',
        refreshError: '실시간 시세를 불러오지 못했습니다. 기본 시세로 계속 표시합니다.',
      })
    }
  },

  setRealtimeStatus: (realtimeStatus, realtimeError = null) =>
    set({ realtimeStatus, realtimeError }),

  applyRealtimeTrade: (trade) =>
    set((state) => {
      const ticker = String(trade?.ticker || '').trim()
      const price = Number(trade?.price)
      if (!ticker || !Number.isFinite(price) || price <= 0) return state

      const previous = state.livePrices[ticker] || {}
      const updatedAt = toIsoTime(trade.timestamp)
      const prevClose = Number(previous.prevClose)
      const canCalculateChange = Number.isFinite(prevClose) && prevClose > 0
      const change = canCalculateChange ? price - prevClose : previous.change
      const changePct = canCalculateChange ? ((price - prevClose) / prevClose) * 100 : previous.changePct

      return {
        livePrices: {
          ...state.livePrices,
          [ticker]: {
            ...previous,
            ticker,
            price,
            change,
            changePct,
            volume: trade.volume ?? previous.volume ?? null,
            updatedAt,
            source: 'finnhub-ws',
            stale: false,
            isEstimated: false,
            errors: [],
          },
        },
        refreshStatus: 'success',
        refreshError: null,
        realtimeStatus: 'live',
        realtimeError: null,
        lastPriceUpdateAt: updatedAt,
      }
    }),

  addToWatchlist: (ticker, name) =>
    set((state) => {
      if (state.watchlist.find((item) => item.ticker === ticker)) return state
      const watchlist = [...state.watchlist, { ticker, name, addedAt: Date.now() }]
      const updated = { ...state, watchlist }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      return { watchlist, savedPortfolios: updated.savedPortfolios }
    }),

  removeFromWatchlist: (ticker) =>
    set((state) => {
      const watchlist = state.watchlist.filter((item) => item.ticker !== ticker)
      const updated = { ...state, watchlist }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      return { watchlist, savedPortfolios: updated.savedPortfolios }
    }),

  loadFromServer: async () => {
    try {
      const response = await apiFetch('/api/portfolio')
      if (!response.ok) throw new Error('load failed')
      const data = await readApiJson(response, '포트폴리오를 불러오지 못했습니다')
      const hasLocalGuestData = get().accounts.length > 0
      const serverAccounts = Array.isArray(data.accounts) ? data.accounts.map(normalizeAccount) : []

      if (!serverAccounts.length && hasLocalGuestData) {
        const localState = {
          ...get(),
          isLoaded: true,
          saveStatus: 'saving',
          loadError: null,
        }
        set({ isLoaded: true, saveStatus: 'saving', loadError: null })
        await apiFetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildServerPortfolioPayload(localState)),
        }).then((saveResponse) => readApiJson(saveResponse, '게스트 포트폴리오 저장에 실패했습니다'))
        set({ saveStatus: 'saved', saveError: null, lastSavedAt: Date.now(), hasUnsavedChanges: false })
        persistLocalState({ ...get(), saveStatus: 'saved', hasUnsavedChanges: false })
        return
      }

      const accounts = serverAccounts
      const savedPortfolios = Array.isArray(data.savedPortfolios) && data.savedPortfolios.length
        ? data.savedPortfolios.map((item) => ({
            ...item,
            accounts: Array.isArray(item.accounts) ? item.accounts.map(normalizeAccount) : [],
          }))
        : null
      const snapshot = {
        ...get(),
        accounts,
        currentPortfolioId: data.currentPortfolioId || get().currentPortfolioId,
        currentPortfolioName: data.currentPortfolioName || get().currentPortfolioName,
        watchlist: Array.isArray(data.watchlist) ? data.watchlist : get().watchlist,
        recentTickers: Array.isArray(data.recentTickers) ? data.recentTickers : get().recentTickers,
        preferences: { ...DEFAULT_PORTFOLIO_PREFERENCES, ...(data.preferences || get().preferences) },
        savedPortfolios: savedPortfolios || get().savedPortfolios,
        isLoaded: true,
        saveStatus: 'saved',
        loadError: null,
      }
      snapshot.savedPortfolios = savedPortfolios || syncCurrentPortfolioSnapshot(snapshot)
      persistLocalState(snapshot)
      set({
        accounts,
        currentPortfolioId: snapshot.currentPortfolioId,
        currentPortfolioName: snapshot.currentPortfolioName,
        watchlist: snapshot.watchlist,
        recentTickers: snapshot.recentTickers,
        preferences: snapshot.preferences,
        isLoaded: true,
        saveStatus: 'saved',
        saveError: null,
        loadError: null,
        savedPortfolios: snapshot.savedPortfolios,
      })
    } catch (error) {
      set({
        isLoaded: true,
        loadError: error.message || '서버 포트폴리오를 불러오지 못했습니다. 로컬 데이터로 계속 표시합니다.',
      })
    }
  },

  reset: () => {
    const next = {
      accounts: [],
      isLoaded: false,
      livePrices: {},
      fxRates: FX_RATES,
      watchlist: [],
      preferences: DEFAULT_PORTFOLIO_PREFERENCES,
      saveStatus: 'idle',
      saveError: null,
      refreshStatus: 'idle',
      refreshError: null,
      realtimeStatus: 'idle',
      realtimeError: null,
      lastSavedAt: null,
      lastPriceUpdateAt: null,
      currentPortfolioId: 'default',
      currentPortfolioName: '기본 포트폴리오',
      savedPortfolios: [],
      recentTickers: [],
      hasUnsavedChanges: false,
    }
    localStorage.removeItem(STORAGE_KEY)
    set(next)
  },

  addAccount: (account) =>
    set((state) => {
      const accountInput = { ...account, id: createId('account') }
      if (!accountInput.name?.trim()) accountInput.name = createDefaultAccountName(accountInput.type, state.accounts)
      const accounts = [...state.accounts, normalizeAccount(accountInput)]
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  updateAccount: (id, updates) =>
    set((state) => {
      const accounts = state.accounts.map((account) => {
        if (account.id !== id) return account
        const accountInput = { ...account, ...updates, id }
        if (!accountInput.name?.trim()) {
          accountInput.name = createDefaultAccountName(accountInput.type, state.accounts.filter((item) => item.id !== id))
        }
        return normalizeAccount(accountInput)
      })
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  removeAccount: (id) =>
    set((state) => {
      const accounts = state.accounts.filter((account) => account.id !== id)
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  addHolding: (accountId, holding) =>
    set((state) => {
      const accounts = state.accounts.map((account) => {
        if (account.id !== accountId) return account
        return {
          ...account,
          holdings: [...account.holdings, normalizeHolding({ ...holding, id: createId('holding') }, account)],
          updatedAt: Date.now(),
        }
      })
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  updateHolding: (accountId, holdingId, updates) =>
    set((state) => {
      const accounts = state.accounts.map((account) => {
        if (account.id !== accountId) return account
        return {
          ...account,
          holdings: account.holdings.map((holding) =>
            holding.id === holdingId
              ? normalizeHolding({ ...holding, ...updates, id: holdingId }, account)
              : holding
          ),
          updatedAt: Date.now(),
        }
      })
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  removeHolding: (accountId, holdingId) =>
    set((state) => {
      const accounts = state.accounts.map((account) => {
        if (account.id !== accountId) return account
        return {
          ...account,
          holdings: account.holdings.filter((holding) => holding.id !== holdingId),
          updatedAt: Date.now(),
        }
      })
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  getAggregatedHoldings: () => {
    const { accounts, livePrices, fxRates } = get()
    const map = new Map()

    accounts.forEach((account) => {
      account.holdings.forEach((holding) => {
        const key = holding.ticker
        const current = map.get(key)

        if (current) {
          current.quantity += holding.quantity
          current.accounts.push(account.type)
        } else {
          map.set(key, {
            ...holding,
            quantity: holding.quantity,
            accounts: [account.type],
          })
        }
      })
    })

    const items = Array.from(map.values())

    items.forEach((h) => {
      const quote = livePrices[h.ticker]
      const price = quote?.price ?? h.avgPrice ?? 0
      const fxRate = fxRates[h.currency] || FX_RATES[h.currency] || 1
      h.value = price * h.quantity * fxRate
    })

    const totalValue = items.reduce((sum, h) => sum + h.value, 0)
    items.forEach((h) => {
      h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 0
    })

    return items
  },
}))

export default usePortfolioStore
