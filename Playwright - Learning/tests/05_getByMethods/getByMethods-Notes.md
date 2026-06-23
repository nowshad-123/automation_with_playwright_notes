# Playwright `getBy` Methods — Detailed Structured Notes

## Why `getBy` Methods Exist

Raw CSS (`page.locator('.submit-button')`) and XPath (`page.locator("//input[@name='user-name']")`) are tied to **internal HTML structure** — they break the moment a developer renames a class or restructures the DOM.

`getBy` methods instead locate elements the way a **real user perceives the page** — by visible text, label, placeholder, role, or image description. This makes tests:
- More **readable** (intention is clear)
- More **resilient** (survive minor UI changes)
- Aligned with **accessibility** best practices

> Playwright's own documentation recommends `getBy` methods as the **default first choice** over any other locator strategy.

---

## Common Behaviour Across All `getBy` Methods

Before diving into each method, these rules apply to **all of them**:

| Feature | Behaviour |
|---|---|
| **Substring match** | By default, a plain string matches any element whose text **contains** that string (not necessarily the full text) |
| **`{ exact: true }`** | Second optional argument — forces an **exact, full-string, case-sensitive** match |
| **RegExp support** | All methods accept a regular expression in place of a string for pattern-based matching |
| **Pick Locator / Codegen** | Playwright's VS Code "Pick Locator" tool and Codegen **automatically suggest the correct `getBy` method** — use them rather than building locators manually |

---

## 1. `getByLabel()` — Form Fields With a `<label>` Tag

### What it does
Finds an `<input>` (or other form element) by the **visible text of its associated `<label>` element**.

### When to use it
Use this when locating **form fields that have a `<label>` tag** associated with them.

### How it works
In HTML, a `<label>` tag is linked to an input field. Example:
```html
<label>Email:</label>
<input type="email" />
```
Playwright reads the label text and maps it to the input — you never need to touch the input's `id`, `class`, or `name`.

### Syntax
```ts
await page.getByLabel('Email:').fill('test@example.com');
```

### Substring vs. Exact match
```ts
// Substring (default) — 'Email' matches 'Email:' on the page ✅
await page.getByLabel('Email').fill('test@example.com');

// Exact match — 'Email' does NOT match 'Email:' ❌ → timeout
await page.getByLabel('Email', { exact: true }).fill('test@example.com');

// Exact match — must match the label text precisely ✅
await page.getByLabel('Email:', { exact: true }).fill('test@example.com');
```

> **Key point:** If `{ exact: true }` is used, the string you pass must **identically match** the full label text — including punctuation like colons.

---

## 2. `getByPlaceholder()` — Form Fields Without a Label

### What it does
Finds an `<input>` by its **placeholder text** — the greyed-out hint text visible inside the field before the user types anything.

### When to use it
Use this when a form field **has no `<label>` but does have a `placeholder` attribute**.

### How it works
In HTML:
```html
<input placeholder="Search store..." />
```
The placeholder text (`"Search store..."`) is what you pass to this method.

### Syntax
```ts
await page.getByPlaceholder('Search store...').fill('mobile');
```

### Substring, Exact, RegExp
```ts
// Substring — 'Search' matches 'Search store...' ✅
await page.getByPlaceholder('Search').fill('mobile');

// Exact — must match the full placeholder text ✅
await page.getByPlaceholder('Search store...', { exact: true }).fill('mobile');

// RegExp
await page.getByPlaceholder(/search/i).fill('mobile');
```

> **Real-world note:** Many modern login forms (including saucedemo.com) use placeholders instead of labels. This is the correct locator for those fields.

---

## 3. `getByText()` — Non-Interactive Elements (div, span, p, etc.)

### What it does
Finds any element that **contains specific visible text** — regardless of HTML tag.

### When to use it
Playwright recommends this **specifically for non-interactive elements**: `<div>`, `<span>`, `<p>`, headings, labels, etc.

> **Important:** For interactive elements (buttons, links, inputs), use `getByRole()` instead. `getByText()` is for reading/asserting on static text content.

### How it works
```html
<p>New Customer</p>
```
```ts
// Read the text content of a paragraph element
const text = await page.getByText('New Customer').textContent();
console.log(text); // prints: "New Customer"
```

### Substring vs. Exact
```ts
// Substring — 'New Cust' matches 'New Customer' ✅
await page.getByText('New Cust').textContent();

// Exact — 'New Cust' does NOT match 'New Customer' ❌ → timeout
await page.getByText('New Cust', { exact: true }).textContent();

// Exact — must pass the full string ✅
await page.getByText('New Customer', { exact: true }).textContent();
```

> **Common use case:** Asserting that a confirmation message, error text, or heading is visible after an action.
```ts
await expect(page.getByText('Order placed successfully!')).toBeVisible();
```

---

## 4. `getByAltText()` — Images and Area Elements

### What it does
Finds an element by its **`alt` attribute text** — typically used for images.

### When to use it
Use when your element is an **`<img>` or `<area>` tag** that has an `alt` attribute.

### How it works
```html
<img src="logo.png" alt="nopCommerce demo store" />
```
```ts
await page.getByAltText('nopCommerce demo store').click();
```

### Why `alt` text matters
The `alt` attribute is a text description of an image, used by screen readers and assistive technologies. Since it describes what the image **means to the user**, it's a stable, semantic way to locate images.

### Substring, Exact, RegExp all work here too
```ts
// Substring ✅
await page.getByAltText('nopCommerce').click();

// Exact ✅
await page.getByAltText('nopCommerce demo store', { exact: true }).click();
```

---

## 5. `getByTitle()` — Elements With a `title` Attribute

### What it does
Finds an element by its **`title` HTML attribute** — the tooltip text that appears when you hover over an element.

### When to use it
Use when your element has a `title` attribute set by the developer.

### How it works
```html
<a href="/electronics" title="Show products in category Electronics">Electronics</a>
```
```ts
await page.getByTitle('Show products in category Electronics').click();
```

### ⚠️ Watch out for non-unique titles
In the video example, **three different elements** shared the same `title` attribute — Playwright threw a **Strict Mode Violation** because it matched 3 elements.

**Solution — use `.first()` to pick the first match:**
```ts
await page.getByTitle('Show products in category Electronics').first().click();
```

> **Note:** While `.first()` works, it's positional and fragile. A better long-term fix is to pair `getByTitle()` with a `.filter()` call to make the match unique without relying on position.

### Substring, Exact, RegExp
```ts
// Substring ✅
await page.getByTitle('Electronics').click();

// Exact ✅
await page.getByTitle('Show products in category Electronics', { exact: true }).click();
```

---

## 6. `getByRole()` — THE Most Recommended Method

### What it does
Finds elements by their **ARIA role** (the element's purpose/type in the accessibility tree) and optionally by their **accessible name** (the visible label/text of that element).

### When to use it
Playwright recommends **prioritising this method above all others**. It's the closest reflection of how a real user — or an assistive technology like a screen reader — perceives and interacts with the page.

### What is ARIA?
ARIA stands for **Accessible Rich Internet Applications** — a set of roles and attributes that make web content more accessible to people with disabilities. Every interactive HTML element has an implicit ARIA role:
- A `<button>` → role: `button`
- An `<a>` tag → role: `link`
- A `<input type="checkbox">` → role: `checkbox`
- A `<h1>` → role: `heading`
- A `<table>` → role: `table`

### Syntax
```ts
page.getByRole(role, { name: 'visible text of the element' })
```
- **First argument:** The ARIA role (e.g., `'button'`, `'link'`, `'checkbox'`, `'heading'`, etc.)
- **Second argument (optional `name`):** The accessible name — the visible text or label of that element.

### Examples
```ts
// Click a button by its visible text
await page.getByRole('button', { name: 'Search' }).click();
await page.getByRole('button', { name: 'Login' }).click();

// Click a navigation link
await page.getByRole('link', { name: 'Electronics' }).click();

// Check a checkbox
await page.getByRole('checkbox', { name: 'Remember me' }).check();

// Assert a heading is visible
await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
```

### How Pick Locator helps here
When you hover over any interactive element using Playwright's **Pick Locator** tool in VS Code, it **automatically suggests `getByRole()`** with the correct role and name pre-filled — so you don't have to look up roles manually. This is the tool-assisted workflow Playwright recommends.

### Supported roles include
`alert`, `button`, `checkbox`, `combobox`, `heading`, `link`, `list`, `listitem`, `menu`, `menuitem`, `option`, `radio`, `row`, `searchbox`, `table`, `tab`, `textbox`, and 60+ more — all following the W3C ARIA specification.

---

## 7. `getByTestId()` — Custom Test-Specific Attributes

### What it does
Finds elements by a **dedicated test attribute** added to the HTML by the development team — specifically for testing purposes.

### When to use it
Use this when:
- You **cannot** locate the element by role, label, text, or placeholder (no semantic option exists).
- Your team has added a `data-testid` (or similar) attribute to the element specifically for the QA team.

> This is the **last resort** in Playwright's recommended priority — only after `getByRole`, `getByLabel`, `getByText`, and `getByPlaceholder` have been ruled out.

### Default behaviour
By default, `getByTestId()` looks for an attribute named **`data-testid`**:
```html
<input data-testid="username" />
```
```ts
await page.getByTestId('username').fill('standard_user');
```

### ⚠️ What if your app uses a different attribute name?

Many teams use `data-test`, `data-qa`, `data-pw`, etc. instead of `data-testid`. In that case, `getByTestId()` will fail because it's looking for `data-testid` which doesn't exist.

**Fix: Configure the attribute name in `playwright.config.ts`**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    testIdAttribute: 'data-test',  // ← tell Playwright to use data-test instead
  },
});
```

After this one-time configuration:
```ts
// Playwright will now look for data-test="username" in the HTML — not data-testid
await page.getByTestId('username').fill('standard_user');
```

> **Pro tip:** Ask your development team what attribute they use for test hooks, configure it once in `playwright.config.ts`, and use `getByTestId()` consistently throughout the project.

---

## Priority Order — Which Method to Use First?

Playwright's recommended priority (highest to lowest):

```
1. getByRole()          ← always try this first for interactive elements
2. getByLabel()         ← for labeled form fields
3. getByPlaceholder()   ← for unlabeled form fields with placeholder text
4. getByText()          ← for non-interactive visible text (div, span, p)
5. getByAltText()       ← for images / area elements
6. getByTitle()         ← when element has a title attribute
7. getByTestId()        ← last resort — when nothing semantic is available
```

---

## All 7 Methods — Side-by-Side Reference

| Method | Looks For | Best Used For | Supports `exact` |
|---|---|---|---|
| `getByLabel()` | Text of `<label>` tag | Labeled form inputs | ✅ |
| `getByPlaceholder()` | `placeholder` attribute | Unlabeled form inputs | ✅ |
| `getByText()` | Visible text inside the element | Non-interactive elements (div, span, p) | ✅ |
| `getByAltText()` | `alt` attribute | Images, area elements | ✅ |
| `getByTitle()` | `title` attribute | Elements with tooltip/title attributes | ✅ |
| `getByRole()` | ARIA role + accessible name | **Everything interactive** — most recommended | ✅ (via `name`) |
| `getByTestId()` | `data-testid` (configurable) | Elements with no semantic option | ❌ (exact by default) |

---

## Practical Tips

1. **Use Pick Locator first** — hover over any element in the live browser using VS Code's Pick Locator button. Playwright will suggest the best `getBy` method automatically. Copy and paste — done.

2. **`{ exact: true }` is a strict, full-string match** — if the text on the page has a colon, space, or extra characters that your string doesn't, it will timeout. Drop `exact: true` or pass the full text.

3. **`getByRole()` for buttons/links, `getByText()` for static content** — don't use `getByText()` to click a button; use `getByRole('button', { name: '...' })` instead.

4. **`getByTitle()` often matches multiple elements** — add `.first()` as a temporary fix, but aim to use `.filter()` for a more stable long-term solution.

5. **Configure `testIdAttribute` once** — do it in `playwright.config.ts` and you never have to think about which attribute name your team uses again.

6. **All `getBy` methods support chaining with `.filter()`** — e.g., `page.getByRole('listitem').filter({ hasText: 'Sauce Labs Backpack' })`.

---

## Quick Revision Block

```
getByLabel()       → label text         → labeled form inputs
getByPlaceholder() → placeholder text   → unlabeled form inputs
getByText()        → visible text       → non-interactive elements only
getByAltText()     → alt attribute      → images & area elements
getByTitle()       → title attribute    → tooltip-style attributes (watch for non-unique!)
getByRole()        → ARIA role + name   → ⭐ most recommended, all interactive elements
getByTestId()      → data-testid attr   → last resort, configure in playwright.config.ts

{ exact: true }    → full-string match  → substring by default without it
RegExp             → pattern match      → works in all 7 methods
Pick Locator       → auto-suggests the right getBy method for any element
```