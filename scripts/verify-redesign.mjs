import { chromium } from 'playwright'

const base = 'http://127.0.0.1:3001'
const routes = [
  { path: '/figma/portfolio', label: 'portfolio' },
  { path: '/figma/analysis', label: 'analysis' },
  { path: '/figma/settings', label: 'settings' },
]
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 900 },
]

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})

const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport })
  for (const route of routes) {
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource:')) {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))

    await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    const metrics = await page.evaluate(() => {
      const root = document.documentElement
      const body = document.body
      const horizontalOverflow = Math.max(root.scrollWidth, body.scrollWidth) > root.clientWidth + 2
      const visibleText = document.body.innerText
      const mainCards = document.querySelectorAll('[class*="rounded-"][class*="border"]').length
      const emptyError = /화면을 불러오는 중입니다|불러오는 중|분석할 포트폴리오 없음|계좌 없음/.test(visibleText)

      return {
        horizontalOverflow,
        mainCards,
        emptyError,
        bodyLength: visibleText.length,
      }
    })

    const screenshot = `/private/tmp/moayo-${route.label}-${viewport.name}.png`
    await page.screenshot({ path: screenshot, fullPage: false })
    results.push({ route: route.path, viewport: viewport.name, screenshot, consoleErrors, ...metrics })
    await page.close()
  }
  await context.close()
}

await browser.close()

const failures = results.filter((result) =>
  result.consoleErrors.length ||
  result.horizontalOverflow ||
  result.emptyError ||
  result.mainCards < 4 ||
  result.bodyLength < 500
)

console.log(JSON.stringify({ ok: failures.length === 0, results, failures }, null, 2))
if (failures.length) process.exit(1)
