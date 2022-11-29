import { test } from '@playwright/test'

test('test browser', async ({ page }) => {
  // point this to wherever you want
  await page.goto('http://127.0.0.1:5500/sermon.html?series=31&id=98')

  // keep browser open
  await page.pause()
})
