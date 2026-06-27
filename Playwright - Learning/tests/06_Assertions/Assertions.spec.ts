import { test, expect } from "@playwright/test";

/**
 * ALL PLAYWRIGHT ASSERTIONS — SAMPLE CODE
 *
 * Site : https://www.saucedemo.com
 * Flow : Login → verify inventory → add to cart → checkout → confirm order
 *
 * Assertions covered:
 *  Auto-Retrying  : toHaveCount, toBeEnabled, toBeDisabled, toBeVisible,
 *                   toBeHidden, toHaveText, toHaveAttribute, toHaveId,
 *                   toHaveClass, toHaveURL, toHaveTitle
 *  Non-Retrying   : toBe, toEqual, toBeTruthy, toContain
 *  Modifiers      : .not  — negative match
 *  Special        : expect.soft — continue after failure
 *  Custom message : second argument to expect()
 *
 * ONE-TIME CONFIG — playwright.config.ts:
 *   use: { testIdAttribute: 'data-test' }
 */

test("All Assertions Demo — saucedemo full flow", async ({ page }) => {

  // ── Navigate to the site ──────────────────────────────────────────────────
  await page.goto("https://www.saucedemo.com");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveTitle — verify the browser tab title
  // takes: page (not a locator)
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveTitle("Swag Labs");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveURL — verify the current page URL
  // takes: page (not a locator)
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveURL("https://www.saucedemo.com/");

  // ─────────────────────────────────────────────────────────────────────────
  // toBeVisible — verify login button is visible on screen
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByTestId("login-button")).toBeVisible();

  // ─────────────────────────────────────────────────────────────────────────
  // toBeEnabled — verify login button can be clicked (not disabled)
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByTestId("login-button")).toBeEnabled();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveText — verify the login button label text
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByTestId("login-button")).toHaveText("Login");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveAttribute — verify the button has the correct type attribute
  // first arg: attribute name | second arg: expected value
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByTestId("login-button")).toHaveAttribute(
    "type",
    "submit"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveId — verify the element has the correct id
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByTestId("login-button")).toHaveId("login-button");

  // ─────────────────────────────────────────────────────────────────────────
  // .not — negative match: verify page title is NOT "Google"
  // .not works with any assertion — just add it before the matcher
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).not.toHaveTitle("Google");

  // ─────────────────────────────────────────────────────────────────────────
  // Custom error message — second argument to expect()
  // appears in the failure report instead of the default message
  // ─────────────────────────────────────────────────────────────────────────
  await expect(
    page.getByTestId("login-button"),
    "Login button must be visible before attempting to log in"
  ).toBeVisible();

  // ── Fill credentials and log in ───────────────────────────────────────────
  await page.getByTestId("username").fill("standard_user");
  await page.getByTestId("password").fill("secret_sauce");
  await page.getByTestId("login-button").click();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveURL — verify redirect to inventory page after login
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveTitle — page title stays the same after login
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveTitle("Swag Labs");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveCount — verify exactly 6 products are listed
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator(".inventory_item")).toHaveCount(6);

  // ─────────────────────────────────────────────────────────────────────────
  // toBeHidden — verify error message is NOT shown after successful login
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator('[data-test="error"]')).toBeHidden();

  // ─────────────────────────────────────────────────────────────────────────
  // .not + toBeVisible — alternative way to check something is not visible
  // both toBeHidden and .not.toBeVisible achieve the same result
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator('[data-test="error"]')).not.toBeVisible();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveClass — verify the inventory container has the correct class
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator(".inventory_container")).toHaveClass(
    "inventory_container"
  );

  // ── Add Sauce Labs Backpack to cart ───────────────────────────────────────
  await page.getByTestId("add-to-cart-sauce-labs-backpack").click();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveText — verify cart badge shows "1" after adding one item
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

  // ─────────────────────────────────────────────────────────────────────────
  // toBeDisabled — verify "Add to cart" button is gone (button changed to "Remove")
  // The add-to-cart button is replaced by Remove after clicking
  // Use .not.toBeVisible() to confirm the original button is no longer shown
  // ─────────────────────────────────────────────────────────────────────────
  await expect(
    page.getByTestId("add-to-cart-sauce-labs-backpack")
  ).not.toBeVisible();

  // ─────────────────────────────────────────────────────────────────────────
  // expect.soft — continue test even if this assertion fails
  // use when you want to collect ALL failures rather than stop at first one
  // ─────────────────────────────────────────────────────────────────────────
  await expect.soft(
    page.locator(".shopping_cart_badge"),
    "Cart badge should show 1 after adding one item"
  ).toHaveText("1");

  await expect.soft(page.locator(".shopping_cart_badge")).toBeVisible();
  // even if the above soft assertions fail, test continues to next lines

  // ── Go to cart and checkout ───────────────────────────────────────────────
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveCount — verify exactly 1 item in the cart
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator(".cart_item")).toHaveCount(1);

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveText — verify the correct product is in the cart
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.locator(".inventory_item_name")).toHaveText(
    "Sauce Labs Backpack"
  );

  // ── Proceed through checkout ──────────────────────────────────────────────
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByPlaceholder("First Name").fill("John");
  await page.getByPlaceholder("Last Name").fill("Doe");
  await page.getByPlaceholder("Zip/Postal Code").fill("560001");
  await page.getByRole("button", { name: "Continue" }).click();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveURL — verify we are on the checkout overview page
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveURL(
    "https://www.saucedemo.com/checkout-step-two.html"
  );

  await page.getByRole("button", { name: "Finish" }).click();

  // ─────────────────────────────────────────────────────────────────────────
  // toBeVisible — verify order confirmation message is shown
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page.getByText("Thank you for your order!")).toBeVisible();

  // ─────────────────────────────────────────────────────────────────────────
  // toHaveURL — verify we landed on the confirmation page
  // ─────────────────────────────────────────────────────────────────────────
  await expect(page).toHaveURL(
    "https://www.saucedemo.com/checkout-complete.html"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NON-RETRYING ASSERTIONS — plain value comparisons (no await, no browser)
// ─────────────────────────────────────────────────────────────────────────────
test("Non-Retrying Assertions — value comparisons", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");

  // toBe — strict equality (===)
  expect(1 + 1).toBe(2);
  expect("hello").toBe("hello");

  // toEqual — deep equality (useful for objects and arrays)
  expect({ name: "John" }).toEqual({ name: "John" });
  expect([1, 2, 3]).toEqual([1, 2, 3]);

  // toBeTruthy — value is truthy (anything that isn't false/null/undefined/0/"")
  expect(1).toBeTruthy();
  expect("text").toBeTruthy();

  // toBeFalsy — value is falsy
  expect(0).toBeFalsy();
  expect("").toBeFalsy();

  // toContain — string or array contains the given item
  expect("Sauce Labs Backpack").toContain("Backpack");
  expect([1, 2, 3]).toContain(2);

  // .not with non-retrying assertions
  expect(5).not.toBe(10);
  expect("hello").not.toContain("world");
});

/**
 * QUICK REVISION
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTO-RETRYING (use await — retries until pass or 5s timeout)
 *   toHaveCount(n)              → n elements match the locator
 *   toBeEnabled()               → element is interactive
 *   toBeDisabled()              → element is disabled
 *   toBeVisible()               → element is on screen
 *   toBeHidden()                → element is not visible
 *   toHaveText('...')           → element has this text
 *   toHaveAttribute('a', 'v')  → element has attribute with value
 *   toHaveId('...')             → element has this id
 *   toHaveClass('...')          → element has this CSS class
 *   toHaveURL('...')            → page is on this URL       (pass: page)
 *   toHaveTitle('...')          → page has this tab title   (pass: page)
 *
 * NON-RETRYING (no await — instant value checks only)
 *   toBe(v)        → strict equality ===
 *   toEqual(v)     → deep equality (objects/arrays)
 *   toBeTruthy()   → truthy value
 *   toBeFalsy()    → falsy value
 *   toContain(v)   → string or array contains v
 *
 * MODIFIERS
 *   .not           → inverts any assertion
 *   expect.soft()  → assertion fails but test continues (collects all failures)
 *
 * CUSTOM MESSAGE
 *   expect(locator, 'your message here').toBeVisible()
 *   → replaces default failure message with your text
 */