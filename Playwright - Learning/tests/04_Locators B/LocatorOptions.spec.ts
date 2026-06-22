import { test, expect } from "@playwright/test";

/**
 * PLAYWRIGHT LOCATOR OPTIONS — ALL CONCEPTS IN ONE FILE
 * Site  : https://www.saucedemo.com
 * Flow  : Login → browse products → filter items → add to cart → checkout
 *
 * Concepts covered:
 *  1. has          — parent that CONTAINS a specific child element
 *  2. hasNot       — parent that does NOT CONTAIN a specific child element
 *  3. hasText      — element that CONTAINS specific text (string = case-insensitive)
 *  4. hasNotText   — element that does NOT CONTAIN specific text
 *  5. visible      — filter by visibility (v1.51+)
 *  6. Chaining     — stacking multiple .filter() calls
 *  7. pressSequentially vs fill
 *
 * ONE-TIME CONFIG — add to playwright.config.ts:
 *   use: { testIdAttribute: 'data-test' }
 */

test("Locator Options — Full Demo", async ({ page }) => {

  await page.goto("https://www.saucedemo.com");

  // ─────────────────────────────────────────────────────────────
  // 1. HAS — find the parent that CONTAINS a specific child
  // ─────────────────────────────────────────────────────────────
  // Problem  : both username & password fields share the class .form_group
  //            → page.locator('.form_group') matches 2 elements → Strict Mode Violation
  // Solution : keep only the .form_group that HAS an input with id="user-name"
  const usernameGroup = page.locator(".form_group").filter({
    has: page.locator("#user-name"), // inner locator scoped inside the outer one
  });
  await usernameGroup.click();
  await usernameGroup.pressSequentially("standard_user");
  // pressSequentially → simulates real key-by-key typing (use when app reacts to keystrokes)
  // fill             → instantly sets value (preferred for plain <input> fields)

  // ─────────────────────────────────────────────────────────────
  // 2. HASNOT — find the parent that does NOT CONTAIN a specific child
  // ─────────────────────────────────────────────────────────────
  // Still 2 .form_group divs — we want the one that is NOT the username group
  // hasNot excludes any element that contains the inner locator → only password group remains
  const passwordGroup = page.locator(".form_group").filter({
    hasNot: page.locator("#user-name"),
  });
  await passwordGroup.click();
  await passwordGroup.pressSequentially("secret_sauce");

  // Login
  await page.locator("#login-button").click();

  // Confirm login succeeded
  await expect(page.getByText("Products", { exact: true })).toBeVisible();

  // ─────────────────────────────────────────────────────────────
  // 3. HASTEXT (string) — element containing text (case-insensitive substring)
  // ─────────────────────────────────────────────────────────────
  // All 6 product cards share the class .inventory_item
  // hasText narrows down to the ONE card that contains this text anywhere inside it
  // NOTE: plain string → case-insensitive, e.g. "sauce" also matches "Sauce"
  const backpackCard = page.locator(".inventory_item").filter({
    hasText: "Sauce Labs Backpack",
  });
  await expect(backpackCard).toBeVisible();

  // ─────────────────────────────────────────────────────────────
  // 4. HASTEXT (RegExp) — exact / pattern-based text match
  // ─────────────────────────────────────────────────────────────
  // Use RegExp when you need strict matching or pattern control
  // /^...$/ anchors match the ENTIRE string → truly exact match
  const exactBackpackCard = page.locator(".inventory_item").filter({
    hasText: /Sauce Labs Backpack/, // anchored RegExp = exact, case-sensitive
  });
  await exactBackpackCard.getByRole("button", { name: "Add to cart" }).click();
  // Scoped action: find "Add to cart" ONLY inside this specific card — not any other card

  // Verify cart badge updated
  await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

  // ─────────────────────────────────────────────────────────────
  // 5. HASNOTTEXT (string) — element that does NOT contain the text
  // ─────────────────────────────────────────────────────────────
  // 6 product name links share the class .inventory_item_name
  // 5 of them contain "Sauce" — we want the ONE that does not
  // plain string → case-insensitive exclusion (substring)
  const nonSauceProduct = page.locator(".inventory_item_name").filter({
    hasNotText: "Sauce", // excludes all items whose name contains "sauce" (any case)
  });
  await expect(nonSauceProduct).toBeVisible();

  // ─────────────────────────────────────────────────────────────
  // 6. HASNOTTEXT (RegExp) — pattern-based exclusion
  // ─────────────────────────────────────────────────────────────
  // /Sauce.*/ matches "Sauce" followed by anything (0 or more characters)
  // hasNotText with this RegExp keeps only items that do NOT match this pattern
  const nonSauceProductRegex = page.locator(".inventory_item_name").filter({
    hasNotText: /Sauce.*/, // RegExp: exclude anything starting with "Sauce"
  });
  await nonSauceProductRegex.click(); // Only 1 result → no Strict Mode Violation

  await page.goBack();

  // ─────────────────────────────────────────────────────────────
  // 7. VISIBLE option (v1.51+) — filter by element visibility
  // ─────────────────────────────────────────────────────────────
  // Some pages keep duplicate hidden elements in the DOM (for animation/accessibility)
  // visible: true  → keep only the element the user can actually SEE
  // visible: false → keep only hidden/invisible elements
  const visibleBadge = page.locator(".shopping_cart_badge").filter({
    visible: true, // ensures we interact with the visible cart badge only
  });
  await expect(visibleBadge).toHaveText("1");

  // ─────────────────────────────────────────────────────────────
  // 8. CHAINING — stack multiple .filter() calls
  // ─────────────────────────────────────────────────────────────
  // All conditions must be true simultaneously
  // Reads top-to-bottom like a sentence — very maintainable
  // Prefer chaining over .first() — position is the least stable selector
  const backpackItem = page
    .locator(".inventory_item")
    .filter({ hasText: "Sauce Labs Bike Light" })     // right product
    .filter({ has: page.getByRole("button") })       // that still has an action button
    .filter({ hasNotText: "Remove" });               // and hasn't been added yet (Remove button absent)

  await backpackItem.getByRole("button", { name: "Add to cart" }).click();

  // ─────────────────────────────────────────────────────────────
  // 9. Proceed to checkout & confirm order
  // ─────────────────────────────────────────────────────────────
  await page.locator(".shopping_cart_link").click();
  await page.getByRole("button", { name: "Checkout" }).click();

  await page.getByPlaceholder("First Name").fill("John");
  await page.getByPlaceholder("Last Name").fill("Doe");
  await page.getByPlaceholder("Zip/Postal Code").fill("560001");

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Finish" }).click();

  await expect(page.getByText("Thank you for your order!")).toBeVisible();

});

/**
 * QUICK REVISION — KEY RULES
 * ─────────────────────────────────────────────────────────────
 * has          → parent CONTAINS inner element (pass a Locator)
 * hasNot       → parent does NOT CONTAIN inner element (pass a Locator)
 * hasText      → element CONTAINS text (pass String or RegExp)
 * hasNotText   → element does NOT CONTAIN text (pass String or RegExp)
 * visible      → filter by visibility: true = visible, false = hidden (v1.51+)
 *
 * String   → case-insensitive substring match
 * /RegExp/ → full pattern control (use /^exact$/ for strict matching)
 *
 * .filter() is preferred over page.locator(selector, { options })
 * Filters can be chained as many times as needed
 * Prefer chaining over .first() / .nth() — position is fragile
 *
 * fill()              → instantly sets input value      (use by default)
 * pressSequentially() → simulates real keystroke-by-key (use for autocomplete/counters)
 * .type()             → DEPRECATED — do not use
 */