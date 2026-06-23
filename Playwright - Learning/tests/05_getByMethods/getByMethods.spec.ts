import { test, expect } from "@playwright/test";

/**
 * ALL 7 getBy METHODS — SIMPLE DEMO
 *
 * Sites used:
 *  - https://demo.nopcommerce.com  → getByLabel, getByPlaceholder, getByText,
 *                                    getByAltText, getByTitle, getByRole
 *  - https://www.saucedemo.com     → getByTestId
 *
 * ONE-TIME CONFIG — add to playwright.config.ts (needed for getByTestId):
 *   use: { testIdAttribute: 'data-test' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. getByLabel — finds input by its <label> text
// ─────────────────────────────────────────────────────────────────────────────
test("getByLabel - fill email field", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com/login");

  // 'Email:' is the label text linked to the email input
  await page.getByLabel("Email:").fill("test@example.com");

  // exact: true → must match the full label text including punctuation
  // 'Email' alone would NOT match 'Email:' when exact is true
  await page.getByLabel("Email:", { exact: true }).fill("test@example.com");
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. getByPlaceholder — finds input by placeholder text (no label needed)
// ─────────────────────────────────────────────────────────────────────────────
test("getByPlaceholder - search for a product", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com");

  // 'Search store...' is the placeholder text inside the search input
  await page.getByPlaceholder("Search store...").fill("mobile");

  // substring also works — 'Search' matches 'Search store...'
  await page.getByPlaceholder("Search").fill("laptop");
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getByText — finds elements by visible text (use for non-interactive elements)
// ─────────────────────────────────────────────────────────────────────────────
test("getByText - read and assert page text", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com/register");

  // substring match (default) — 'New Customer' matches even 'New Customer!'
  const text = await page.getByText("New Customer").textContent();
  console.log(text); // prints the full text of that element

  // assert the element is visible on the page
  await expect(page.getByText("New Customer")).toBeVisible();

  // exact: true → only matches the exact full string
  await expect(
    page.getByText("New Customer", { exact: true })
  ).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. getByAltText — finds images by their alt attribute
// ─────────────────────────────────────────────────────────────────────────────
test("getByAltText - click the site logo image", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com");

  // the logo <img> has alt="nopCommerce demo store"
  // clicking it navigates back to the homepage
  await page.getByAltText("nopCommerce demo store").click();

  // substring also works
  await page.getByAltText("nopCommerce").click();
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. getByTitle — finds elements by their title attribute (tooltip text)
// ─────────────────────────────────────────────────────────────────────────────
test("getByTitle - click a category link", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com");

  // the Electronics link has title="Show products in category Electronics"
  // ⚠️ multiple elements may share the same title → use .first() to avoid
  //    Strict Mode Violation (better long term: use .filter() to be unique)
  await page.getByTitle("Show products in category Electronics").first().click();

  // confirm we landed on the Electronics page
  await expect(page.getByText("Electronics", { exact: true })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. getByRole — ⭐ MOST RECOMMENDED — finds by ARIA role + accessible name
// ─────────────────────────────────────────────────────────────────────────────
test("getByRole - search and navigate", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com");

  // fill the search box (role: searchbox or textbox)
  await page.getByPlaceholder("Search store...").fill("mobile");

  // click the Search button (role: button, name: visible button text)
  await page.getByRole("button", { name: "Search" }).click();

  // assert a heading exists on the results page
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();

  // click a navigation link (role: link, name: link text)
  await page.goto("https://demo.nopcommerce.com");
  await page.getByRole("link", { name: "Electronics" }).first().click();
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. getByTestId — finds by data-test attribute (configured in playwright.config.ts)
// ─────────────────────────────────────────────────────────────────────────────
test("getByTestId - login to saucedemo", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");

  // saucedemo uses data-test="username" and data-test="password"
  // playwright.config.ts must have: use: { testIdAttribute: 'data-test' }
  await page.getByTestId("username").fill("standard_user");
  await page.getByTestId("password").fill("secret_sauce");
  await page.getByTestId("login-button").click();

  // confirm login succeeded
  await expect(page.getByText("Products", { exact: true })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// BONUS — all methods together in one login + browse flow
// ─────────────────────────────────────────────────────────────────────────────
test("All getBy methods - combined flow", async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com");

  // getByAltText — logo image
  await expect(page.getByAltText("nopCommerce demo store")).toBeVisible();

  // getByRole — navigate to login via link
  await page.getByRole("link", { name: "Log in" }).click();

  // getByLabel — fill login form fields
  await page.getByLabel("Email:").fill("test@example.com");
  await page.getByLabel("Password:").fill("testpassword");

  // getByRole — click the login button
  await page.getByRole("button", { name: "Log in" }).click();

  // getByPlaceholder — search for a product
  await page.getByPlaceholder("Search store...").fill("phone");

  // getByRole — click search button
  await page.getByRole("button", { name: "Search" }).click();

  // getByText — assert result heading is visible
  await expect(page.getByText("Search")).toBeVisible();

  // getByTitle — click a category from nav
  await page.goto("https://demo.nopcommerce.com");
  await page.getByTitle("Show products in category Electronics").first().click();

  // getByRole — assert page heading
  await expect(
    page.getByRole("heading", { name: "Electronics" })
  ).toBeVisible();
});

/**
 * QUICK REVISION
 * ──────────────────────────────────────────────────────────────
 * getByLabel('text')         → input linked to a <label>
 * getByPlaceholder('text')   → input with placeholder (no label)
 * getByText('text')          → any visible text (div, span, p)
 * getByAltText('text')       → <img> or <area> with alt attribute
 * getByTitle('text')         → element with title attribute
 * getByRole('role',{name})   → ⭐ most recommended, use for all interactive elements
 * getByTestId('value')       → data-testid attribute (configure in playwright.config.ts)
 *
 * { exact: true }            → full string match (default is substring)
 * /RegExp/                   → pattern match (works in all methods)
 * .first()                   → use when multiple elements match (avoid if possible)
 */