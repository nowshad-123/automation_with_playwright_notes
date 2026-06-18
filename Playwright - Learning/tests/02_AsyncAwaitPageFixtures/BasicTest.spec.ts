import { test } from "@playwright/test";
 
// ASYNC: marks this function as asynchronous so we can use "await" inside it.
// PAGE FIXTURE: "page" is auto-provided by Playwright — it's the browser tab
// we use to perform actions like navigating, clicking, typing, etc.
test("Basic Steps to Start with Playwright", async ({ page }) => {
 
  // AWAIT: pauses here until the page fully loads, before moving to the next line.
  await page.goto("https://www.google.com");
 
  // AWAIT: pauses here until the click action is completed.
  await page.getByRole('button', { name: 'Google apps' }).click();
 
});