import { existsSync, readFileSync, writeFileSync } from 'fs'

const EMPTY_DB = { users: [], portfolios: {}, sessions: [], oauthIdentities: [], events: [] }

export function createJsonRepository(dbPath) {
  function read() {
    if (!existsSync(dbPath)) writeFileSync(dbPath, JSON.stringify(EMPTY_DB, null, 2))
    const db = JSON.parse(readFileSync(dbPath, 'utf8'))
    return {
      users: Array.isArray(db.users) ? db.users : [],
      portfolios: db.portfolios && typeof db.portfolios === 'object' ? db.portfolios : {},
      sessions: Array.isArray(db.sessions) ? db.sessions : [],
      oauthIdentities: Array.isArray(db.oauthIdentities) ? db.oauthIdentities : [],
      events: Array.isArray(db.events) ? db.events : [],
    }
  }

  function write(db) {
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
  }

  return {
    async health() {
      const db = read()
      return { ok: true, adapter: 'json', users: db.users.length, migrations: 0 }
    },

    async findUserByEmail(email) {
      return read().users.find((user) => user.email === email) || null
    },

    async findUserById(id) {
      return read().users.find((user) => user.id === id) || null
    },

    async findUserByVerificationToken(token) {
      return read().users.find((user) => user.verificationToken === token) || null
    },

    async findUserByOAuth(provider, providerId, email) {
      const field = `${provider}Id`
      const db = read()
      const identity = db.oauthIdentities.find((item) => item.provider === provider && item.providerUserId === providerId)
      return db.users.find((user) => user.id === identity?.userId || user[field] === providerId || (email && user.email === email)) || null
    },

    async linkOAuthIdentity(userId, provider, providerId) {
      const db = read()
      const exists = db.oauthIdentities.some((item) => item.provider === provider && item.providerUserId === providerId)
      if (!exists) {
        db.oauthIdentities.push({ userId, provider, providerUserId: providerId, createdAt: new Date().toISOString() })
        write(db)
      }
    },

    async createUser(user) {
      const db = read()
      db.users.push(user)
      db.portfolios[user.id] = { accounts: [], updatedAt: new Date().toISOString() }
      write(db)
      return user
    },

    async updateUser(id, updates) {
      const db = read()
      const user = db.users.find((item) => item.id === id)
      if (!user) return null
      Object.assign(user, updates)
      write(db)
      return user
    },

    async getPortfolio(userId) {
      return read().portfolios[userId] || { accounts: [] }
    },

    async savePortfolio(userId, portfolio) {
      const db = read()
      db.portfolios[userId] = { ...portfolio, updatedAt: new Date().toISOString() }
      write(db)
      return db.portfolios[userId]
    },

    async createSession(session) {
      const db = read()
      db.sessions.push({ ...session, revokedAt: null, createdAt: new Date().toISOString(), rotatedAt: new Date().toISOString() })
      write(db)
      return session
    },

    async findSessionByRefreshTokenHash(refreshTokenHash) {
      const now = Date.now()
      return read().sessions.find((session) =>
        session.refreshTokenHash === refreshTokenHash &&
        !session.revokedAt &&
        new Date(session.expiresAt).getTime() > now
      ) || null
    },

    async rotateSession(id, refreshTokenHash, expiresAt) {
      const db = read()
      const session = db.sessions.find((item) => item.id === id)
      if (!session || session.revokedAt) return null
      session.refreshTokenHash = refreshTokenHash
      session.expiresAt = expiresAt
      session.rotatedAt = new Date().toISOString()
      write(db)
      return session
    },

    async revokeSession(id) {
      const db = read()
      const session = db.sessions.find((item) => item.id === id)
      if (session) {
        session.revokedAt = new Date().toISOString()
        write(db)
      }
    },

    async trackEvent(event) {
      const db = read()
      db.events.push({ ...event, createdAt: new Date().toISOString() })
      db.events = db.events.slice(-1000)
      write(db)
    },
  }
}
