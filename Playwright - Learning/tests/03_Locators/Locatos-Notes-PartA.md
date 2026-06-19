# Locator Methods in Playwright — XPath, CSS Selector, Text & ID

## 1. What Are Locators?

- A **locator** represents a way to find one or more elements on a page **at any given moment**.
- Locators are **not** the same as raw selector strings: a locator is a Playwright object that wraps a selector along with built-in **auto-waiting and retry logic**. It doesn't query the DOM the instant you write it — it resolves only when you perform an action (click, fill, etc.), and it automatically waits for the element to be ready.
- You can build a locator either with:
  - **Built-in semantic methods** (recommended): `getByRole()`, `getByLabel()`, `getByText()`, `getByPlaceholder()`, `getByTestId()`, `getByAltText()`
  - **`page.locator(selector)`** with a raw selector string (CSS, XPath, text engine, etc.) — used when semantic methods aren't sufficient.

---

## 2.Current Recommended Approach: Built-in Semantic Locators

This is now the **starting point** for any element you need to locate — not an afterthought.

### Recommended priority order
```
Is the element interactive (button, link, input)?
 ├── Yes → Does it have an accessible role + name?
 │         └── Yes → getByRole('button' | 'link' | ..., { name: '...' })
 │         └── No, but has a label → getByLabel('...')
 └── No  → Has visible static text? → getByText('...')
          → Is it an image with alt text? → getByAltText('...')
          → Otherwise (no semantic option exists) → getByTestId('...')  [last resort]
```

### 2.1 `getByRole()` — the default choice for interactive elements
```ts
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('link', { name: 'Sauce Labs Backpack' }).click();
```
- Queries the **accessibility tree** (ARIA roles), not the raw DOM — meaning it reflects what a screen reader or real user would perceive.
- Resilient to markup/class/structure changes, since it doesn't care about tags, classes, or IDs at all.
- This is what Playwright's Codegen now generates by default when you record a click on a button or link.

### 2.2 `getByLabel()` — for form fields tied to a `<label>`
```ts
await page.getByLabel('Email').fill('test@example.com');
```
- Matches an input based on its associated label text — independent of layout or ID naming.

### 2.3 `getByPlaceholder()` — when there's no label, only a placeholder
```ts
await page.getByPlaceholder('Username').fill('standard_user');
await page.getByPlaceholder('Password').fill('secret_sauce');
```
- Useful for forms like the saucedemo login page where fields rely on placeholder text rather than `<label>` tags.

### 2.4 `getByText()` — for static, non-interactive visible text
```ts
await expect(page.getByText('Order successful')).toBeVisible();
await page.getByText('Sauce Labs Backpack').click();
```
- Best for assertions on messages/toasts, or clicking on text-based links/labels.
- Supports an `{ exact: true }` option for case-sensitive/exact matching — replacing the old quoted-vs-unquoted `text=` string trick:
  ```ts
  await page.getByText('Sauce Labs Backpack', { exact: true }).click(); // strict match
  await page.getByText('sauce labs backpack').click();                  // loose/partial match
  ```
- Avoid using it for frequently-changing dynamic content.

### 2.5 `getByTestId()` — for elements with no semantic role/label/text
```ts
await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
```
- This is the **modern, standardized replacement** for the old video's manual `data-test=` selector string.
- By default, it looks for a `data-testid` attribute in your HTML.
- **You can customize the attribute name** your team uses, in `playwright.config.ts`:
  ```ts
  export default defineConfig({
    use: {
      testIdAttribute: 'data-qa', // or 'data-test', 'data-pw', whatever your team's convention is
    },
  });
  ```
- **Still good practice** (unchanged from the original video): ask your dev team to add stable test-id attributes to key elements if your project is still evolving. The difference now is that Playwright gives you a **dedicated, purpose-built method** for it instead of writing a manual CSS/XPath attribute selector by hand.
- **Use this as a last resort**, not your default — reach for `getByRole`/`getByLabel`/`getByText` first when a real semantic option exists.

### 2.6 `getByAltText()` — for images
```ts
await page.getByAltText('Company logo').click();
```
- Equivalent in spirit to `getByRole('img', { name: 'Company logo' })` for images that have proper `alt` attributes.

---

## 3. Updated Practice Example (saucedemo login + add to cart flow)

Here's the same workflow from the original video, rewritten using current best practice:

```ts
import { test } from "@playwright/test";

test("Practice Locator Method", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");

  // Username & password — using placeholder text (no <label> on this site)
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');

  // Login button — role-based, matches visible button text
  await page.getByRole('button', { name: 'Login' }).click();

  // Click a product by its visible text
  await page.getByText('Sauce Labs Backpack', { exact: true }).click();

  // Add to cart — no clean semantic role/name here, so test-id is the fallback
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
});
```

Compare this to the original video's approach, which used raw XPath/CSS strings for every single step. The logic and the target elements are identical — only the **selector strategy** has modernized.

---

## 4. ⚠️ Legacy Approach: Raw XPath, CSS, and `page.locator()` String Engines

These are **still fully supported** in current Playwright and you'll still see them often in existing codebases, tutorials, and projects that haven't migrated. Understanding them remains valuable — but treat them as **fallback tools**, not your first choice.

### 4.1 XPath (syntax unchanged)
```ts
await page.locator("//input[@name='user-name']").fill("standard_user");
await page.locator("//*[@name='user-name']").fill("standard_user"); // wildcard tag
```
- Playwright still auto-detects XPath strings (anything starting with `//` or `..`) without needing an explicit `xpath=` prefix.
- **Still discouraged** by Playwright's own docs: *"We recommend prioritizing user-visible locators like text or accessible role instead of using XPath that is tied to the implementation and easily breaks when the page changes."*
- XPath **does not pierce shadow roots** (a limitation worth knowing if your app uses Web Components/shadow DOM).

### 4.2 CSS Selectors (syntax unchanged)
```ts
await page.locator("input.submit-button").click();   // by class
await page.locator('input#password').fill('secret_sauce'); // by ID
await page.locator("input[value=login]").click();    // by attribute
```
- Still auto-detected without needing a `css=` prefix.
- Still discouraged as a *default* — Playwright's best-practices page explicitly warns that CSS classes can change if a designer restyles something, silently breaking your test.

### 4.3 Text engine string (`text=`) — largely superseded by `getByText()`
```ts
await page.locator("text='Sauce Labs Backpack'").click(); // still works
```
- This older string-based syntax still functions, but `getByText()` is now the **idiomatic, recommended replacement** — it's clearer to read and has built-in `{ exact: true }` support instead of relying on quote-vs-no-quote tricks.

### 4.4 `id=` engine string — superseded by `getByTestId()` (for test-purpose IDs) or CSS `#id`
```ts
await page.locator("id=add-to-cart-sauce-labs-backpack").click(); // still works
```
- For genuine test-specific identifiers, prefer `getByTestId()` instead — it's purpose-built and configurable via `testIdAttribute`.

### ❌ Removed entirely (as of Playwright v1.58) — do not use these anymore
| Removed feature | What to use instead |
|---|---|
| `_react=` selector engine | `getByRole`, `getByTestId`, or standard CSS |
| `_vue=` selector engine | `getByRole`, `getByTestId`, or standard CSS |
| `:light` selector engine suffix | Standard CSS selectors |

If you're maintaining an older codebase and see any of the above, they will **break** on current Playwright versions and need to be rewritten.

---

## 5. Picking Locators — Updated Tooling

The original video covered the VS Code extension's **"Pick Locator"** button (hover an element in a live browser → get a suggested locator). That tool still exists, but there are now more/better options:

| Tool | What it does |
|---|---|
| **VS Code "Pick Locator"** (unchanged) | Still available in the Playwright Test for VS Code extension; hover/click an element to get a suggested locator. |
| **Codegen** (`npx playwright codegen <url>`) | Now **explicitly suggests `getByRole`, `getByLabel`, and `getByTestId` over CSS** by default when recording interactions. |
| **`page.pickLocator()`** (new, added in Playwright v1.59) | An interactive **API** that lets you visually click on any element in a headed browser and programmatically get back the best (most resilient) locator for it — useful for scripting/automating locator discovery rather than only using it manually through the UI. |

**Practical implication:** if you generate a locator using any of Playwright's current tooling, it will steer you toward the semantic methods automatically — you'd have to deliberately choose CSS/XPath to get those instead.

---

## 6. Disambiguating Elements — Filtering & Chaining (Newer Emphasis)

When a semantic locator matches more than one element, current Playwright guidance favors **filtering/chaining** over writing a more complex CSS/XPath string.

```ts
// Narrow down to a specific list item containing certain text
const product = page.getByRole('listitem').filter({ hasText: 'Sauce Labs Backpack' });

// Chain locators to scope a search — e.g., find a delete button only within a specific row
await page
  .getByTestId('user-row-123')
  .getByRole('button', { name: 'Delete' })
  .click();
```
- `locator.filter({ hasText: '...' })` — narrows a locator down by visible text or by another nested locator.
- **Avoid** reflexively adding `.first()` just to silence a "strict mode violation" (Playwright's error when a locator matches multiple elements) — that often just hides a real ambiguity bug. **Fix the locator** (via filtering/chaining) instead of forcing it to grab the first match.

---

## 7. Updated Best-Practice Summary (Per Current Playwright Docs)

1. **Default to semantic locators first**: `getByRole` → `getByLabel` → `getByText` → `getByAltText` → `getByTestId` (last resort).
2. **Use CSS/XPath only when nothing semantic works** — e.g., highly generic legacy markup with no roles, labels, or test IDs at all.
3. **Avoid long/absolute XPath chains** tied to exact DOM hierarchy (e.g., `/html/body/div[2]/div[1]/...`) — these break the instant a developer adds/removes a wrapping element. This guidance is unchanged from the original video and remains just as true today.
4. **Standardize on `data-testid`** (or your team's chosen `testIdAttribute`) for elements that genuinely need a dedicated test hook, and use `getByTestId()` to consume it — don't hand-roll `[data-test=...]` CSS attribute selectors anymore.
5. **Let Codegen do the heavy lifting** — record your flow with `npx playwright codegen <url>` and it will generate resilient, semantic locators for you automatically in most cases.
6. **Use `locator.filter()` / chaining** to disambiguate multiple matches rather than reaching for `.first()` or writing more complex selector strings.
7. **Locators auto-wait** — you generally don't need manual sleeps/waits; Playwright resolves the locator only when an action is performed and waits for the element to be actionable.

---

## 8. Quick Reference — Old vs. Current Syntax Side-by-Side

| Goal | Legacy (still works, fallback only) | Current Recommended |
|---|---|---|
| Click a button by visible label | `page.locator("//button[text()='Login']")` or `page.locator("input.submit-button")` | `page.getByRole('button', { name: 'Login' })` |
| Fill a labeled field | `page.locator('input#password')` | `page.getByLabel('Password')` |
| Fill a placeholder-only field | `page.locator("input[placeholder='Username']")` | `page.getByPlaceholder('Username')` |
| Click/assert on visible text | `page.locator("text='Sauce Labs Backpack'")` | `page.getByText('Sauce Labs Backpack', { exact: true })` |
| Click via a dedicated test attribute | `page.locator("[data-test=add-to-cart]")` or `page.locator("id=add-to-cart")` | `page.getByTestId('add-to-cart')` |
| Click an image by alt text | `page.locator("img[alt='Company logo']")` | `page.getByAltText('Company logo')` |
| Narrow down multiple matches | More complex CSS/XPath | `locator.filter({ hasText: '...' })` or chaining |

---

## 9. TL;DR — What Changed

| Then | Now (current Playwright) |
|---|---|
| `page.locator("//input[@name='user-name']")` (raw XPath) | Still works, but treated as a **last resort** |
| `page.locator("input.submit-button")` (raw CSS) | Still works, but treated as a **fallback**, not the default |
| `page.locator("text='Sauce Labs Backpack'")` | Prefer `page.getByText('Sauce Labs Backpack', { exact: true })` |
| `page.locator("id=add-to-cart-...")` | Prefer `page.getByTestId('add-to-cart-...')` |
| `page.locator("data-test=add-to-cart-...")` | Prefer `page.getByTestId('add-to-cart-...')` (now a **standardized** method, not a manual attribute string) |
| Manually picking locators via the VS Code "Pick Locator" button | Still available, and there's now also `page.pickLocator()` (interactive API) and **Codegen**, both of which actively **suggest `getByRole`/`getByLabel`/`getByTestId` over CSS** by default |
| `_react=`, `_vue=`, `:light` selector engines | **Removed entirely** as of Playwright v1.58 — these no longer work at all |

**The core shift:** Playwright now wants you to default to locators that reflect how a **real user or assistive technology** perceives the page (roles, labels, visible text) rather than locators tied to internal DOM/CSS implementation details. CSS and XPath aren't gone — they're just no longer the "default toolbox," they're the fallback when nothing semantic is available.

---


## 10. What Still Holds True.

- The **core concept of a locator** (a way to find an element to act on) is unchanged.
- **XPath and CSS syntax themselves** haven't changed — `//tag[@attr='value']` and `tag.class` / `tag#id` / `[attr=value]` all still work exactly as shown in the original video.
- Playwright **still auto-detects** CSS vs. XPath without needing explicit `css=`/`xpath=` prefixes.
- The **warning against absolute XPath / brittle long chains** is, if anything, emphasized even more strongly now.
- The advice to **ask your dev team for test-specific attributes** is still valid — it's just now backed by a dedicated `getByTestId()` method instead of a manual attribute selector.
- **Locators remain the backbone of automation** — this foundational message from the video hasn't changed at all, only the recommended toolkit for building them has.