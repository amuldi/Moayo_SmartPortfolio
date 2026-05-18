import { expect, test } from '@playwright/test'

test('guest can enter the app and view core portfolio/rebalancing surfaces', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /흩어진 투자 계좌/ })).toBeVisible()

  await page.getByRole('button', { name: /게스트로 시작/ }).click()
  await expect(page).toHaveURL(/\/portfolio/)
  await expect(page.getByRole('heading', { name: /포트폴리오|내 포트폴리오/ })).toBeVisible()

  await page.getByRole('link', { name: /리밸런싱/ }).click()
  await expect(page).toHaveURL(/\/analysis/)
  await expect(page.getByRole('heading', { name: '리밸런싱', level: 1 })).toBeVisible()
  await expect(page.getByText('분석할 포트폴리오 없음')).toBeVisible()
})
