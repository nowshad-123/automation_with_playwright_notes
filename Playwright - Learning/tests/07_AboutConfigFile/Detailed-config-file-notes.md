# Playwright Configuration File (`playwright.config.ts`) — Detailed Structured Notes

This is Part 10 of the Playwright + TypeScript series. It covers every important option inside `playwright.config.ts` — the central file that controls how your entire test suite runs.

---

## 1. What Is the Configuration File?

`playwright.config.ts` is the **single control centre** for your Playwright project. Instead of passing options every time you run a test, you define them once here and Playwright applies them globally across all tests.

---

## 2. How to Get the Config File

| Installation Method | Config file created? |
|---|---|
| Playwright VS Code Extension | ✅ Auto-generated |
| `npm init playwright@latest` command | ✅ Auto-generated |
| Manual installation (adding packages by hand) | ❌ Must create it manually |

### Creating the file manually
If you don't have the file, create `playwright.config.ts` at the **root of your project** (not inside the `tests` folder).

> **Important:** Use exactly this name — `playwright.config.ts`. Playwright auto-detects this name. Using a different name means you must specify it manually every time you run tests. Stick with the default.

### Basic structure of the file
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // all configuration options go here
});
```
- `defineConfig` — the wrapper function that accepts all config options.
- `devices` — a built-in Playwright object with pre-configured browser/device profiles (iPhone, desktop Chrome, etc.).
- `export default` — required so Playwright can read and use this config.

---

## 3. Configuration Options — One by One

### 3.1 `testDir` — where to find your test files

**What it does:** Tells Playwright which folder to scan (recursively) when looking for test files to run.

```ts
testDir: './tests',
```

- `'./tests'` means the `tests` folder at the root of the project.
- Change this to any folder name you want (e.g., `'./tests-examples'`).
- The Playwright VS Code extension's Testing panel **automatically updates** to show only the tests found in this directory.

**Effect on CLI:**
```bash
npx playwright test   # runs all spec files found inside testDir
```

---

### 3.2 `fullyParallel` — run all tests in parallel

**What it does:** When `true`, Playwright runs **all tests across all files simultaneously** in parallel — not just file by file.

```ts
fullyParallel: true,
```

- `true` → all tests run at the same time (fastest, but requires tests to be independent).
- `false` → tests within a file run sequentially; files themselves may still run in parallel.

> **Critical rule for parallel execution:** Each test must be completely **independent** — it should not depend on the result or state of any other test. If Test 2 relies on Test 1 having completed first, parallel execution will break it.

---

### 3.3 `forbidOnly` — prevent accidental `.only` commits

**Background — what is `test.only`?**

During debugging, you can add `.only` to a test to run just that one test:
```ts
test.only("my specific test", async ({ page }) => { ... });
```
This is very useful locally — but dangerous if committed to the codebase, because your CI/CD pipeline would then only run that one test instead of the full suite.

**What `forbidOnly` does:** Makes Playwright throw an error and refuse to run if any test in the codebase has `.only` on it.

```ts
forbidOnly: !!process.env.CI,
```

**Breaking this down:**
- `process.env.CI` → a built-in environment variable that is automatically `true` on CI/CD platforms (Jenkins, Azure DevOps, GitHub Actions, etc.) and `undefined` locally.
- `!!process.env.CI` → converts it to a proper boolean: `true` on CI, `false` locally.

**Result:**
| Environment | `forbidOnly` value | Effect |
|---|---|---|
| Local machine | `false` | `test.only` is allowed — you can debug freely |
| CI/CD pipeline | `true` | `test.only` causes an error — protects the full suite |

**Error you'll see if triggered:**
```
Error: item focused with .only is not allowed due to the 'forbidOnly' option in playwright.config.ts
```

---

### 3.4 `retries` — automatically re-run failed tests

**What it does:** Specifies how many times Playwright should **retry a failed test** before marking it as truly failed.

```ts
retries: process.env.CI ? 2 : 0,
```

**Breaking this down:**
- On CI → retry up to 2 times (handles intermittent network issues, slow environments).
- Locally → 0 retries (you want to see failures immediately while debugging).

**When retries are useful:**
Imagine a test that loads a slow page. Occasionally the page takes longer than expected and the test times out — but this isn't a real bug. A retry gives the test another chance to pass without marking it as a genuine failure.

**Important:** Retries are **not** a substitute for fixing flaky tests. If a test consistently needs retries, investigate and fix the root cause.

> **Best practice:** Keep retries at `0` locally so you immediately see real failures. Use `2` on CI as a safety net for environmental flakiness.

---

### 3.5 `workers` — how many tests run simultaneously

**What it does:** Controls the number of **parallel workers** (browser instances) Playwright uses during a run.

```ts
workers: process.env.CI ? 1 : undefined,
```

- On CI → `1` worker (sequential, more stable in constrained environments).
- Locally → `undefined` (Playwright uses a sensible default based on your machine's CPU cores).

**You can also set a fixed number:**
```ts
workers: 3,  // always use exactly 3 workers regardless of environment
```

**What workers actually do:**
- Each worker is a separate browser process running a test.
- With 3 workers, up to 3 tests run **at the same time** in parallel.
- More workers = faster execution, but higher CPU/memory usage.

> **Practical tip:** Don't set workers too high (e.g., 50). Opening 50 browsers simultaneously will likely crash or severely slow down your machine. A value of 2–4 is reasonable for most local machines.

---

### 3.6 `reporter` — what kind of test report to generate

**What it does:** Configures how Playwright reports test results after a run.

**Single reporter:**
```ts
reporter: 'html',
```

**Multiple reporters at once:**
```ts
reporter: [
  ['html'],
  ['json', { outputFile: 'results.json' }],
],
```
- Each reporter is an array inside the outer array.
- The second element (optional) is a configuration object — e.g., a custom output filename.

**Available reporter types:**

| Reporter | What it produces |
|---|---|
| `html` | An interactive HTML report with test details, screenshots, traces |
| `json` | A JSON file with full test results (useful for third-party tools) |
| `list` | Simple text list in the terminal |
| `dot` | One dot per test — minimal terminal output |
| `junit` | XML format — used by Jenkins, Azure DevOps |
| `github` | GitHub Actions annotation format |
| `line` | Single-line per test output |

> **Default is `html`.** The HTML report is saved to a `playwright-report` folder and contains an `index.html` file you can open in a browser. The HTML report will be covered in detail in the next video.

**Viewing the HTML report:**
```bash
npx playwright show-report
```
Or open `playwright-report/index.html` directly in your browser.

---

### 3.7 `timeout` — how long a test can run before failing

**What it does:** Sets the **maximum time** (in milliseconds) a single test is allowed to run before Playwright forces it to fail with a timeout error.

```ts
timeout: 30000,  // default: 30 seconds
```

**When you'd change this:**
- Your application is slow (heavy page loads, slow APIs) → increase it.
- You want stricter, faster failures during development → decrease it.

```ts
timeout: 5000,   // 5 seconds — strict mode, fast feedback
timeout: 60000,  // 60 seconds — for slow applications
```

**Timeout error message:**
```
Test timeout of 30,000ms exceeded.
```

> This applies to the **whole test**. For element/locator timeouts specifically (how long Playwright waits to find an element), that's a separate `actionTimeout` setting.

---

### 3.8 `expect.timeout` — how long an assertion waits before failing

**What it does:** Sets how long an **auto-retrying assertion** (`expect(locator).toBeVisible()`, etc.) keeps retrying before giving up.

```ts
expect: {
  timeout: 5000,   // default: 5 seconds
},
```

**Difference between `timeout` and `expect.timeout`:**
| Setting | Controls |
|---|---|
| `timeout` | How long the **entire test** can run |
| `expect.timeout` | How long a **single assertion** keeps retrying |

```ts
expect: {
  timeout: 7000,  // assertions will retry for 7 seconds before failing
},
```

**Assertion timeout error:**
```
Timeout of 7,000ms waiting for expect(locator).toHaveCount(1)
```

---

### 3.9 `use` — global options applied to every test

**What it does:** Any option placed inside `use` applies **globally to all tests** across all projects.

```ts
use: {
  trace: 'on-first-retry',
  headless: false,
  testIdAttribute: 'data-test',
},
```

**Common `use` options:**

| Option | Values | Purpose |
|---|---|---|
| `trace` | `'on'`, `'off'`, `'on-first-retry'`, `'retain-on-failure'` | When to record a trace file for debugging |
| `headless` | `true` (default), `false` | Whether to show the browser during test runs |
| `testIdAttribute` | Any string (e.g., `'data-test'`) | Custom attribute for `getByTestId()` (default: `data-testid`) |
| `screenshot` | `'on'`, `'off'`, `'only-on-failure'` | When to capture screenshots |
| `video` | `'on'`, `'off'`, `'on-first-retry'`, `'retain-on-failure'` | When to record video of the test |
| `baseURL` | A URL string | Base URL prepended to all `page.goto()` calls |
| `viewport` | `{ width, height }` | Browser window size |

**`trace` option — what it does:**
- `'on'` → always record a trace file (detailed step-by-step log of every action).
- `'off'` → never record.
- `'on-first-retry'` → only record when a test is being retried (great for debugging flaky tests).
- `'retain-on-failure'` → only keep trace files for tests that failed.

Trace files are viewable in Playwright's Trace Viewer (covered in a separate video).

**`headless` — key behaviour:**
- `true` (default) → browser is invisible. Faster and used in CI.
- `false` → browser window opens visibly. Useful for debugging locally.

You can also control headless mode from the **CLI** without changing the config:
```bash
npx playwright test --headed    # shows browser for this run only
```

---

### 3.10 `projects` — run tests across multiple browsers or devices

**What it does:** Defines a list of **named configurations** — each can target a different browser, device, or set of options. Playwright runs your entire test suite once per project.

```ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'iPhone 14',
    use: { ...devices['iPhone 14'] },
  },
],
```

**Key concepts:**

- **`name`** — a label for this project (any string you choose). This name is used when running from the CLI.
- **`...devices['Device Name']`** — the spread operator (`...`) unpacks a pre-configured device profile from Playwright's built-in `devices` object. These profiles include viewport size, user agent, and other device-specific settings.
- **`use` inside a project** — applies only to that project, overriding the global `use` for those tests only.

**Built-in device profiles include:**
`Desktop Chrome`, `Desktop Firefox`, `Desktop Safari`, `iPhone 14`, `iPhone 14 Pro Max`, `Pixel 7`, `Galaxy S9+`, and dozens more.

**Effect on VS Code testing panel:**
The projects you define here appear as selectable browser options in the Playwright extension's Testing panel — so you can easily switch between running on Chrome, Firefox, WebKit, or a mobile device from the UI.

**Running a specific project from CLI:**
```bash
npx playwright test --project=firefox
npx playwright test --project="iPhone 14"
```

**`use` priority — local overrides global:**
If both the top-level `use` and a project's `use` define the same option, the **project-level `use` wins** for that project.

---

## 4. Running Tests from the CLI — Key Commands

| Command | What it does |
|---|---|
| `npx playwright test` | Run all tests in all projects |
| `npx playwright test filename.spec.ts` | Run only that specific file |
| `npx playwright test --project=chromium` | Run all tests in the `chromium` project only |
| `npx playwright test --headed` | Run with visible browser (overrides headless for this run) |
| `npx playwright show-report` | Open the HTML report in a browser |

> **Default browser when using CLI:** Without specifying a project, Playwright runs against all configured projects (all browsers). This is different from the VS Code extension, which runs against `chromium` by default.

---

## 5. How `use` (global) vs. Project-level `use` Work Together

```
Global use (applies to ALL projects)
  └── trace: 'on-first-retry'
  └── headless: false

Project: chromium
  └── use: { headless: true }  ← overrides global for chromium only

Project: firefox
  └── (inherits global use — headless: false)
```

---

## 6. Full Config Example (Everything We Covered)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // folder Playwright scans for test files
  testDir: './tests',

  // run all tests in parallel
  fullyParallel: true,

  // prevent .only annotations from reaching CI
  forbidOnly: !!process.env.CI,

  // retry failed tests (2 on CI, 0 locally)
  retries: process.env.CI ? 2 : 0,

  // parallel workers (1 on CI, 3 locally)
  workers: process.env.CI ? 1 : 3,

  // generate HTML report
  reporter: 'html',

  // max time for an entire test to run
  timeout: 30000,

  // global options for all tests
  use: {
    trace: 'on-first-retry',     // record trace on retry
    headless: false,              // show browser
    testIdAttribute: 'data-test', // custom test id attribute
  },

  // assertion retry timeout
  expect: {
    timeout: 5000,
  },

  // browser/device configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
  ],

});
```

---

## 7. Quick Revision

```
testDir         → which folder holds your test files
fullyParallel   → true = all tests run at once in parallel
forbidOnly      → true on CI = blocks .only from being committed accidentally
retries         → how many times to retry a failed test (0 locally, 2 on CI)
workers         → max parallel browser instances at the same time
reporter        → format of test report (html, json, junit, list, etc.)
timeout         → max ms for a whole test (default 30,000)
expect.timeout  → max ms for a single assertion to keep retrying (default 5,000)

use (global)
  trace           → when to capture trace: on / off / on-first-retry / retain-on-failure
  headless        → true = invisible browser | false = visible browser
  testIdAttribute → custom attribute for getByTestId() (default: data-testid)

projects        → array of named browser/device configs
  name          → label for this config (used in CLI --project flag)
  devices[...]  → pre-built Playwright device profiles (spread with ...)
  use (local)   → overrides the global use for this project only

CLI commands
  npx playwright test                     → run all
  npx playwright test file.spec.ts        → run one file
  npx playwright test --project=firefox   → run one project/browser
  npx playwright test --headed            → show browser for this run
  npx playwright show-report              → open HTML report
```