# Locator Options in Playwright — has, hasNot, hasText, hasNotText — Structured Notes

This is Part 7 of the Playwright + TypeScript series. It covers how to **narrow down a locator that matches multiple elements** into a single, unique one — using the four filter options: `has`, `hasNot`, `hasText`, and `hasNotText`.

---

## ⚠️ Important Update — Video Is Outdated on Two Things

| Video (older) | Current Playwright |
|---|---|
| Options passed as 2nd argument to `page.locator(selector, { options })` | Still works, **but `locator.filter({ options })` is now the recommended approach** — it's chainable, composable, and pairs naturally with semantic locators like `getByRole()` |
| `.type()` used for typing text into a field | `.type()` is **deprecated** — use `.pressSequentially()` (which the video itself corrected to, but it's worth making explicit) |
| `hasText` string described as case-sensitive | **Incorrect** — when a plain string is passed, `hasText` and `hasNotText` are **case-insensitive substring matches** by default. Use a RegExp (`/^Exact Text$/`) for strict matching. |
| `hasNot` and `hasNotText` treated as always available | These were **added in Playwright v1.33** — if you're on an older version they won't exist. Update to at least v1.33. |
| `visible` option not mentioned | A **`visible` option** was added in Playwright v1.51 — covered at the end of these notes. |

---

## 1. The Problem These Options Solve

When a locator matches **more than one element**, Playwright throws a **Strict Mode Violation** error — it refuses to act on an ambiguous match.

**Example of the problem:**
- On saucedemo.com's login page, both the username and password fields are wrapped in a `<div class="form_group">`.
- Using `page.locator('.form_group')` matches **two** elements (one for each field).
- Playwright will refuse to perform any action (click, fill, etc.) because it can't decide which div you meant.

**The solution:** Use filter options to narrow the match down from multiple elements to the exact one you want, **without** having to write a more complex/fragile CSS or XPath selector.

---

## 2. Two Ways to Apply Filters (Old vs. Current)

Both syntaxes are valid and produce the same result. Prefer `.filter()` for new code.

### Old way — options as second argument to `page.locator()`
```ts
page.locator('.form_group', { has: page.locator('#user-name') })
```

### ✅ Current recommended way — `.filter()` chained onto any locator
```ts
page.locator('.form_group').filter({ has: page.locator('#user-name') })
```

**Why `.filter()` is preferred now:**
- Works on **any** locator — including semantic ones like `getByRole()`, `getByText()`, etc.
- Can be **chained multiple times** to layer conditions.
- More readable — reads like a sentence: *"get all rows, then filter to those containing an Edit button, then filter to those not marked Suspended"*.
- Naturally combines with the modern locator-first API.

---

## 3. The Four Filter Options

### 3.1 `has` — match parent that contains a specific child element

**What it does:** From a set of matched elements, keeps only those that **contain** a specific inner/child element (matched by another locator).

**When to use it:** When multiple parent elements share the same selector, and you want the one that wraps a specific inner element (e.g., the form group that contains the username input, not the password input).

**Syntax:**
```ts
parentLocator.filter({ has: innerLocator })
```

**Example — find the `form_group` div that contains the username field:**
```ts
// Both form_group divs match, but only one contains #user-name
const usernameGroup = page.locator('.form_group').filter({
  has: page.locator('#user-name')
});

await usernameGroup.click();
await usernameGroup.pressSequentially('standard_user');
```

> **Note:** The `innerLocator` passed to `has` must be scoped to the **same frame** as the outer locator. It also cannot contain `FrameLocators`.

**Real-world use case:** Finding the correct table row that contains an "Edit" button:
```ts
const editableRow = page.getByRole('row').filter({
  has: page.getByRole('button', { name: 'Edit' })
});
await editableRow.getByRole('button', { name: 'Edit' }).click();
```

---

### 3.2 `hasNot` — match parent that does NOT contain a specific child element

**What it does:** The exact inverse of `has` — keeps only elements that **do not** contain the specified inner locator.

**When to use it:** When you want every instance *except* the one wrapping a specific child element. Classic use cases: finding "out of stock" items, disabled rows, inactive cards.

**Syntax:**
```ts
parentLocator.filter({ hasNot: innerLocator })
```

**Example — find the `form_group` that is NOT the username group (i.e., the password group):**
```ts
const passwordGroup = page.locator('.form_group').filter({
  hasNot: page.locator('#user-name')
});

await passwordGroup.click();
await passwordGroup.pressSequentially('secret_sauce');
```

**Real-world use case:** Finding items that do not have an "Out of Stock" badge:
```ts
const availableItems = page.getByRole('listitem').filter({
  hasNot: page.getByText('Out of Stock')
});
```

---

### 3.3 `hasText` — match element containing specific visible text

**What it does:** From a set of matched elements, keeps only those that **contain** a specified text value — anywhere inside the element, including in child or descendant elements.

**When to use it:** When multiple elements share the same selector and you want the one displaying a particular piece of text (e.g., click the product card for "Sauce Labs Backpack" in a list of six product cards).

**Syntax:**
```ts
locator.filter({ hasText: 'some text' })         // string — case-insensitive substring
locator.filter({ hasText: /^Exact Text$/ })      // RegExp — for strict/partial control
```

**⚠️ IMPORTANT — String matching is case-insensitive (updated from video):**
- When you pass a **plain string**, `hasText` does a **case-insensitive substring** search.
- `'sauce'` will match `"Sauce Labs Backpack"`, `"SAUCE Labs"`, etc.
- For **exact, case-sensitive** matching, use a **RegExp** with anchors: `/^Sauce Labs Backpack$/`

**Example — click the specific product link in a list:**
```ts
// All anchor tags matching this XPath — many results, not unique
await page.locator('//a').filter({ hasText: 'Sauce Labs Backpack' }).click();
```

**Using RegExp for exact match:**
```ts
await page.locator('//a').filter({ hasText: /^Sauce Labs Backpack$/ }).click();
```

**Real-world use case — find a specific product card and click its "Add to cart" button:**
```ts
const backpackCard = page.getByRole('listitem').filter({
  hasText: 'Sauce Labs Backpack'
});
await backpackCard.getByRole('button', { name: 'Add to cart' }).click();
```
This pattern — **filter to the right card, then scope an action within it** — is one of the most powerful and common patterns in Playwright.

---

### 3.4 `hasNotText` — match element NOT containing specific text

**What it does:** The inverse of `hasText` — keeps only elements that **do not** contain the specified text anywhere inside them.

**When to use it:** When you want to exclude certain elements from a set based on visible text. Common in filtering dashboards, tables, or product lists.

**Syntax:**
```ts
locator.filter({ hasNotText: 'some text' })       // string — case-insensitive
locator.filter({ hasNotText: /pattern/ })         // RegExp for pattern-based exclusion
```

**String vs. RegExp behavior (same as `hasText`):**
- Plain string → case-insensitive substring exclusion.
- RegExp → full pattern control.

**Example — on saucedemo's product page, find the ONE product that doesn't have "Sauce" in its name (out of 6 products):**
```ts
// All 6 product name links share the class 'inventory_item_name'
// 5 of them start with "Sauce..." — 1 does not
await page.locator('.inventory_item_name').filter({
  hasNotText: /Sauce.*/     // RegExp: exclude anything starting with "Sauce"
}).click();
```

**Why RegExp was used here:** The text to exclude is a *pattern* (`Sauce` followed by anything) — multiple products start with "Sauce" but have different endings. A plain string `'Sauce'` would have worked equally well here since it's a case-insensitive substring match, but RegExp makes the intent clearer and gives more control.

**Real-world use case — find only "Active" orders (exclude cancelled):**
```ts
const activeOrders = page.getByRole('row').filter({
  hasNotText: 'Cancelled'
});
```

---

## 4. New in Current Playwright — `visible` option (v1.51+)

Not covered in the video at all. Added in Playwright v1.51.

**What it does:** Filters elements by whether they are **visible or hidden** on the page.

```ts
// Only keep visible elements from a matched set
page.locator('.tooltip').filter({ visible: true })

// Only keep hidden/invisible elements
page.locator('.spinner').filter({ visible: false })
```

**When to use it:** When your DOM has duplicate elements (one visible, one hidden for accessibility/animation reasons) and you want to act only on the visible one.

---

## 5. Chaining Multiple Filters

Filters can be **chained one after another** — all conditions must be true simultaneously. This is one of the most powerful patterns in modern Playwright.

```ts
const targetRow = page
  .getByRole('row')
  .filter({ hasText: 'admin@example.com' })   // right user
  .filter({ has: page.getByRole('button', { name: 'Edit' }) })  // that can be edited
  .filter({ hasNotText: 'Suspended' });        // and is not suspended

await targetRow.getByRole('button', { name: 'Edit' }).click();
```

**Tips for chaining:**
- Order doesn't affect correctness — all filters must hold.
- Read top-to-bottom as a sentence to keep tests readable.
- Prefer adding more filters over using `.first()` when you still get multiple matches — position-based selection is the least stable approach.

---

## 6. `pressSequentially()` vs. the Deprecated `.type()`

The video catches itself mid-way and switches from `.type()` to `.pressSequentially()`. Here's the clear picture:

| Method | Status | Behavior |
|---|---|---|
| `.type('text')` | **Deprecated** ❌ | Do not use — will be removed |
| `.fill('text')` | ✅ Current | Instantly sets the field value — best for standard `<input>` fields |
| `.pressSequentially('text')` | ✅ Current | Simulates key-by-key typing — use when the app responds to individual keystrokes (e.g., autocomplete, character counters) |

**Why `.pressSequentially()` was needed in the video:** The locator targeted a `<div>` wrapper, not the `<input>` itself. `.fill()` only works directly on input/textarea elements. When you're clicking a parent container and then typing, `.pressSequentially()` simulates the actual keyboard events that the browser receives.

In practice: **always prefer targeting the `<input>` directly** and using `.fill()` — it's cleaner and more reliable. `.pressSequentially()` is a special-purpose tool, not the default.

---

## 7. Complete Updated Code Example (saucedemo login flow)

```ts
import { test, expect } from "@playwright/test";

test("Locator filter options demo", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");

  // ── has: find the form group wrapping the username input ──
  const usernameGroup = page.locator('.form_group').filter({
    has: page.locator('#user-name')
  });
  await usernameGroup.click();
  await usernameGroup.pressSequentially('standard_user');

  // ── hasNot: find the form group that is NOT the username group ──
  const passwordGroup = page.locator('.form_group').filter({
    hasNot: page.locator('#user-name')
  });
  await passwordGroup.click();
  await passwordGroup.pressSequentially('secret_sauce');

  // Login
  await page.locator('#login-button').click();
  await expect(page.getByText('Products', { exact: true })).toBeVisible();

  // ── hasText (string): find the product link by visible text ──
  await page.locator('//a').filter({
    hasText: 'Sauce Labs Backpack'
  }).click();
  await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();

  await page.goBack();

  // ── hasText (RegExp): exact match using anchored pattern ──
  const backpackCard = page.getByRole('listitem').filter({
    hasText: /^Sauce Labs Backpack$/
  });
  await backpackCard.getByRole('button', { name: 'Add to cart' }).click();

  // ── hasNotText (RegExp): click the ONE product without "Sauce" in its name ──
  await page.locator('.inventory_item_name').filter({
    hasNotText: /Sauce.*/
  }).click();

});
```

---

## 8. Quick Reference Summary

| Option | Accepts | What it keeps |
|---|---|---|
| `has` | Locator | Elements that **contain** a matching inner element |
| `hasNot` | Locator | Elements that **do NOT contain** a matching inner element |
| `hasText` | String (case-insensitive) or RegExp | Elements that **contain** the text anywhere inside |
| `hasNotText` | String (case-insensitive) or RegExp | Elements that **do NOT contain** the text anywhere inside |
| `visible` *(v1.51+)* | Boolean | Elements that are visible (`true`) or hidden (`false`) |

| | String behavior | RegExp behavior |
|---|---|---|
| `hasText` | Case-insensitive substring match | Full pattern control |
| `hasNotText` | Case-insensitive substring exclusion | Full pattern control |

---

## 9. Key Takeaways

1. **The core purpose** of these filter options is to resolve "Strict Mode Violation" errors — Playwright's way of telling you a locator matched more than one element.
2. **Use `locator.filter()`** (not the 2nd argument of `page.locator()`) for new code — it's the current recommended pattern and works with all locator types including `getByRole()`.
3. **`hasText` and `hasNotText` with a plain string are case-insensitive** — the video implied otherwise. Use RegExp for exact/strict control.
4. **`has` and `hasNot` accept a Locator** — meaning you can use semantic locators (`getByRole`, `getByText`, etc.) as the inner condition, not just raw CSS/XPath.
5. **Chain filters freely** — each `.filter()` call narrows the set further; all conditions must hold.
6. **Prefer `.fill()` over `.pressSequentially()`** unless the application genuinely reacts to individual keystrokes. Never use the deprecated `.type()`.
7. **Check the `visible` option** when dealing with pages that keep duplicate hidden elements in the DOM.