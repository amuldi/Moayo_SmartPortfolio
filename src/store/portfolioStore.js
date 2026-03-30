import { create } from 'zustand'
import { fetchQuotes } from '../services/stockAPI.js'
import {
  DEFAULT_PORTFOLIO_PREFERENCES,
  normalizeAccount,
  normalizeHolding,
} from '../features/portfolio/schema.js'

const STORAGE_KEY = 'portfolio-data-v2'

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildSnapshotPayload(state) {
  return {
    id: state.currentPortfolioId,
    name: state.currentPortfolioName,
    accounts: state.accounts,
    watchlist: state.watchlist,
    recentTickers: state.recentTickers,
    updatedAt: Date.now(),
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

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('auth-data'))?.state?.token
  } catch {
    return null
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
  isLoaded: Boolean(cached),
  livePrices: {},
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
  lastSavedAt: cached?.lastSavedAt || null,
  lastPriceUpdateAt: null,
  hasUnsavedChanges: false,
  isLoaded: cached ? true : false,

  setPortfolioPreferences: (partial) =>
    set((state) => {
      const next = { ...state.preferences, ...partial }
      const updated = { ...state, preferences: next, savedPortfolios: syncCurrentPortfolioSnapshot({ ...state, preferences: next }) }
      persistLocalState(updated)
      return { preferences: next }
    }),

  resetPortfolioPreferences: () =>
    set((state) => {
      const updated = { ...state, preferences: DEFAULT_PORTFOLIO_PREFERENCES }
      persistLocalState(updated)
      return { preferences: DEFAULT_PORTFOLIO_PREFERENCES }
    }),

  saveLocalSnapshot: () => {
    const state = get()
    persistLocalState(state)
  },

  markLoaded: () => set({ isLoaded: true }),

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
    const token = getToken()
    const nextState = {
      ...state,
      saveStatus: token ? 'saving' : 'saved',
      saveError: null,
      lastSavedAt: Date.now(),
      hasUnsavedChanges: false,
    }
    nextState.savedPortfolios = syncCurrentPortfolioSnapshot(nextState)

    persistLocalState(nextState)
    set({
      saveStatus: token ? 'saving' : 'saved',
      saveError: null,
      lastSavedAt: nextState.lastSavedAt,
      hasUnsavedChanges: false,
      savedPortfolios: nextState.savedPortfolios,
    })

    if (!token) return

    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        await fetch('/api/portfolio', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ accounts: get().accounts }),
        })
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
      } catch (error) {
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
      ]),
    ]

    if (!tickers.length) {
      set({ refreshStatus: 'idle', refreshError: null })
      return
    }

    set({ refreshStatus: 'loading', refreshError: null })

    try {
      const { quotes, updatedAt } = await fetchQuotes(tickers)
      set({
        livePrices: quotes || {},
        refreshStatus: 'success',
        refreshError: null,
        lastPriceUpdateAt: updatedAt || new Date().toISOString(),
      })
    } catch (error) {
      set({
        refreshStatus: 'error',
        refreshError: '실시간 시세를 불러오지 못했습니다. 기본 시세로 계속 표시합니다.',
      })
    }
  },

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

  loadFromServer: async (token) => {
    try {
      const response = await fetch('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('load failed')
      const data = await response.json()
      const accounts = Array.isArray(data.accounts) ? data.accounts.map(normalizeAccount) : []
      const snapshot = {
        ...get(),
        accounts,
        isLoaded: true,
        saveStatus: 'saved',
      }
      snapshot.savedPortfolios = syncCurrentPortfolioSnapshot(snapshot)
      persistLocalState(snapshot)
      set({ accounts, isLoaded: true, saveStatus: 'saved', saveError: null, savedPortfolios: snapshot.savedPortfolios })
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error)
      set({ isLoaded: true })
    }
  },

  reset: () => {
    const next = {
      accounts: [],
      isLoaded: false,
      livePrices: {},
      watchlist: [],
      preferences: DEFAULT_PORTFOLIO_PREFERENCES,
      saveStatus: 'idle',
      saveError: null,
      refreshStatus: 'idle',
      refreshError: null,
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
      const accounts = [...state.accounts, normalizeAccount({ ...account, id: createId('account') })]
      const updated = { ...state, accounts, hasUnsavedChanges: true }
      updated.savedPortfolios = syncCurrentPortfolioSnapshot(updated)
      persistLocalState(updated)
      queueMicrotask(() => get().scheduleSave())
      return { accounts, hasUnsavedChanges: true, savedPortfolios: updated.savedPortfolios }
    }),

  updateAccount: (id, updates) =>
    set((state) => {
      const accounts = state.accounts.map((account) =>
        account.id === id ? normalizeAccount({ ...account, ...updates, id }) : account
      )
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
    const accounts = get().accounts
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

    return Array.from(map.values())
  },
}))

export default usePortfolioStore
