# Async/Await in JavaScript & TypeScript + Page Fixture in Playwright — Structured Notes

This is Part 5 of the Playwright + TypeScript series. It builds on the basic test script structure from Part 3 and explains two core concepts you'll use in **every** Playwright test: the **async/await** pattern and the **page fixture**.

---

## 1. Starting Point — The Existing Test Script

From the previous video, there's already a `kickstart.spec.ts` file with this structure:

```ts
import { test } from '@playwright/test';

test('basic steps to start with the playwright', () => {
  // test code goes here
});
```

- `test` is imported from the `@playwright/test` module.
- The `test()` function takes two arguments:# Async/Await in JavaScript & TypeScript + Page Fixture in Playwright — Structured Notes

This is Part 5 of the Playwright + TypeScript series. It builds on the basic test script structure from Part 3 and explains two core concepts you'll use in **every** Playwright test: the **async/await** pattern and the **page fixture**.

---

## 1. Starting Point — The Existing Test Script

From the previous video, there's already a `kickstart.spec.ts` file with this structure:

```ts
import { test } from '@playwright/test';

test('basic steps to start with the playwright', () => {
  // test code goes here
});
```

- `test` is imported from the `@playwright/test` module.
- The `test()` function takes two arguments:
  1. **Test name/title** (a string) — e.g., `"basic steps to start with the playwright"`.
  2. **An anonymous function** — the actual test logic.

This video adds `async`, `await`, and the **page fixture** into this structure.

---

## 2. Building the Test Step by Step

### Step 1: Mark the function as `async`
```ts
test('basic steps to start with the playwright', async ({ page }) => {
  // ...
});
```
- The anonymous function is marked `async`.
- Inside the curly braces `{ }` (the function's parameter), we add `page` — this is the **page fixture**, automatically provided by Playwright.

### Step 2: Navigate to a URL using the page fixture
```ts
await page.goto('https://www.google.com');
```
- `page.goto()` opens the browser and navigates to the given URL.
- Note the `await` keyword placed **before** `page` — required because `goto()` returns a **Promise** (explained in section 3).

### Step 3: Perform a click action
```ts
await page.locator('...').click(); // locator obtained via "Pick Locator" tool
```
- The locator for an element (e.g., the "Google apps" menu) is identified using the **Pick Locator** tool (covered in the previous video).
- `click()` also returns a Promise, so it also needs `await` in front of it.

### Running the test
- Using the **Testing panel** (Explorer or Testing tab) with **"Show Browser"** enabled, running this test:
  1. Opens `google.com` in a real browser window.
  2. Clicks on the specified menu/element.
  3. Completes execution successfully.

---

## 3. Understanding `async` and `await`

### Important context: TypeScript is a superset of JavaScript
- TypeScript understands all JavaScript syntax and capabilities.
- You can literally take a `.js` file, rename its extension to `.ts`, and it will work as valid TypeScript — because TypeScript is built **on top of** JavaScript, not separate from it.
- This means `async`/`await` behave **identically** in both JavaScript and TypeScript.

### The problem `await` solves
Normally, JavaScript/TypeScript runs code line by line, **without pausing** — as soon as one line is fired off, it immediately moves to the next line, even if the first line hasn't actually finished its work yet.

This is fine for instant operations (like `let x = 5;`), but it breaks down for actions that take real time to complete — like opening a browser, loading a webpage, or clicking a button that triggers a page navigation. These are **slow operations**, and the code that comes after them often depends on them being fully done first.

**Example of the problem:**
```ts
page.goto('https://www.google.com'); // takes time to load the page
page.locator('...').click();          // tries to click immediately — page may not be loaded yet!
```
Without anything to make the code wait, line 2 could try to click an element **before** the page from line 1 has even finished loading — causing the test to fail, because the element either doesn't exist yet or the page isn't ready.

This is exactly the problem `await` is designed to solve: it forces the code to **pause on that line** until the slow operation is genuinely finished, before allowing execution to continue to the next line.

### Promises — explained with an analogy
Many Playwright methods (like `page.goto()` and `.click()`) **return a Promise**. You can confirm this by hovering over the method in your editor — it will show something like:
```
goto(url: string, options?: ...): Promise<...>
```

**Analogy — Ordering pasta at a restaurant:**
- You order pasta from a waiter. The waiter doesn't hand you cooked pasta instantly — instead, they **promise** to bring it to you.
- Behind the scenes: the waiter goes to the chef, the chef cooks the pasta, and only once it's ready does the waiter bring it back and fulfill the promise.
- You **wait** until that promise is fulfilled before you start eating.

This is exactly what a **Promise** represents in code: a placeholder for something that will complete *eventually* (not instantly).

### What `await` does
- `await` tells your code: **"Wait here until this Promise is completed, then move to the next line."**
- Example: `await page.goto(url)` — wait until the browser has actually finished navigating to the URL before running the next line.
- Without `await`, the code would try to move to the next action (e.g., clicking an element) **before** the page has even loaded — causing errors or test failures.

### The `async` requirement
- JavaScript/TypeScript **requires** that `await` only be used inside a function marked as `async`.
- That's why the test's anonymous function is written as `async ({ page }) => { ... }` — the `async` keyword unlocks the ability to use `await` inside it.

### Documentation summary (paraphrased)
- `await` waits for a Promise to resolve (complete) before continuing to the next line of code.
- JavaScript mandates that `await` can only be used inside a function declared with `async`.

---

## 4. Understanding the Page Fixture

### What is the page fixture?
- The `page` argument passed into the test function (`async ({ page }) => {...}`) tells Playwright Test to **set up a "page" fixture** and provide it to your test.
- Playwright automatically:
  1. **Sets up** the page fixture **before** the test runs.
  2. **Tears it down** (cleans up) **after** the test finishes.
- **Fixtures are isolated between tests** — each test gets its own fresh, independent fixture instance; one test's page/browser state does not leak into another test.

### What can you do with the page fixture?
The `page` object is used throughout a test script to perform browser actions, such as:
- Navigating to URLs (`page.goto()`)
- Clicking elements (`page.locator(...).click()`)
- Typing into fields (`fill()`)
- Capturing screenshots
- ...and many other browser interactions (covered in later videos)

---

## 5. What Happens "Under the Hood" Without the Fixture

To understand *why* the page fixture is so convenient, here's what you'd have to write manually if Playwright didn't provide it:

```ts
const browser = await chromium.launch();        // 1. Launch a browser
const context = await browser.newContext();      // 2. Create a browser context
const page = await context.newPage();            // 3. Create a page from that context
```

- **`chromium.launch()`** — starts a Chromium browser instance. (`chromium` is imported from `@playwright/test`, similar to how `test` is imported.)
- **`browser.newContext()`** — creates an isolated browser context (like a fresh browser profile/session) from the launched browser.
- **`context.newPage()`** — creates a new page/tab within that context, which is what you actually interact with.

Running the test with this manual setup produces the **exact same result** (a new browser opens, navigates, and clicks) as using the `page` fixture directly.

**Key takeaway:** The `page` fixture is just Playwright's built-in shortcut that handles these three setup steps (launch browser → create context → create page) automatically, so you don't have to write that boilerplate yourself.

### Other built-in fixtures available
Besides `page`, Playwright provides several other fixtures you can request the same way (by adding them to the destructured parameter):

| Fixture | Purpose |
|---|---|
| `page` | The browser page/tab to interact with (most commonly used) |
| `context` | The browser context that the page belongs to |
| `browser` | The launched browser instance itself |
| `browserName` | Returns the name of the browser currently being used |
| `request` | Useful for **API testing** within Playwright |

> Note: Custom fixtures (creating your own) will be covered in a separate, more detailed video later in the series.

---

## 6. What Happens If You Forget `await`

This was demonstrated directly: removing `await` before the page actions and running the test causes:
- The browser opens **and then immediately closes** before any meaningful action happens.
- The test **fails**, because the code tried to move to the next line (e.g., clicking an element) without waiting for the previous Promise (like page navigation) to actually finish.
- Since all lines without `await` attempt to run together/immediately, actions get executed before their prerequisites (like the page being loaded) are ready — leading to broken or failing tests.

**Rule of thumb:** Wherever a Playwright method returns a Promise, always use `await` in front of it, and make sure the surrounding function is marked `async`.

---

## Quick Reference Summary

| Concept | Key Point |
|---|---|
| **TypeScript vs JavaScript** | TypeScript is a superset of JavaScript — same `async`/`await` behavior in both |
| **Promise** | A placeholder for a value/action that will complete *later*, not instantly (like a waiter's promise to bring food) |
| **`await`** | Pauses execution on that line until the Promise resolves, before moving to the next line |
| **`async`** | Required on any function that uses `await` inside it |
| **`page` fixture** | Automatically set up/torn down by Playwright for each test; used to perform browser actions (`goto`, `click`, `fill`, etc.) |
| **Manual equivalent of `page`** | `chromium.launch()` → `browser.newContext()` → `context.newPage()` |
| **Other fixtures** | `context`, `browser`, `browserName`, `request` (for API testing) |
| **Forgetting `await`** | Code runs out of order; actions execute before their prerequisites are ready → test failures |# Async/Await in JavaScript & TypeScript + Page Fixture in Playwright — Structured Notes

This is Part 5 of the Playwright + TypeScript series. It builds on the basic test script structure from Part 3 and explains two core concepts you'll use in **every** Playwright test: the **async/await** pattern and the **page fixture**.

---

## 1. Starting Point — The Existing Test Script

From the previous video, there's already a `kickstart.spec.ts` file with this structure:

```ts
import { test } from '@playwright/test';

test('basic steps to start with the playwright', () => {
  // test code goes here
});
```

- `test` is imported from the `@playwright/test` module.
- The `test()` function takes two arguments:
  1. **Test name/title** (a string) — e.g., `"basic steps to start with the playwright"`.
  2. **An anonymous function** — the actual test logic.

This video adds `async`, `await`, and the **page fixture** into this structure.

---

## 2. Building the Test Step by Step

### Step 1: Mark the function as `async`
```ts
test('basic steps to start with the playwright', async ({ page }) => {
  // ...
});
```
- The anonymous function is marked `async`.
- Inside the curly braces `{ }` (the function's parameter), we add `page` — this is the **page fixture**, automatically provided by Playwright.

### Step 2: Navigate to a URL using the page fixture
```ts
await page.goto('https://www.google.com');
```
- `page.goto()` opens the browser and navigates to the given URL.
- Note the `await` keyword placed **before** `page` — required because `goto()` returns a **Promise** (explained in section 3).

### Step 3: Perform a click action
```ts
await page.locator('...').click(); // locator obtained via "Pick Locator" tool
```
- The locator for an element (e.g., the "Google apps" menu) is identified using the **Pick Locator** tool (covered in the previous video).
- `click()` also returns a Promise, so it also needs `await` in front of it.

### Running the test
- Using the **Testing panel** (Explorer or Testing tab) with **"Show Browser"** enabled, running this test:
  1. Opens `google.com` in a real browser window.
  2. Clicks on the specified menu/element.
  3. Completes execution successfully.

---

## 3. Understanding `async` and `await`

### Important context: TypeScript is a superset of JavaScript
- TypeScript understands all JavaScript syntax and capabilities.
- You can literally take a `.js` file, rename its extension to `.ts`, and it will work as valid TypeScript — because TypeScript is built **on top of** JavaScript, not separate from it.
- This means `async`/`await` behave **identically** in both JavaScript and TypeScript.

### The problem `await` solves
Normally, JavaScript/TypeScript runs code line by line, **without pausing** — as soon as one line is fired off, it immediately moves to the next line, even if the first line hasn't actually finished its work yet.

This is fine for instant operations (like `let x = 5;`), but it breaks down for actions that take real time to complete — like opening a browser, loading a webpage, or clicking a button that triggers a page navigation. These are **slow operations**, and the code that comes after them often depends on them being fully done first.

**Example of the problem:**
```ts
page.goto('https://www.google.com'); // takes time to load the page
page.locator('...').click();          // tries to click immediately — page may not be loaded yet!
```
Without anything to make the code wait, line 2 could try to click an element **before** the page from line 1 has even finished loading — causing the test to fail, because the element either doesn't exist yet or the page isn't ready.

This is exactly the problem `await` is designed to solve: it forces the code to **pause on that line** until the slow operation is genuinely finished, before allowing execution to continue to the next line.

### Promises — explained with an analogy
Many Playwright methods (like `page.goto()` and `.click()`) **return a Promise**. You can confirm this by hovering over the method in your editor — it will show something like:
```
goto(url: string, options?: ...): Promise<...>
```

**Analogy — Ordering pasta at a restaurant:**
- You order pasta from a waiter. The waiter doesn't hand you cooked pasta instantly — instead, they **promise** to bring it to you.
- Behind the scenes: the waiter goes to the chef, the chef cooks the pasta, and only once it's ready does the waiter bring it back and fulfill the promise.
- You **wait** until that promise is fulfilled before you start eating.

This is exactly what a **Promise** represents in code: a placeholder for something that will complete *eventually* (not instantly).

### What `await` does
- `await` tells your code: **"Wait here until this Promise is completed, then move to the next line."**
- Example: `await page.goto(url)` — wait until the browser has actually finished navigating to the URL before running the next line.
- Without `await`, the code would try to move to the next action (e.g., clicking an element) **before** the page has even loaded — causing errors or test failures.

### The `async` requirement
- JavaScript/TypeScript **requires** that `await` only be used inside a function marked as `async`.
- That's why the test's anonymous function is written as `async ({ page }) => { ... }` — the `async` keyword unlocks the ability to use `await` inside it.

### Documentation summary (paraphrased)
- `await` waits for a Promise to resolve (complete) before continuing to the next line of code.
- JavaScript mandates that `await` can only be used inside a function declared with `async`.

---

## 4. Understanding the Page Fixture

### What is the page fixture?
- The `page` argument passed into the test function (`async ({ page }) => {...}`) tells Playwright Test to **set up a "page" fixture** and provide it to your test.
- Playwright automatically:
  1. **Sets up** the page fixture **before** the test runs.
  2. **Tears it down** (cleans up) **after** the test finishes.
- **Fixtures are isolated between tests** — each test gets its own fresh, independent fixture instance; one test's page/browser state does not leak into another test.

### What can you do with the page fixture?
The `page` object is used throughout a test script to perform browser actions, such as:
- Navigating to URLs (`page.goto()`)
- Clicking elements (`page.locator(...).click()`)
- Typing into fields (`fill()`)
- Capturing screenshots
- ...and many other browser interactions (covered in later videos)

---

## 5. What Happens "Under the Hood" Without the Fixture

To understand *why* the page fixture is so convenient, here's what you'd have to write manually if Playwright didn't provide it:

```ts
const browser = await chromium.launch();        // 1. Launch a browser
const context = await browser.newContext();      // 2. Create a browser context
const page = await context.newPage();            // 3. Create a page from that context
```

- **`chromium.launch()`** — starts a Chromium browser instance. (`chromium` is imported from `@playwright/test`, similar to how `test` is imported.)
- **`browser.newContext()`** — creates an isolated browser context (like a fresh browser profile/session) from the launched browser.
- **`context.newPage()`** — creates a new page/tab within that context, which is what you actually interact with.

Running the test with this manual setup produces the **exact same result** (a new browser opens, navigates, and clicks) as using the `page` fixture directly.

**Key takeaway:** The `page` fixture is just Playwright's built-in shortcut that handles these three setup steps (launch browser → create context → create page) automatically, so you don't have to write that boilerplate yourself.

### Other built-in fixtures available
Besides `page`, Playwright provides several other fixtures you can request the same way (by adding them to the destructured parameter):

| Fixture | Purpose |
|---|---|
| `page` | The browser page/tab to interact with (most commonly used) |
| `context` | The browser context that the page belongs to |
| `browser` | The launched browser instance itself |
| `browserName` | Returns the name of the browser currently being used |
| `request` | Useful for **API testing** within Playwright |

> Note: Custom fixtures (creating your own) will be covered in a separate, more detailed video later in the series.

---

## 6. What Happens If You Forget `await`

This was demonstrated directly: removing `await` before the page actions and running the test causes:
- The browser opens **and then immediately closes** before any meaningful action happens.
- The test **fails**, because the code tried to move to the next line (e.g., clicking an element) without waiting for the previous Promise (like page navigation) to actually finish.
- Since all lines without `await` attempt to run together/immediately, actions get executed before their prerequisites (like the page being loaded) are ready — leading to broken or failing tests.

**Rule of thumb:** Wherever a Playwright method returns a Promise, always use `await` in front of it, and make sure the surrounding function is marked `async`.

---

## Quick Reference Summary

| Concept | Key Point |
|---|---|
| **TypeScript vs JavaScript** | TypeScript is a superset of JavaScript — same `async`/`await` behavior in both |
| **Promise** | A placeholder for a value/action that will complete *later*, not instantly (like a waiter's promise to bring food) |
| **`await`** | Pauses execution on that line until the Promise resolves, before moving to the next line |
| **`async`** | Required on any function that uses `await` inside it |
| **`page` fixture** | Automatically set up/torn down by Playwright for each test; used to perform browser actions (`goto`, `click`, `fill`, etc.) |
| **Manual equivalent of `page`** | `chromium.launch()` → `browser.newContext()` → `context.newPage()` |
| **Other fixtures** | `context`, `browser`, `browserName`, `request` (for API testing) |
| **Forgetting `await`** | Code runs out of order; actions execute before their prerequisites are ready → test failures |# Async/Await in JavaScript & TypeScript + Page Fixture in Playwright — Structured Notes

This is Part 5 of the Playwright + TypeScript series. It builds on the basic test script structure from Part 3 and explains two core concepts you'll use in **every** Playwright test: the **async/await** pattern and the **page fixture**.

---

## 1. Starting Point — The Existing Test Script

From the previous video, there's already a `kickstart.spec.ts` file with this structure:

```ts
import { test } from '@playwright/test';

test('basic steps to start with the playwright', () => {
  // test code goes here
});
```

- `test` is imported from the `@playwright/test` module.
- The `test()` function takes two arguments:
  1. **Test name/title** (a string) — e.g., `"basic steps to start with the playwright"`.
  2. **An anonymous function** — the actual test logic.

This video adds `async`, `await`, and the **page fixture** into this structure.

---

## 2. Building the Test Step by Step

### Step 1: Mark the function as `async`
```ts
test('basic steps to start with the playwright', async ({ page }) => {
  // ...
});
```
- The anonymous function is marked `async`.
- Inside the curly braces `{ }` (the function's parameter), we add `page` — this is the **page fixture**, automatically provided by Playwright.

### Step 2: Navigate to a URL using the page fixture
```ts
await page.goto('https://www.google.com');
```
- `page.goto()` opens the browser and navigates to the given URL.
- Note the `await` keyword placed **before** `page` — required because `goto()` returns a **Promise** (explained in section 3).

### Step 3: Perform a click action
```ts
await page.locator('...').click(); // locator obtained via "Pick Locator" tool
```
- The locator for an element (e.g., the "Google apps" menu) is identified using the **Pick Locator** tool (covered in the previous video).
- `click()` also returns a Promise, so it also needs `await` in front of it.

### Running the test
- Using the **Testing panel** (Explorer or Testing tab) with **"Show Browser"** enabled, running this test:
  1. Opens `google.com` in a real browser window.
  2. Clicks on the specified menu/element.
  3. Completes execution successfully.

---

## 3. Understanding `async` and `await`

### Important context: TypeScript is a superset of JavaScript
- TypeScript understands all JavaScript syntax and capabilities.
- You can literally take a `.js` file, rename its extension to `.ts`, and it will work as valid TypeScript — because TypeScript is built **on top of** JavaScript, not separate from it.
- This means `async`/`await` behave **identically** in both JavaScript and TypeScript.

### The problem `await` solves
Normally, JavaScript/TypeScript runs code line by line, **without pausing** — as soon as one line is fired off, it immediately moves to the next line, even if the first line hasn't actually finished its work yet.

This is fine for instant operations (like `let x = 5;`), but it breaks down for actions that take real time to complete — like opening a browser, loading a webpage, or clicking a button that triggers a page navigation. These are **slow operations**, and the code that comes after them often depends on them being fully done first.

**Example of the problem:**
```ts
page.goto('https://www.google.com'); // takes time to load the page
page.locator('...').click();          // tries to click immediately — page may not be loaded yet!
```
Without anything to make the code wait, line 2 could try to click an element **before** the page from line 1 has even finished loading — causing the test to fail, because the element either doesn't exist yet or the page isn't ready.

This is exactly the problem `await` is designed to solve: it forces the code to **pause on that line** until the slow operation is genuinely finished, before allowing execution to continue to the next line.

### Promises — explained with an analogy
Many Playwright methods (like `page.goto()` and `.click()`) **return a Promise**. You can confirm this by hovering over the method in your editor — it will show something like:
```
goto(url: string, options?: ...): Promise<...>
```

**Analogy — Ordering pasta at a restaurant:**
- You order pasta from a waiter. The waiter doesn't hand you cooked pasta instantly — instead, they **promise** to bring it to you.
- Behind the scenes: the waiter goes to the chef, the chef cooks the pasta, and only once it's ready does the waiter bring it back and fulfill the promise.
- You **wait** until that promise is fulfilled before you start eating.

This is exactly what a **Promise** represents in code: a placeholder for something that will complete *eventually* (not instantly).

### What `await` does
- `await` tells your code: **"Wait here until this Promise is completed, then move to the next line."**
- Example: `await page.goto(url)` — wait until the browser has actually finished navigating to the URL before running the next line.
- Without `await`, the code would try to move to the next action (e.g., clicking an element) **before** the page has even loaded — causing errors or test failures.

### The `async` requirement
- JavaScript/TypeScript **requires** that `await` only be used inside a function marked as `async`.
- That's why the test's anonymous function is written as `async ({ page }) => { ... }` — the `async` keyword unlocks the ability to use `await` inside it.

### Documentation summary (paraphrased)
- `await` waits for a Promise to resolve (complete) before continuing to the next line of code.
- JavaScript mandates that `await` can only be used inside a function declared with `async`.

---

## 4. Understanding the Page Fixture

### What is the page fixture?
- The `page` argument passed into the test function (`async ({ page }) => {...}`) tells Playwright Test to **set up a "page" fixture** and provide it to your test.
- Playwright automatically:
  1. **Sets up** the page fixture **before** the test runs.
  2. **Tears it down** (cleans up) **after** the test finishes.
- **Fixtures are isolated between tests** — each test gets its own fresh, independent fixture instance; one test's page/browser state does not leak into another test.

### What can you do with the page fixture?
The `page` object is used throughout a test script to perform browser actions, such as:
- Navigating to URLs (`page.goto()`)
- Clicking elements (`page.locator(...).click()`)
- Typing into fields (`fill()`)
- Capturing screenshots
- ...and many other browser interactions (covered in later videos)

---

## 5. What Happens "Under the Hood" Without the Fixture

To understand *why* the page fixture is so convenient, here's what you'd have to write manually if Playwright didn't provide it:

```ts
const browser = await chromium.launch();        // 1. Launch a browser
const context = await browser.newContext();      // 2. Create a browser context
const page = await context.newPage();            // 3. Create a page from that context
```

- **`chromium.launch()`** — starts a Chromium browser instance. (`chromium` is imported from `@playwright/test`, similar to how `test` is imported.)
- **`browser.newContext()`** — creates an isolated browser context (like a fresh browser profile/session) from the launched browser.
- **`context.newPage()`** — creates a new page/tab within that context, which is what you actually interact with.

Running the test with this manual setup produces the **exact same result** (a new browser opens, navigates, and clicks) as using the `page` fixture directly.

**Key takeaway:** The `page` fixture is just Playwright's built-in shortcut that handles these three setup steps (launch browser → create context → create page) automatically, so you don't have to write that boilerplate yourself.

### Other built-in fixtures available
Besides `page`, Playwright provides several other fixtures you can request the same way (by adding them to the destructured parameter):

| Fixture | Purpose |
|---|---|
| `page` | The browser page/tab to interact with (most commonly used) |
| `context` | The browser context that the page belongs to |
| `browser` | The launched browser instance itself |
| `browserName` | Returns the name of the browser currently being used |
| `request` | Useful for **API testing** within Playwright |

> Note: Custom fixtures (creating your own) will be covered in a separate, more detailed video later in the series.

---

## 6. What Happens If You Forget `await`

This was demonstrated directly: removing `await` before the page actions and running the test causes:
- The browser opens **and then immediately closes** before any meaningful action happens.
- The test **fails**, because the code tried to move to the next line (e.g., clicking an element) without waiting for the previous Promise (like page navigation) to actually finish.
- Since all lines without `await` attempt to run together/immediately, actions get executed before their prerequisites (like the page being loaded) are ready — leading to broken or failing tests.

**Rule of thumb:** Wherever a Playwright method returns a Promise, always use `await` in front of it, and make sure the surrounding function is marked `async`.

---

## Quick Reference Summary

| Concept | Key Point |# Async/Await in JavaScript & TypeScript + Page Fixture in Playwright — Structured Notes

This is Part 5 of the Playwright + TypeScript series. It builds on the basic test script structure from Part 3 and explains two core concepts you'll use in **every** Playwright test: the **async/await** pattern and the **page fixture**.

---

## 1. Starting Point — The Existing Test Script

From the previous video, there's already a `kickstart.spec.ts` file with this structure:

```ts
import { test } from '@playwright/test';

test('basic steps to start with the playwright', () => {
  // test code goes here
});
```

- `test` is imported from the `@playwright/test` module.
- The `test()` function takes two arguments:
  1. **Test name/title** (a string) — e.g., `"basic steps to start with the playwright"`.
  2. **An anonymous function** — the actual test logic.

This video adds `async`, `await`, and the **page fixture** into this structure.

---

## 2. Building the Test Step by Step

### Step 1: Mark the function as `async`
```ts
test('basic steps to start with the playwright', async ({ page }) => {
  // ...
});
```
- The anonymous function is marked `async`.
- Inside the curly braces `{ }` (the function's parameter), we add `page` — this is the **page fixture**, automatically provided by Playwright.

### Step 2: Navigate to a URL using the page fixture
```ts
await page.goto('https://www.google.com');
```
- `page.goto()` opens the browser and navigates to the given URL.
- Note the `await` keyword placed **before** `page` — required because `goto()` returns a **Promise** (explained in section 3).

### Step 3: Perform a click action
```ts
await page.locator('...').click(); // locator obtained via "Pick Locator" tool
```
- The locator for an element (e.g., the "Google apps" menu) is identified using the **Pick Locator** tool (covered in the previous video).
- `click()` also returns a Promise, so it also needs `await` in front of it.

### Running the test
- Using the **Testing panel** (Explorer or Testing tab) with **"Show Browser"** enabled, running this test:
  1. Opens `google.com` in a real browser window.
  2. Clicks on the specified menu/element.
  3. Completes execution successfully.

---

## 3. Understanding `async` and `await`

### Important context: TypeScript is a superset of JavaScript
- TypeScript understands all JavaScript syntax and capabilities.
- You can literally take a `.js` file, rename its extension to `.ts`, and it will work as valid TypeScript — because TypeScript is built **on top of** JavaScript, not separate from it.
- This means `async`/`await` behave **identically** in both JavaScript and TypeScript.

### The problem `await` solves
Normally, JavaScript/TypeScript runs code line by line, **without pausing** — as soon as one line is fired off, it immediately moves to the next line, even if the first line hasn't actually finished its work yet.

This is fine for instant operations (like `let x = 5;`), but it breaks down for actions that take real time to complete — like opening a browser, loading a webpage, or clicking a button that triggers a page navigation. These are **slow operations**, and the code that comes after them often depends on them being fully done first.

**Example of the problem:**
```ts
page.goto('https://www.google.com'); // takes time to load the page
page.locator('...').click();          // tries to click immediately — page may not be loaded yet!
```
Without anything to make the code wait, line 2 could try to click an element **before** the page from line 1 has even finished loading — causing the test to fail, because the element either doesn't exist yet or the page isn't ready.

This is exactly the problem `await` is designed to solve: it forces the code to **pause on that line** until the slow operation is genuinely finished, before allowing execution to continue to the next line.

### Promises — explained with an analogy
Many Playwright methods (like `page.goto()` and `.click()`) **return a Promise**. You can confirm this by hovering over the method in your editor — it will show something like:
```
goto(url: string, options?: ...): Promise<...>
```

**Analogy — Ordering pasta at a restaurant:**
- You order pasta from a waiter. The waiter doesn't hand you cooked pasta instantly — instead, they **promise** to bring it to you.
- Behind the scenes: the waiter goes to the chef, the chef cooks the pasta, and only once it's ready does the waiter bring it back and fulfill the promise.
- You **wait** until that promise is fulfilled before you start eating.

This is exactly what a **Promise** represents in code: a placeholder for something that will complete *eventually* (not instantly).

### What `await` does
- `await` tells your code: **"Wait here until this Promise is completed, then move to the next line."**
- Example: `await page.goto(url)` — wait until the browser has actually finished navigating to the URL before running the next line.
- Without `await`, the code would try to move to the next action (e.g., clicking an element) **before** the page has even loaded — causing errors or test failures.

### The `async` requirement
- JavaScript/TypeScript **requires** that `await` only be used inside a function marked as `async`.
- That's why the test's anonymous function is written as `async ({ page }) => { ... }` — the `async` keyword unlocks the ability to use `await` inside it.

### Documentation summary (paraphrased)
- `await` waits for a Promise to resolve (complete) before continuing to the next line of code.
- JavaScript mandates that `await` can only be used inside a function declared with `async`.

---

## 4. Understanding the Page Fixture

### What is the page fixture?
- The `page` argument passed into the test function (`async ({ page }) => {...}`) tells Playwright Test to **set up a "page" fixture** and provide it to your test.
- Playwright automatically:
  1. **Sets up** the page fixture **before** the test runs.
  2. **Tears it down** (cleans up) **after** the test finishes.
- **Fixtures are isolated between tests** — each test gets its own fresh, independent fixture instance; one test's page/browser state does not leak into another test.

### What can you do with the page fixture?
The `page` object is used throughout a test script to perform browser actions, such as:
- Navigating to URLs (`page.goto()`)
- Clicking elements (`page.locator(...).click()`)
- Typing into fields (`fill()`)
- Capturing screenshots
- ...and many other browser interactions (covered in later videos)

---

## 5. What Happens "Under the Hood" Without the Fixture

To understand *why* the page fixture is so convenient, here's what you'd have to write manually if Playwright didn't provide it:

```ts
const browser = await chromium.launch();        // 1. Launch a browser
const context = await browser.newContext();      // 2. Create a browser context
const page = await context.newPage();            // 3. Create a page from that context
```

- **`chromium.launch()`** — starts a Chromium browser instance. (`chromium` is imported from `@playwright/test`, similar to how `test` is imported.)
- **`browser.newContext()`** — creates an isolated browser context (like a fresh browser profile/session) from the launched browser.
- **`context.newPage()`** — creates a new page/tab within that context, which is what you actually interact with.

Running the test with this manual setup produces the **exact same result** (a new browser opens, navigates, and clicks) as using the `page` fixture directly.

**Key takeaway:** The `page` fixture is just Playwright's built-in shortcut that handles these three setup steps (launch browser → create context → create page) automatically, so you don't have to write that boilerplate yourself.

### Other built-in fixtures available
Besides `page`, Playwright provides several other fixtures you can request the same way (by adding them to the destructured parameter):

| Fixture | Purpose |
|---|---|
| `page` | The browser page/tab to interact with (most commonly used) |
| `context` | The browser context that the page belongs to |
| `browser` | The launched browser instance itself |
| `browserName` | Returns the name of the browser currently being used |
| `request` | Useful for **API testing** within Playwright |

> Note: Custom fixtures (creating your own) will be covered in a separate, more detailed video later in the series.

---

## 6. What Happens If You Forget `await`

This was demonstrated directly: removing `await` before the page actions and running the test causes:
- The browser opens **and then immediately closes** before any meaningful action happens.
- The test **fails**, because the code tried to move to the next line (e.g., clicking an element) without waiting for the previous Promise (like page navigation) to actually finish.
- Since all lines without `await` attempt to run together/immediately, actions get executed before their prerequisites (like the page being loaded) are ready — leading to broken or failing tests.

**Rule of thumb:** Wherever a Playwright method returns a Promise, always use `await` in front of it, and make sure the surrounding function is marked `async`.

---

## Quick Reference Summary

| Concept | Key Point |
|---|---|
| **TypeScript vs JavaScript** | TypeScript is a superset of JavaScript — same `async`/`await` behavior in both |
| **Promise** | A placeholder for a value/action that will complete *later*, not instantly (like a waiter's promise to bring food) |
| **`await`** | Pauses execution on that line until the Promise resolves, before moving to the next line |
| **`async`** | Required on any function that uses `await` inside it |
| **`page` fixture** | Automatically set up/torn down by Playwright for each test; used to perform browser actions (`goto`, `click`, `fill`, etc.) |
| **Manual equivalent of `page`** | `chromium.launch()` → `browser.newContext()` → `context.newPage()` |
| **Other fixtures** | `context`, `browser`, `browserName`, `request` (for API testing) |
| **Forgetting `await`** | Code runs out of order; actions execute before their prerequisites are ready → test failures |
|---|---|
| **TypeScript vs JavaScript** | TypeScript is a superset of JavaScript — same `async`/`await` behavior in both |
| **Promise** | A placeholder for a value/action that will complete *later*, not instantly (like a waiter's promise to bring food) |
| **`await`** | Pauses execution on that line until the Promise resolves, before moving to the next line |
| **`async`** | Required on any function that uses `await` inside it |
| **`page` fixture** | Automatically set up/torn down by Playwright for each test; used to perform browser actions (`goto`, `click`, `fill`, etc.) |
| **Manual equivalent of `page`** | `chromium.launch()` → `browser.newContext()` → `context.newPage()` |
| **Other fixtures** | `context`, `browser`, `browserName`, `request` (for API testing) |
| **Forgetting `await`** | Code runs out of order; actions execute before their prerequisites are ready → test failures |
  1. **Test name/title** (a string) — e.g., `"basic steps to start with the playwright"`.
  2. **An anonymous function** — the actual test logic.

This video adds `async`, `await`, and the **page fixture** into this structure.

---

## 2. Building the Test Step by Step

### Step 1: Mark the function as `async`
```ts
test('basic steps to start with the playwright', async ({ page }) => {
  // ...
});
```
- The anonymous function is marked `async`.
- Inside the curly braces `{ }` (the function's parameter), we add `page` — this is the **page fixture**, automatically provided by Playwright.

### Step 2: Navigate to a URL using the page fixture
```ts
await page.goto('https://www.google.com');
```
- `page.goto()` opens the browser and navigates to the given URL.
- Note the `await` keyword placed **before** `page` — required because `goto()` returns a **Promise** (explained in section 3).

### Step 3: Perform a click action
```ts
await page.locator('...').click(); // locator obtained via "Pick Locator" tool
```
- The locator for an element (e.g., the "Google apps" menu) is identified using the **Pick Locator** tool (covered in the previous video).
- `click()` also returns a Promise, so it also needs `await` in front of it.

### Running the test
- Using the **Testing panel** (Explorer or Testing tab) with **"Show Browser"** enabled, running this test:
  1. Opens `google.com` in a real browser window.
  2. Clicks on the specified menu/element.
  3. Completes execution successfully.

---

## 3. Understanding `async` and `await`

### Important context: TypeScript is a superset of JavaScript
- TypeScript understands all JavaScript syntax and capabilities.
- You can literally take a `.js` file, rename its extension to `.ts`, and it will work as valid TypeScript — because TypeScript is built **on top of** JavaScript, not separate from it.
- This means `async`/`await` behave **identically** in both JavaScript and TypeScript.

### The problem `await` solves
Normally, JavaScript/TypeScript runs code line by line, **without pausing** — as soon as one line is fired off, it immediately moves to the next line, even if the first line hasn't actually finished its work yet.

This is fine for instant operations (like `let x = 5;`), but it breaks down for actions that take real time to complete — like opening a browser, loading a webpage, or clicking a button that triggers a page navigation. These are **slow operations**, and the code that comes after them often depends on them being fully done first.

**Example of the problem:**
```ts
page.goto('https://www.google.com'); // takes time to load the page
page.locator('...').click();          // tries to click immediately — page may not be loaded yet!
```
Without anything to make the code wait, line 2 could try to click an element **before** the page from line 1 has even finished loading — causing the test to fail, because the element either doesn't exist yet or the page isn't ready.

This is exactly the problem `await` is designed to solve: it forces the code to **pause on that line** until the slow operation is genuinely finished, before allowing execution to continue to the next line.

### Promises — explained with an analogy
Many Playwright methods (like `page.goto()` and `.click()`) **return a Promise**. You can confirm this by hovering over the method in your editor — it will show something like:
```
goto(url: string, options?: ...): Promise<...>
```

**Analogy — Ordering pasta at a restaurant:**
- You order pasta from a waiter. The waiter doesn't hand you cooked pasta instantly — instead, they **promise** to bring it to you.
- Behind the scenes: the waiter goes to the chef, the chef cooks the pasta, and only once it's ready does the waiter bring it back and fulfill the promise.
- You **wait** until that promise is fulfilled before you start eating.

This is exactly what a **Promise** represents in code: a placeholder for something that will complete *eventually* (not instantly).

### What `await` does
- `await` tells your code: **"Wait here until this Promise is completed, then move to the next line."**
- Example: `await page.goto(url)` — wait until the browser has actually finished navigating to the URL before running the next line.
- Without `await`, the code would try to move to the next action (e.g., clicking an element) **before** the page has even loaded — causing errors or test failures.

### The `async` requirement
- JavaScript/TypeScript **requires** that `await` only be used inside a function marked as `async`.
- That's why the test's anonymous function is written as `async ({ page }) => { ... }` — the `async` keyword unlocks the ability to use `await` inside it.

### Documentation summary (paraphrased)
- `await` waits for a Promise to resolve (complete) before continuing to the next line of code.
- JavaScript mandates that `await` can only be used inside a function declared with `async`.

---

## 4. Understanding the Page Fixture

### What is the page fixture?
- The `page` argument passed into the test function (`async ({ page }) => {...}`) tells Playwright Test to **set up a "page" fixture** and provide it to your test.
- Playwright automatically:
  1. **Sets up** the page fixture **before** the test runs.
  2. **Tears it down** (cleans up) **after** the test finishes.
- **Fixtures are isolated between tests** — each test gets its own fresh, independent fixture instance; one test's page/browser state does not leak into another test.

### What can you do with the page fixture?
The `page` object is used throughout a test script to perform browser actions, such as:
- Navigating to URLs (`page.goto()`)
- Clicking elements (`page.locator(...).click()`)
- Typing into fields (`fill()`)
- Capturing screenshots
- ...and many other browser interactions (covered in later videos)

---

## 5. What Happens "Under the Hood" Without the Fixture

To understand *why* the page fixture is so convenient, here's what you'd have to write manually if Playwright didn't provide it:

```ts
const browser = await chromium.launch();        // 1. Launch a browser
const context = await browser.newContext();      // 2. Create a browser context
const page = await context.newPage();            // 3. Create a page from that context
```

- **`chromium.launch()`** — starts a Chromium browser instance. (`chromium` is imported from `@playwright/test`, similar to how `test` is imported.)
- **`browser.newContext()`** — creates an isolated browser context (like a fresh browser profile/session) from the launched browser.
- **`context.newPage()`** — creates a new page/tab within that context, which is what you actually interact with.

Running the test with this manual setup produces the **exact same result** (a new browser opens, navigates, and clicks) as using the `page` fixture directly.

**Key takeaway:** The `page` fixture is just Playwright's built-in shortcut that handles these three setup steps (launch browser → create context → create page) automatically, so you don't have to write that boilerplate yourself.

### Other built-in fixtures available
Besides `page`, Playwright provides several other fixtures you can request the same way (by adding them to the destructured parameter):

| Fixture | Purpose |
|---|---|
| `page` | The browser page/tab to interact with (most commonly used) |
| `context` | The browser context that the page belongs to |
| `browser` | The launched browser instance itself |
| `browserName` | Returns the name of the browser currently being used |
| `request` | Useful for **API testing** within Playwright |

> Note: Custom fixtures (creating your own) will be covered in a separate, more detailed video later in the series.

---

## 6. What Happens If You Forget `await`

This was demonstrated directly: removing `await` before the page actions and running the test causes:
- The browser opens **and then immediately closes** before any meaningful action happens.
- The test **fails**, because the code tried to move to the next line (e.g., clicking an element) without waiting for the previous Promise (like page navigation) to actually finish.
- Since all lines without `await` attempt to run together/immediately, actions get executed before their prerequisites (like the page being loaded) are ready — leading to broken or failing tests.

**Rule of thumb:** Wherever a Playwright method returns a Promise, always use `await` in front of it, and make sure the surrounding function is marked `async`.

---

## Quick Reference Summary

| Concept | Key Point |
|---|---|
| **TypeScript vs JavaScript** | TypeScript is a superset of JavaScript — same `async`/`await` behavior in both |
| **Promise** | A placeholder for a value/action that will complete *later*, not instantly (like a waiter's promise to bring food) |
| **`await`** | Pauses execution on that line until the Promise resolves, before moving to the next line |
| **`async`** | Required on any function that uses `await` inside it |
| **`page` fixture** | Automatically set up/torn down by Playwright for each test; used to perform browser actions (`goto`, `click`, `fill`, etc.) |
| **Manual equivalent of `page`** | `chromium.launch()` → `browser.newContext()` → `context.newPage()` |
| **Other fixtures** | `context`, `browser`, `browserName`, `request` (for API testing) |
| **Forgetting `await`** | Code runs out of order; actions execute before their prerequisites are ready → test failures |