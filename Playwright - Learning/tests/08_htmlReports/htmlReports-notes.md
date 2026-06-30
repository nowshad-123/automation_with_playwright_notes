This section covers how to **generate a rich HTML test report** with attached screenshots, recorded videos, trace files, and retry behaviour — so you can debug failures without re-running tests.

---

## 1. What Is the HTML Report?

The HTML report is a **self-contained web page** Playwright generates after every test run. It shows:

- Every test that ran, across every browser
- Pass / fail / flaky / skipped status
- How long each test took
- Screenshots, videos, and trace files attached to each test run
- Full step-by-step breakdown of what happened inside each test

> **"Self-contained"** means the entire report (HTML, screenshots, videos, trace data) lives in one folder — you can zip it and share it with a developer or QA lead without any special setup.
> 

---

## 2. How to Generate the HTML Report — Two Ways

### Way 1: Configure in `playwright.config.ts` (recommended — persists across all runs)

```tsx
reporter: 'html',
```

This is the simplest form. Just the report type as a string.

**With additional options** (open behaviour + custom output folder):

```tsx
reporter: [
  [
    'html',
    {
      open: 'always',           // when to auto-open the report in a browser
      outputFolder: 'my-report' // custom folder name instead of 'playwright-report'
    }
  ]
],
```

Notice the structure: `reporter` takes an **array of tuples**. Each tuple is a two-element array:

- Element 1 → report type (string): `'html'`
- Element 2 → options (object): `{ open: '...', outputFolder: '...' }`

This tuple structure is what allows multiple reporters at once:

```tsx
reporter: [
  ['html', { open: 'on-failure' }],
  ['json', { outputFile: 'results.json' }],
],
```

### `open` option — when does the report auto-open in a browser?

| Value | Behaviour |
| --- | --- |
| `'always'` | Opens the report after every run — pass or fail |
| `'never'` | Never opens automatically — you open it manually |
| `'on-failure'` | Only opens when at least one test failed |

> **Real-world recommendation:** Use `'on-failure'` on CI and `'always'` locally during development.
> 

### `outputFolder` option — where the report is saved

```tsx
outputFolder: 'custom-report'  // report goes into ./custom-report/
```

Default (if not specified): `playwright-report/`

---

### Way 2: Pass reporter as a CLI flag (one-off, no config change needed)

```bash
npx playwright test --reporter=html
```

- Generates the HTML report for that run only.
- Useful when you normally use a different reporter but want HTML for a specific run.
- Even if the `reporter` line in `playwright.config.ts` is commented out, this CLI flag overrides it.

---

## 3. Opening the Report

### Option A — CLI command (recommended)

```bash
npx playwright show-report
```

Opens `playwright-report/index.html` on `localhost` in your browser.

**If you used a custom output folder:**

```bash
npx playwright show-report custom-report
```

### Option B — Open the file directly

Navigate to `playwright-report/` in your project, find `index.html`, and open it in any browser.

> **Note:** When running tests through the VS Code Playwright extension, the `open: 'always'` setting may not trigger automatically — this is a known quirk. Use the CLI (`npx playwright test`) for the auto-open behaviour to work reliably.
> 

---

## 4. Attaching Screenshots, Videos & Traces to the Report

All three are configured inside the `use` block in `playwright.config.ts`:

```tsx
use: {
  screenshot: 'only-on-failure',
  video:       'retain-on-failure',
  trace:       'on-first-retry',
},
```

---

### 4.1 Screenshots

| Value | Behaviour |
| --- | --- |
| `'on'` | Capture a screenshot for **every** test — pass or fail |
| `'off'` | Never capture screenshots |
| `'only-on-failure'` | Only capture screenshots for tests that **fail** |

**Real-world recommendation:** Use `'only-on-failure'` in production — no point storing screenshots for tests that already passed.

**In the report:** Click on any test → scroll down → the screenshot is embedded inline. You can also download it directly from the report.

---

### 4.2 Video Recording

| Value | Behaviour |
| --- | --- |
| `'on'` | Record video for every test |
| `'off'` | Never record video |
| `'retain-on-failure'` | Record for all tests, but **delete** videos of tests that passed |
| `'on-first-retry'` | Only record video when a test is being retried for the first time |

**Real-world recommendation:** Use `'retain-on-failure'` — you get video evidence for failures without wasting disk space on passing tests.

**In the report:** Click on any test → a video player appears inline. You can:

- Play the recording at different speeds
- Expand it to full screen
- Download the video file
- Share it in a bug report

---

### 4.3 Trace Files

A **trace** is Playwright's most powerful debugging tool. It records a detailed timeline of every action, DOM snapshot, network request, and screenshot taken during a test — viewable in the interactive Trace Viewer.

| Value | Behaviour |
| --- | --- |
| `'on'` | Always record a trace |
| `'off'` | Never record |
| `'on-first-retry'` | Only record trace when a test is retried for the first time |
| `'on-all-retries'` | Record trace for every retry attempt |
| `'retain-on-failure'` | Record for all tests, delete traces for passing tests |

**Real-world recommendation:** Use `'on-first-retry'` — you get a trace exactly when you need it (something failed and was retried) without generating trace data for every passing test.

**In the report:** Click on a failed test → find the "Retry" section → click "Trace" → the Trace Viewer opens.

> The Trace Viewer will be covered in detail in a separate video. For now: it shows you a step-by-step timeline of everything that happened, with before/after DOM snapshots for each action — like a debugger for your test run.
> 

---

## 5. Retries & How They Appear in the Report

Set in `playwright.config.ts`:

```tsx
retries: process.env.CI ? 2 : 1,
```

**What happens when a test fails:**

1. Playwright marks it as **Failed**.
2. If retries > 0, it **re-runs the test** up to that many times.
3. If it passes on a retry → marked as **Flaky** (not a clean pass, not a full fail).
4. If it keeps failing through all retries → marked as **Failed**.

**In the report:**

- Each retry appears as a **separate tab** inside the test detail view (e.g., "Run 1", "Retry 1").
- Each tab has its own screenshot, video, and trace (depending on your config).
- This lets you see exactly what happened on the original run vs. the retry run.

---

## 6. Where Files Are Saved — Folder Structure

After a run with screenshots, video, and trace enabled, Playwright creates:

```
playwright-report/
  index.html          ← the main HTML report
  data/
    *.png             ← screenshot files
    *.webm            ← video files
  trace/
    *.zip             ← trace files

test-results/
  login-tests-ts-title-verification-chromium/
    test-failed-1.png
    video.webm
    trace.zip
  login-tests-ts-unsuccessful-login-firefox/
    ...
```

**`playwright-report/`** → the HTML report you open in a browser.

**`test-results/`** → raw files organised by test name and browser. Useful for:

- Grabbing a screenshot directly to attach to a bug report.
- Accessing trace/video without opening the HTML report.

**Folder naming convention in `test-results/`:**

```
<file-name>-<test-name>-<browser>/
```

If a retry happened, a suffix is added: `...-retry1/`

---

## 7. Navigating the HTML Report — Feature by Feature

### Search bar

- Type any keyword to filter tests (e.g., `cart` shows only cart-related tests).
- Type a browser name (`chromium`, `firefox`, `webkit`) to filter by browser.
- Click the browser icons to filter by browser without typing.

### Status filters

| Filter | Shows |
| --- | --- |
| All | Every test that ran |
| Passed | Only green/passing tests |
| Failed | Only red/failing tests |
| Flaky | Tests that failed initially but passed on retry |
| Skipped | Tests skipped via annotation |

### Test file grouping

- Tests are grouped by their **spec file name** (e.g., `login-tests.spec.ts`, `cart-verification.spec.ts`).
- Expand a file group to see individual tests, which browser they ran on, and how long they took.

> **Why tests may appear out of order:** With `fullyParallel: true`, tests run simultaneously — so the order in the report reflects completion time, not source order.
> 

### Inside a single test result

Clicking any test opens a detail view showing:

| Section | Content |
| --- | --- |
| Title | Test name, file name, browser, duration |
| Error message | What assertion failed and why (expected vs. received) |
| Steps | Full step-by-step log (fixture setup, actions, assertions) |
| Before/After hooks | Hook steps shown separately (e.g., `beforeEach` login) |
| Screenshot | Embedded inline — downloadable |
| Video | Inline player — downloadable, speed-adjustable |
| Trace | Link to open Trace Viewer — downloadable |
| Retry tabs | "Run 1", "Retry 1", etc. — each with its own artefacts |

---

## 8. Complete `playwright.config.ts` Example (Everything From This Video)

```tsx
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,   // 1 retry locally, 2 on CI
  workers: process.env.CI ? 1 : 3,

  // HTML report with options
  reporter: [
    [
      'html',
      {
        open: 'on-failure',          // auto-open only when tests fail
        outputFolder: 'my-report',   // save to 'my-report/' instead of 'playwright-report/'
      }
    ]
  ],

  use: {
    headless: false,                  // show browser during execution

    // screenshot for every test (use 'only-on-failure' in production)
    screenshot: 'on',

    // keep video only for failed tests
    video: 'retain-on-failure',

    // record trace on the first retry of a failed test
    trace: 'on-first-retry',

    testIdAttribute: 'data-test',
  },

  expect: {
    timeout: 5000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],

});
```

---

## 9. Key CLI Commands for Reports

| Command | What it does |
| --- | --- |
| `npx playwright test` | Run all tests (report generated based on config) |
| `npx playwright test --reporter=html` | Force HTML report for this run only |
| `npx playwright test login-tests.spec.ts` | Run only one test file |
| `npx playwright test --project=firefox` | Run only the Firefox project |
| `npx playwright test --headed` | Show browser during this run |
| `npx playwright show-report` | Open the default HTML report in the browser |
| `npx playwright show-report my-report` | Open a report in a custom output folder |

---

## 10. Screenshot vs. Video vs. Trace — When to Use Each

| Tool | Best for | Recommended setting |
| --- | --- | --- |
| **Screenshot** | Quick visual snapshot of the page at failure point | `'only-on-failure'` |
| **Video** | Replaying the full sequence of actions that led to failure | `'retain-on-failure'` |
| **Trace** | Deep debugging — step-by-step DOM state, network, console | `'on-first-retry'` |

**Rule of thumb:**

- Screenshot → fast to capture, fast to review → use broadly.
- Video → more disk space, richer context → use on failure.
- Trace → most powerful, most data → use only on retry (overkill for every test).

---

## 11. Quick Revision

```
HTML Report
  Generated into: playwright-report/ (default) or custom outputFolder
  Open with:      npx playwright show-report
  Open directly:  playwright-report/index.html

reporter config
  Simple:  reporter: 'html'
  Options: reporter: [['html', { open: 'on-failure', outputFolder: 'my-report' }]]

open values
  'always'      → always opens after run
  'never'       → never opens automatically
  'on-failure'  → opens only when tests fail

screenshot / video / trace (inside use: {})
  'on'                → always capture
  'off'               → never capture
  'only-on-failure'   → only for failed tests (screenshot only)
  'retain-on-failure' → record all, delete passing ones
  'on-first-retry'    → only when test is retried for the first time

retries
  0 → no retry
  1 → one retry on failure
  Flaky = failed on first run, passed on retry

Report filters
  All / Passed / Failed / Flaky / Skipped
  Filter by keyword or browser name in the search bar

Inside a test result
  Steps → full action log
  Screenshot → inline + downloadable
  Video → inline player + downloadable
  Trace → opens Trace Viewer (most powerful debugger)
  Retry tabs → separate artefacts per retry attempt

CLI
  npx playwright test --reporter=html      → one-off HTML report
  npx playwright show-report               → open saved report
  npx playwright show-report custom-folder → open custom folder report
```