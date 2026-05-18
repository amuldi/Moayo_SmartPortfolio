import { neon } from '@neondatabase/serverless'

function toIso(value) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function rowToUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash || null,
    emailVerified: Boolean(row.email_verified),
    verificationToken: row.verification_token || null,
    disabledAt: row.disabled_at || null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function rowToSession(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    refreshTokenHash: row.refresh_token_hash,
    expiresAt: toIso(row.expires_at),
    revokedAt: toIso(row.revoked_at),
    createdAt: toIso(row.created_at),
    rotatedAt: toIso(row.rotated_at),
  }
}

function normalizePortfolioSnapshots(portfolio = {}) {
  const snapshots = Array.isArray(portfolio.savedPortfolios) && portfolio.savedPortfolios.length
    ? portfolio.savedPortfolios
    : []

  const current = {
    id: portfolio.currentPortfolioId || 'default',
    name: portfolio.currentPortfolioName || '기본 포트폴리오',
    accounts: Array.isArray(portfolio.accounts) ? portfolio.accounts : [],
    watchlist: Array.isArray(portfolio.watchlist) ? portfolio.watchlist : [],
    recentTickers: Array.isArray(portfolio.recentTickers) ? portfolio.recentTickers : [],
    preferences: portfolio.preferences || {},
    updatedAt: Date.now(),
  }

  const byId = new Map()
  ;[current, ...snapshots].forEach((snapshot) => {
    const id = String(snapshot.id || current.id || 'default')
    byId.set(id, {
      ...snapshot,
      id,
      name: snapshot.name || (id === current.id ? current.name : '포트폴리오'),
      accounts: Array.isArray(snapshot.accounts) ? snapshot.accounts : [],
      watchlist: Array.isArray(snapshot.watchlist) ? snapshot.watchlist : [],
      recentTickers: Array.isArray(snapshot.recentTickers) ? snapshot.recentTickers : [],
      preferences: snapshot.preferences || {},
      updatedAt: snapshot.updatedAt || Date.now(),
    })
  })

  return {
    currentId: current.id,
    snapshots: [...byId.values()].sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0)),
  }
}

function storagePortfolioId(userId, clientId) {
  return `${userId}:${clientId}`
}

function storageAccountId(portfolioId, clientId) {
  return `${portfolioId}:account:${clientId}`
}

function storageHoldingId(accountId, clientId) {
  return `${accountId}:holding:${clientId}`
}

function buildPortfolioQueries(txn, userId, snapshot, isDefault) {
  const portfolioId = storagePortfolioId(userId, snapshot.id)
  const queries = [
    txn`
      insert into portfolios (id, client_id, user_id, name, preferences, recent_tickers, is_default, updated_at)
      values (
        ${portfolioId},
        ${snapshot.id},
        ${userId},
        ${snapshot.name || '포트폴리오'},
        ${JSON.stringify(snapshot.preferences || {})}::jsonb,
        ${JSON.stringify(snapshot.recentTickers || [])}::jsonb,
        ${isDefault},
        to_timestamp(${Math.floor(Number(snapshot.updatedAt || Date.now()) / 1000)})
      )
    `,
  ]

  ;(snapshot.accounts || []).forEach((account, accountIndex) => {
    const accountClientId = String(account.id || `account-${accountIndex}`)
    const accountId = storageAccountId(portfolioId, accountClientId)
    queries.push(txn`
      insert into accounts (
        id, client_id, portfolio_id, name, type, base_currency, total_capital, memo, created_at, updated_at
      )
      values (
        ${accountId},
        ${accountClientId},
        ${portfolioId},
        ${account.name || '새 계좌'},
        ${account.type || 'BROKERAGE'},
        ${account.baseCurrency || 'KRW'},
        ${toNumber(account.totalCapital)},
        ${account.memo || ''},
        to_timestamp(${Math.floor(Number(account.createdAt || Date.now()) / 1000)}),
        to_timestamp(${Math.floor(Number(account.updatedAt || Date.now()) / 1000)})
      )
    `)

    ;(account.holdings || []).forEach((holding, holdingIndex) => {
      const holdingClientId = String(holding.id || `holding-${holdingIndex}`)
      const holdingId = storageHoldingId(accountId, holdingClientId)
      queries.push(txn`
        insert into holdings (
          id, client_id, account_id, ticker, name, sector, region, market, asset_class, currency, category,
          quantity, avg_price, current_price, purchase_amount, market_value, pnl, return_pct,
          target_weight, memo, created_at, updated_at
        )
        values (
          ${holdingId},
          ${holdingClientId},
          ${accountId},
          ${holding.ticker},
          ${holding.name || holding.ticker},
          ${holding.sector || '기타'},
          ${holding.region || '기타'},
          ${holding.market || '기타'},
          ${holding.assetClass || 'equity'},
          ${holding.currency || 'KRW'},
          ${holding.category || '기타'},
          ${toNumber(holding.quantity)},
          ${toNumber(holding.avgPrice)},
          ${toNumber(holding.currentPrice)},
          ${toNumber(holding.purchaseAmount)},
          ${toNumber(holding.marketValue)},
          ${toNumber(holding.pnl)},
          ${toNumber(holding.returnPct)},
          ${toNumber(holding.targetWeight)},
          ${holding.memo || ''},
          to_timestamp(${Math.floor(Number(holding.createdAt || Date.now()) / 1000)}),
          to_timestamp(${Math.floor(Number(holding.updatedAt || Date.now()) / 1000)})
        )
      `)
    })
  })

  ;(snapshot.watchlist || []).forEach((item) => {
    queries.push(txn`
      insert into watchlist_items (portfolio_id, ticker, name, added_at)
      values (
        ${portfolioId},
        ${item.ticker},
        ${item.name || item.ticker},
        to_timestamp(${Math.floor(Number(item.addedAt || Date.now()) / 1000)})
      )
      on conflict (portfolio_id, ticker) do update set name = excluded.name
    `)
  })

  return queries
}

export function createPostgresRepository(databaseUrl) {
  const sql = neon(databaseUrl)

  return {
    async health() {
      const [userCount] = await sql`select count(*)::int as count from users`
      const [migrationCount] = await sql`select count(*)::int as count from schema_migrations`
      return {
        ok: true,
        adapter: 'postgres',
        users: userCount?.count || 0,
        migrations: migrationCount?.count || 0,
      }
    },

    async findUserByEmail(email) {
      const [row] = await sql`select * from users where email = ${email} limit 1`
      return rowToUser(row)
    },

    async findUserById(id) {
      const [row] = await sql`select * from users where id = ${id} limit 1`
      return rowToUser(row)
    },

    async findUserByVerificationToken(token) {
      const [row] = await sql`select * from users where verification_token = ${token} limit 1`
      return rowToUser(row)
    },

    async findUserByOAuth(provider, providerId, email) {
      const [row] = await sql`
        select u.*
        from users u
        left join oauth_identities oi on oi.user_id = u.id
        where (oi.provider = ${provider} and oi.provider_user_id = ${providerId})
           or (${email || null}::text is not null and u.email = ${email || null})
        order by case when oi.provider = ${provider} and oi.provider_user_id = ${providerId} then 0 else 1 end
        limit 1
      `
      return rowToUser(row)
    },

    async linkOAuthIdentity(userId, provider, providerId) {
      await sql`
        insert into oauth_identities (user_id, provider, provider_user_id)
        values (${userId}, ${provider}, ${providerId})
        on conflict (provider, provider_user_id) do nothing
      `
    },

    async createUser(user) {
      const [row] = await sql`
        insert into users (
          id, username, email, password_hash, email_verified, verification_token, created_at, updated_at
        )
        values (
          ${user.id},
          ${user.username},
          ${user.email},
          ${user.passwordHash || null},
          ${Boolean(user.emailVerified)},
          ${user.verificationToken || null},
          ${user.createdAt || new Date().toISOString()},
          now()
        )
        returning *
      `
      return rowToUser(row)
    },

    async updateUser(id, updates) {
      const current = await this.findUserById(id)
      if (!current) return null

      const nextVerificationToken = Object.prototype.hasOwnProperty.call(updates, 'verificationToken')
        ? updates.verificationToken || null
        : current.verificationToken
      const [row] = await sql`
        update users
        set
          username = ${updates.username || current.username},
          password_hash = ${updates.passwordHash || current.passwordHash},
          email_verified = ${typeof updates.emailVerified === 'boolean' ? updates.emailVerified : current.emailVerified},
          verification_token = ${nextVerificationToken},
          updated_at = now()
        where id = ${id}
        returning *
      `
      return rowToUser(row)
    },

    async createSession(session) {
      const [row] = await sql`
        insert into sessions (
          id, user_id, refresh_token_hash, expires_at, user_agent, ip_address, created_at, rotated_at
        )
        values (
          ${session.id},
          ${session.userId},
          ${session.refreshTokenHash},
          ${session.expiresAt},
          ${session.userAgent || ''},
          ${session.ipAddress || ''},
          now(),
          now()
        )
        returning *
      `
      return rowToSession(row)
    },

    async findSessionByRefreshTokenHash(refreshTokenHash) {
      const [row] = await sql`
        select * from sessions
        where refresh_token_hash = ${refreshTokenHash}
          and revoked_at is null
          and expires_at > now()
        limit 1
      `
      return rowToSession(row)
    },

    async rotateSession(id, refreshTokenHash, expiresAt) {
      const [row] = await sql`
        update sessions
        set refresh_token_hash = ${refreshTokenHash}, expires_at = ${expiresAt}, rotated_at = now()
        where id = ${id} and revoked_at is null
        returning *
      `
      return rowToSession(row)
    },

    async revokeSession(id) {
      await sql`update sessions set revoked_at = now() where id = ${id}`
    },

    async getPortfolio(userId) {
      const portfolios = await sql`
        select * from portfolios
        where user_id = ${userId}
        order by is_default desc, updated_at desc
      `

      if (!portfolios.length) return { accounts: [] }

      const portfolioIds = portfolios.map((item) => item.id)
      const accounts = await sql`select * from accounts where portfolio_id = any(${portfolioIds}) order by created_at asc`
      const accountIds = accounts.map((item) => item.id)
      const holdings = accountIds.length
        ? await sql`select * from holdings where account_id = any(${accountIds}) order by created_at asc`
        : []
      const watchlist = await sql`select * from watchlist_items where portfolio_id = any(${portfolioIds}) order by added_at asc`

      const holdingsByAccount = new Map()
      holdings.forEach((holding) => {
        if (!holdingsByAccount.has(holding.account_id)) holdingsByAccount.set(holding.account_id, [])
        holdingsByAccount.get(holding.account_id).push({
          id: holding.client_id || holding.id,
          ticker: holding.ticker,
          name: holding.name,
          sector: holding.sector,
          region: holding.region,
          market: holding.market,
          assetClass: holding.asset_class,
          currency: holding.currency,
          category: holding.category,
          quantity: toNumber(holding.quantity),
          avgPrice: toNumber(holding.avg_price),
          currentPrice: toNumber(holding.current_price),
          purchaseAmount: toNumber(holding.purchase_amount),
          marketValue: toNumber(holding.market_value),
          pnl: toNumber(holding.pnl),
          returnPct: toNumber(holding.return_pct),
          targetWeight: toNumber(holding.target_weight),
          memo: holding.memo,
          createdAt: new Date(holding.created_at).getTime(),
          updatedAt: new Date(holding.updated_at).getTime(),
        })
      })

      const accountsByPortfolio = new Map()
      accounts.forEach((account) => {
        if (!accountsByPortfolio.has(account.portfolio_id)) accountsByPortfolio.set(account.portfolio_id, [])
        accountsByPortfolio.get(account.portfolio_id).push({
          id: account.client_id || account.id,
          name: account.name,
          type: account.type,
          baseCurrency: account.base_currency,
          totalCapital: toNumber(account.total_capital),
          memo: account.memo,
          holdings: holdingsByAccount.get(account.id) || [],
          createdAt: new Date(account.created_at).getTime(),
          updatedAt: new Date(account.updated_at).getTime(),
        })
      })

      const watchlistByPortfolio = new Map()
      watchlist.forEach((item) => {
        if (!watchlistByPortfolio.has(item.portfolio_id)) watchlistByPortfolio.set(item.portfolio_id, [])
        watchlistByPortfolio.get(item.portfolio_id).push({
          ticker: item.ticker,
          name: item.name,
          addedAt: new Date(item.added_at).getTime(),
        })
      })

      const savedPortfolios = portfolios.map((portfolio) => ({
        id: portfolio.client_id || portfolio.id,
        name: portfolio.name,
        accounts: accountsByPortfolio.get(portfolio.id) || [],
        watchlist: watchlistByPortfolio.get(portfolio.id) || [],
        recentTickers: Array.isArray(portfolio.recent_tickers) ? portfolio.recent_tickers : [],
        preferences: portfolio.preferences || {},
        updatedAt: new Date(portfolio.updated_at).getTime(),
      }))

      const current = portfolios.find((item) => item.is_default) || portfolios[0]
      const currentClientId = current.client_id || current.id
      const currentSnapshot = savedPortfolios.find((item) => item.id === currentClientId) || savedPortfolios[0]

      return {
        currentPortfolioId: currentSnapshot.id,
        currentPortfolioName: currentSnapshot.name,
        accounts: currentSnapshot.accounts,
        savedPortfolios,
        watchlist: currentSnapshot.watchlist,
        recentTickers: currentSnapshot.recentTickers,
        preferences: currentSnapshot.preferences,
      }
    },

    async savePortfolio(userId, portfolio) {
      const { currentId, snapshots } = normalizePortfolioSnapshots(portfolio)
      await sql.transaction((txn) => [
        txn`delete from portfolios where user_id = ${userId}`,
        ...snapshots.flatMap((snapshot) => buildPortfolioQueries(txn, userId, snapshot, snapshot.id === currentId)),
      ])
      return this.getPortfolio(userId)
    },

    async trackEvent(event) {
      try {
        await sql`
          insert into app_events (user_id, type, payload, created_at)
          values (${event.userId || null}, ${event.type}, ${JSON.stringify(event.payload || {})}::jsonb, now())
        `
      } catch (error) {
        console.error('[Telemetry]', error.message)
      }
    },
  }
}
