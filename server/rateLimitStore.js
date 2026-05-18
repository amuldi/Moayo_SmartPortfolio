function hasUpstashEnv() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function upstashCommand(command) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!response.ok) throw new Error(`Upstash rate limit request failed: ${response.status}`)
  return response.json()
}

export function createDistributedRateLimitStore(prefix) {
  if (!hasUpstashEnv()) return undefined

  let windowMs = 15 * 60 * 1000

  return {
    init(options) {
      windowMs = options.windowMs
    },

    async increment(key) {
      const redisKey = `moayo:${prefix}:${key}`
      const result = await upstashCommand([
        ['INCR', redisKey],
        ['PEXPIRE', redisKey, String(windowMs), 'NX'],
      ])
      const totalHits = Number(result?.[0]?.result || 0)
      return {
        totalHits,
        resetTime: new Date(Date.now() + windowMs),
      }
    },

    async decrement() {},

    async resetKey(key) {
      await upstashCommand([['DEL', `moayo:${prefix}:${key}`]])
    },
  }
}
