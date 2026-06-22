import { test, expect } from "@playwright/test";

/**
 * ALL-LOCATORS-IN-ONE DEMO
 * Site: https://www.saucedemo.com
 * Flow: Login → view product → add to cart → checkout → confirm order
 *
 * This single test intentionally uses every locator strategy covered in
 * the notes, applied to a real, meaningful element at each step (not
 * just repeating the same element with different syntax).
 *
 * ⚠️ ONE-TIME SETUP REQUIRED for getByTestId() to work:
 * saucedemo.com uses a `data-test` attribute (not Playwright's default
 * `data-testid`). Add this to your playwright.config.ts:
 *
 *   export default defineConfig({
 *     use: {
 *       testIdAttribute: 'data-test',
 *     },
 *   });
 *
 * Run with: npx playwright test all_locators_demo.spec.ts --headed
 */

test("Full checkout flow using every locator strategy", async ({ page }) => {

  await page.goto("https://www.saucedemo.com");

  // ── getByPlaceholder() — fields here use placeholder text, no <label> ──
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');

  // ── getByRole() — login button's accessible name comes from its value attr ──
  await page.getByRole('button', { name: 'Login' }).click();

  // ── getByText() — confirms login succeeded via the page header ──
  await expect(page.getByText('Products', { exact: true })).toBeVisible();

  // ── getByAltText() — product image alt text matches the product name ──
  await expect(page.getByAltText('Sauce Labs Backpack')).toBeVisible();

  // ── getByTestId() — uses data-test attribute (see config note above) ──
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

  // ── getByLabel() — NOT used here: saucedemo's inputs have no <label>,
  // they rely on placeholders only. On a site that does use labels:
  //   await page.getByLabel('Email').fill('test@example.com');

  // ── CSS Selector (class) — verify the cart badge updated to "1" ──
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  // ── XPath (attribute-based) — open the cart via the cart icon ──
  await page.locator("//a[@data-test='shopping-cart-link']").click();

  // ── text= selector engine (legacy string syntax) — confirm item in cart ──
  await expect(page.locator("text='Sauce Labs Backpack'")).toBeVisible();

  // ── CSS Selector (ID) — proceed to checkout ──
  await page.locator('#checkout').click();

  // ── CSS Selector (attribute) — fill first name ──
  await page.locator("input[data-test='firstName']").fill('John');

  // ── id= selector engine (legacy string syntax) — fill last name ──
  await page.locator("id=last-name").fill('Doe');

  // ── CSS Selector (attribute) — fill postal code ──
  await page.locator("input[data-test='postalCode']").fill('560001');

  // ── getByRole() — continue to the order overview ──
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Checkout: Overview', { exact: true })).toBeVisible();

  // ── getByRole() — finish the order ──
  await page.getByRole('button', { name: 'Finish' }).click();

  // ── getByText() — final confirmation message ──
  await expect(page.getByText('Thank you for your order!')).toBeVisible();

});