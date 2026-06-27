# Assertions in Playwright — Detailed Structured Notes

This section covers **what assertions are, why they matter, the two types of assertions, all commonly used assertion methods, negative matching, custom error messages, and soft assertions.**

---

## 1. What Are Assertions?

Assertions are **checks or verifications** placed inside a test to confirm that the application is behaving as expected.

### Why assertions are critical — a clear example

Imagine a login test that:
1. Fills in a username
2. Fills in a password
3. Clicks the Login button

Without an assertion, the test **passes even if login fails**. If the server returns a `404` error page after clicking Login, the test has no way to know — it just ran the three steps and called it a success.

With an assertion:
```
After clicking Login → verify that the "Products" heading is visible
```
Now if the login fails and the page shows an error instead, the assertion catches it and **fails the test** — which is exactly what should happen.

> **Rule:** Every meaningful test action should be followed by at least one assertion confirming the expected result.

### How assertions work in Playwright
Playwright provides assertions through the **`expect()` function**, which must be imported alongside `test`:

```ts
import { test, expect } from "@playwright/test";
```

> ⚠️ If `expect` is not imported, you will get a "Cannot find name 'expect'" error.

---

## 2. Two Types of Assertions

### 2.1 Auto-Retrying Assertions ✅ (Preferred)

- **Automatically retry** checking the condition repeatedly until either:
  - The assertion **passes**, or
  - The **timeout is reached** (default: 5,000ms / 5 seconds)
- Handle **asynchronous page behaviour** naturally — they wait for elements to appear, values to update, etc.
- Must use `await` since they are asynchronous.
- **Playwright recommends using these wherever possible.**

```ts
await expect(locator).toBeVisible();     // retries until visible or timeout
```

### 2.2 Non-Retrying Assertions ⚠️ (Use with caution)

- Check the condition **once, immediately** — no retrying.
- Do **not** use `await` (they are synchronous).
- Because web apps load data asynchronously, non-retrying assertions can produce **flaky tests** — they may fail simply because data hasn't loaded yet by the time they check.
- Playwright recommends **avoiding these unless necessary**.

```ts
expect(5).toBe(5);     // checks immediately, no retry, no await
```

> **Summary:** Use auto-retrying assertions for anything related to the browser/page. Use non-retrying assertions only for simple in-memory value comparisons (numbers, strings, booleans).

---

## 3. Auto-Retrying Assertions — All Commonly Used

All of these require `await` and accept a **locator** or **page** as the argument inside `expect()`.

---

### 3.1 `toHaveCount()` — check how many elements exist

**What it does:** Verifies that a locator matches exactly N elements on the page.

**When to use it:** Confirming a specific number of items exist — e.g., one login button, six product cards, three error messages.

```ts
// Verify exactly 1 login button exists on the page
await expect(page.locator('[data-test="login-button"]')).toHaveCount(1);
```

---

### 3.2 `toBeEnabled()` — check element is enabled (interactive)

**What it does:** Verifies that a form element (button, input, etc.) is **not disabled** and can be interacted with.

**When to use it:** Before filling a form or clicking a button — confirm it's actually clickable.

```ts
await expect(page.locator('[data-test="login-button"]')).toBeEnabled();
```

---

### 3.3 `toBeDisabled()` — check element is disabled

**What it does:** The opposite of `toBeEnabled()` — verifies the element **cannot** be interacted with.

**When to use it:** After form validation, confirming a Submit button is disabled until all required fields are filled.

```ts
await expect(page.locator('[data-test="login-button"]')).toBeDisabled();
// ⚠️ Will FAIL and show a timeout error if the element is actually enabled
```

**Failure message example:**
```
Timeout 5,000ms exceeded
Expected: disabled
Received: enabled
```

---

### 3.4 `toBeVisible()` — check element is visible on screen

**What it does:** Verifies that an element exists in the DOM **and** is visible (not hidden, not `display:none`).

**When to use it:** After navigating or clicking — confirm an expected element has appeared.

```ts
await expect(page.locator('[data-test="login-button"]')).toBeVisible();
```

---

### 3.5 `toBeHidden()` — check element is hidden

**What it does:** The opposite of `toBeVisible()` — verifies that an element is **not visible** (hidden, not rendered, or doesn't exist).

**When to use it:** Confirming a modal has closed, an error message has disappeared, or a loader has gone away.

```ts
await expect(page.locator('[data-test="login-button"]')).toBeHidden();
// ⚠️ Will FAIL if the element is actually visible
```

---

### 3.6 `toHaveText()` — check element contains specific text

**What it does:** Verifies that an element's visible text matches the expected value.

**When to use it:** Confirming a button label, page heading, error message, or any text content.

```ts
// Verify the login button shows the text "Login"
await expect(page.locator('[data-test="login-button"]')).toHaveText('Login');
```

- Accepts a **string** (substring/exact depending on usage), **RegExp**, or an **array of strings** (for multiple elements).
- By default, trims whitespace and does a full-text match for a single element.

---

### 3.7 `toHaveAttribute()` — check element has a specific attribute and value

**What it does:** Verifies that an element has a specific HTML attribute set to a specific value.

**When to use it:** Checking that an input has the correct `type`, a link has the right `href`, or any custom attribute is set correctly.

```ts
// Verify the login button has attribute name="login-button"
await expect(page.locator('[data-test="login-button"]'))
  .toHaveAttribute('name', 'login-button');
```

- **First argument:** The attribute name (e.g., `'name'`, `'type'`, `'href'`, `'class'`)
- **Second argument:** The expected attribute value

---

### 3.8 `toHaveId()` — check element has a specific `id`

**What it does:** A shortcut for checking the element's `id` attribute specifically.

**When to use it:** When you want to quickly confirm an element has the correct `id`.

```ts
await expect(page.locator('[data-test="login-button"]')).toHaveId('login-button');
```

> This is equivalent to `.toHaveAttribute('id', 'login-button')` — just shorter.

---

### 3.9 `toHaveClass()` — check element has a specific CSS class

**What it does:** Verifies that an element has the specified CSS class applied.

**When to use it:** Confirming an active state, an error state, or a highlighted element through its class.

```ts
await expect(page.locator('[data-test="login-button"]')).toHaveClass('btn-primary');
```

---

### 3.10 `toHaveURL()` — check the current page URL

**What it does:** Verifies that the browser is currently on the expected URL.

**When to use it:** After clicking a link or submitting a form — confirm navigation happened correctly.

```ts
// Verify page is on the correct URL after login
await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

// Substring / RegExp also works
await expect(page).toHaveURL(/inventory/);
```

> **Key difference:** `toHaveURL()` takes **`page`** as the argument to `expect()`, not a locator.

**Failure message example (wrong URL passed):**
```
Timeout 5,000ms exceeded
Expected: https://www.saucedemo.com/abcxyz
Received: https://www.saucedemo.com/inventory.html
```

---

### 3.11 `toHaveTitle()` — check the page's browser tab title

**What it does:** Verifies that the current page's `<title>` tag matches the expected value.

**When to use it:** Confirming you're on the correct page, or that the page title updated after an action.

```ts
await expect(page).toHaveTitle('Swag Labs');

// Partial match with RegExp
await expect(page).toHaveTitle(/Swag/);
```

> Like `toHaveURL()`, this takes **`page`** not a locator.

---

## 4. Non-Retrying Assertion — Example

Non-retrying assertions are used for **plain value comparisons** — not browser elements.

### `toBe()` — check two values are strictly equal

```ts
// No await — this is synchronous
expect(5).toBe(5);    // ✅ passes
expect(5).toBe(4);    // ❌ fails immediately

// Failure message:
// Expected: 4
// Received: 5
```

Other non-retrying assertions include: `toEqual()`, `toBeTruthy()`, `toBeFalsy()`, `toContain()`, `toBeNull()`, `toBeUndefined()`, etc.

---

## 5. Negative Matching — `.not`

Every assertion can be **inverted** by adding `.not` between `expect(...)` and the assertion method. This checks that the condition is **NOT** true.

### Syntax
```ts
await expect(locator).not.toBeVisible();
await expect(page).not.toHaveTitle('Google');
```

### Example
```ts
// ✅ Passes — this site is NOT titled "Google"
await expect(page).not.toHaveTitle('Google');

// ❌ Fails — this site IS titled "Swag Labs", so .not makes it fail
await expect(page).not.toHaveTitle('Swag Labs');
```

**Failure message when `.not` fails:**
```
Expected: not "Swag Labs"
Received: "Swag Labs"
```

> `.not` works with **all assertions** — both auto-retrying and non-retrying.

---

## 6. Custom Error Messages

By default, when an assertion fails, Playwright shows a generic message like:
```
Timeout 5,000ms exceeded.
Expected: visible
Received: hidden
```

This is useful but doesn't always tell you **what the assertion was checking or why it matters**. You can add a **custom message** as the second argument to `expect()`:

### Syntax
```ts
await expect(locator, 'custom message here').toBeVisible();
```

### Example
```ts
await expect(
  page.locator('[data-test="login-button"]'),
  'Login button should be visible on the login page'
).toBeVisible();
```

**On failure, output becomes:**
```
Login button should be visible on the login page

Expected: visible
Received: hidden
```

> **Best practice:** Write custom messages that describe **what was being tested and why it matters** — makes debugging much faster, especially in CI/CD pipelines where you can't see the screen.

---

## 7. Soft Assertions — Continue After Failure

### The default (hard assertion) behaviour
By default, the moment any assertion fails, **test execution stops immediately**. All lines after the failed assertion are skipped.

```ts
await expect(locator).toBeDisabled();   // ❌ fails here
await expect(page).toHaveTitle('...');  // ← never runs
```

This is useful to stop early when something critical breaks — but sometimes you want to **run all checks** and collect all failures at once (especially in a reporting scenario).

### Soft assertions — run all, report all failures
Use `expect.soft()` instead of `expect()` — the test **continues executing** even if this assertion fails, and all failures are **reported together at the end**.

### Syntax
```ts
await expect.soft(locator).toBeDisabled();   // ❌ fails, but execution continues
await expect.soft(page).toHaveTitle('...');  // ✅ or ❌ — also runs regardless
```

### Example comparing hard vs. soft

```ts
// HARD assertion — stops at first failure
await expect(locator).toBeDisabled();   // ❌ STOPS HERE
await expect(page).toHaveTitle('...');  // never reached

// SOFT assertion — collects all failures
await expect.soft(locator).toBeDisabled();   // ❌ logged, but continues
await expect.soft(page).toHaveTitle('...');  // also runs → ❌ or ✅
// End of test — Playwright reports ALL failures together
```

### When to use soft assertions
| Scenario | Use |
|---|---|
| Critical flow — if step 1 fails, step 2 makes no sense | Hard assertion (`expect`) |
| Validation checks — want to see all failures at once | Soft assertion (`expect.soft`) |
| Form field validations — multiple error messages to verify | Soft assertion |
| Smoke tests — want maximum coverage per run | Soft assertion |

> Soft assertions can also be used with non-retrying assertions and support `.not` and custom messages just like regular assertions.

---

## 8. Two Assertions Covered in Separate Videos

These two auto-retrying assertions are part of Playwright but are complex enough to warrant their own dedicated coverage:

| Assertion | Purpose |
|---|---|
| `toHaveScreenshot()` | Visual regression testing — compares page/element against a saved screenshot |
| `expect(response).toBeOK()` | API testing — verifies an HTTP response has a 2xx (OK) status code |

---

## 9. Quick Reference — All Assertions at a Glance

### Auto-Retrying (use `await`, preferred)

| Assertion | What it checks | Takes |
|---|---|---|
| `toHaveCount(n)` | Exactly n elements match the locator | Locator |
| `toBeEnabled()` | Element is interactive (not disabled) | Locator |
| `toBeDisabled()` | Element is disabled | Locator |
| `toBeVisible()` | Element is visible on screen | Locator |
| `toBeHidden()` | Element is not visible | Locator |
| `toHaveText('...')` | Element contains this text | Locator |
| `toHaveAttribute('attr', 'val')` | Element has this attribute with this value | Locator |
| `toHaveId('...')` | Element has this id | Locator |
| `toHaveClass('...')` | Element has this CSS class | Locator |
| `toHaveURL('...')` | Browser is on this URL | Page |
| `toHaveTitle('...')` | Page tab has this title | Page |

### Non-Retrying (no `await`, for value comparisons)

| Assertion | What it checks |
|---|---|
| `toBe(value)` | Strict equality (`===`) |
| `toEqual(value)` | Deep equality (objects/arrays) |
| `toBeTruthy()` | Value is truthy |
| `toBeFalsy()` | Value is falsy |
| `toContain(item)` | Array/string contains item |

### Modifiers

| Modifier | Purpose |
|---|---|
| `.not` | Inverts any assertion — `expect(x).not.toBe(y)` |
| `expect.soft(...)` | Assertion failure doesn't stop test execution |
| Second arg to `expect()` | Custom failure message — `expect(loc, 'msg').toBeVisible()` |