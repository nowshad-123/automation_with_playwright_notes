# TypeScript for Automation Testers — Structured Notes

## 1. What is TypeScript & Why Use It

- **TypeScript = JavaScript + Types.** It adds a type-safety layer on top of JavaScript, helping catch errors **during development (compile time)** rather than at runtime.
- JavaScript is flexible; TypeScript is a "safer and smarter" version of JavaScript.
- **Why TypeScript for automation?**
  - Better autocomplete in editors (IntelliSense)
  - Fewer bugs because of type checking
  - Cleaner, more maintainable framework code
  - Most modern automation tools (Playwright, Cypress) recommend TypeScript by default
- **Core idea:** Types define what kind of value a variable can hold, preventing invalid data from being assigned.
- **Golden rule:** If you remove all the type annotations from a TypeScript file, you get plain JavaScript. TypeScript is *not* a new language — it's JavaScript with extra safety.

---

## 2. Prerequisites & Setup

You need three things installed:

1. **Node.js** — required to run JS/TS code outside the browser.
   - Download the latest **LTS (Long Term Support)** version from the official Node.js site.
   - Choose the installer matching your OS (Windows/Mac/Linux) and architecture (usually 64-bit).
   - Run the installer, accept defaults, allow any permission prompts, and finish.

2. **VS Code** — code editor used to write, manage, and debug TypeScript (and later Playwright/Cypress) code.
   - Download from the official VS Code site, choose your OS version, install with default options.
   - Provides syntax highlighting and autocomplete, unlike Notepad.

3. **TypeScript compiler** — installed globally via npm:
   ```
   npm install -g typescript
   ```
   - The `-g` flag installs it globally so it's available across all projects.
   - TypeScript files **cannot run directly** — they must first be **compiled (transpiled)** into JavaScript, and then the JavaScript is executed.

### Workflow to run a `.ts` file
1. Create a folder (e.g., "TypeScript Tutorial") and open it in VS Code.
2. Create a file with `.ts` extension (e.g., `practice.ts`).
3. Compile it to JavaScript:
   ```
   tsc practice.ts
   ```
   This generates `practice.js` (same code, without types).
4. Run the JavaScript file:
   ```
   node practice.js
   ```

### Combined command (compile + run in one go)
- **Bash / CMD terminal:**
  ```
  tsc practice.ts && node practice.js
  ```
- **PowerShell terminal:** `&&` is NOT supported — use `;` instead:
  ```
  tsc practice.ts; node practice.js
  ```

---

## 3. Variables (`let` vs `const`)

- Use `const` when the value will **never change** after assignment.
- Use `let` when the value **might change** later.
- **Naming convention:** camelCase is recommended (not mandatory) — e.g., `nameValue`, `userUrl`.

### Syntax with types
```ts
const nameValue: string = "Vision";
console.log(nameValue);
```
- Format: `let/const variableName: type = value;`

### Key behavior differences
- **`const`**: must be initialized (assigned a value) at the moment of declaration. You cannot declare a `const` and assign its value later — this causes an error ("const declarations must be initialized").
- **`let`**: can be **declared first** and **assigned later**:
  ```ts
  let a: number;
  a = 20; // valid
  ```
- Trying to reassign a `const` variable produces: *"Cannot assign to 'x' because it is a constant."*

---

## 4. Data Types

TypeScript's main data types: **string, number, boolean, array, tuple, object, any**.

### 4.1 String
- Stores text values (names, URLs, etc.)
- Can use **single quotes**, **double quotes**, or **backticks** — all behave the same for a plain string.
```ts
let course: string = 'TypeScript';
let course2: string = "TypeScript";
let course3: string = `TypeScript`;
```

#### String concatenation
- **Single/double quotes:** use `+` to join strings/variables:
  ```ts
  let name1: string = 'Vision';
  let description: string = name1 + ' is best';
  ```
- **Backticks (template literals):** use `${variableName}` placeholders — no `+` needed:
  ```ts
  let name3: string = `Vision`;
  let description3: string = `${name3} is best`;
  ```
  - Multiple variables can be embedded: `` `${var1} is ${var2}` ``
  - Template literals are generally preferred for readability when combining variables and text.

### 4.2 Number
- Stores numeric values (count, age, timeout, etc.)
- No quotes needed.
```ts
let count: number = 9;
```
- Assigning a string to a `number` variable causes a compile-time error: *"Type 'string' is not assignable to type 'number'."*
- TypeScript can **infer** the type even without an explicit annotation — once a variable is initialized with a number, assigning a string later still throws an error.

### 4.3 Boolean
- Stores `true` or `false` (used for flags/validations like `isVisible`, `isLoggedIn`).
```ts
let isVisible: boolean = true;
```
- Must use the literal keywords `true`/`false` — not strings like `"true"`, and not numbers.

### 4.4 The `any` Type
- Removes type restriction — a variable typed `any` can hold a string, number, boolean, object, etc.
```ts
let num1: any = 20;
num1 = "hello"; // allowed
num1 = true;    // allowed
```
- Behaves like plain JavaScript. Use sparingly — defeats the purpose of TypeScript's type safety. Prefer specific types when possible.

### 4.5 Arrays
- Store multiple values of the **same type**.
```ts
let users: string[] = ['Ram', 'Vinit', 'Sam'];
```
- **Indexing** starts at `0`. To access a value: `users[0]` → `'Ram'`, `users[1]` → `'Vinit'`.
- Assigning a value of a different type (e.g., a number into a `string[]`) causes an error.

#### Alternative array syntax (generic style)
```ts
let numArray: Array<number> = [47, 99, 101];
```
- Same behavior as `number[]`, just different syntax. Both are valid and you may encounter either.

### 4.6 Tuples
- An array that stores **multiple values of different types** in fixed positions.
```ts
let marks: any[] = ["Math", 45, "Art", 75, true];
```
- Access by index, same as arrays: `marks[2]` → `"Art"`, `marks[4]` → `true`.
- Common in Playwright-style configurations.

### 4.7 Objects
- Group related data together with key-value pairs, and TypeScript lets you define the **structure (shape)** of the object.
```ts
let userDetails: { username: string; password: string; age: number } = {
  username: 'Vinit',
  password: 'pass123',
  age: 20
};
```
- The type definition (before `=`) specifies which keys must exist and what type each value must be.
- If a required key is missing or has the wrong type → compile-time error (e.g., *"Property 'age' is missing in type..."*).
- **Accessing values:** dot notation — `userDetails.age`, `userDetails.password`.
- Defining the type inline like this gets messy with many keys → solved by **interfaces** or **type aliases** (see sections 8 & 9).

---

## 5. Functions

Functions hold reusable blocks of code. In TypeScript, you can specify types for **parameters** (inputs) and the **return value** (output).

### 5.1 Traditional Function Syntax
```ts
function sayHello(): void {
  console.log("Hello");
}
sayHello(); // must call it to execute
```
- `: void` means the function returns nothing.

### 5.2 Arrow Function Syntax (modern style — common in Playwright/Cypress)
```ts
const sayHello2 = (): void => {
  console.log("Hello 2");
};
sayHello2();
```

### 5.3 Functions with Parameters
- **Parameters** = variables defined in the function signature.
- **Arguments** = actual values passed when calling the function.
```ts
const add = (num1: number, num2: number): void => {
  console.log(num1 + num2);
};
add(5, 7); // prints 12
```

### 5.4 Return Types
- Specify what type of value the function gives back (`number`, `string`, `boolean`, `object`, `array`, etc.)
```ts
const addTwo = (num1: number, num2: number): number => {
  return num1 + num2;
};
const addition = addTwo(30, 50); // addition = 80
```
- Returning a value of the wrong type (e.g., a string when `: number` is declared) causes a compile-time error.
- If a function is declared `: void` but you try to `return` a value, TypeScript flags it as an error — this is the safety benefit over plain JavaScript.

### 5.5 Optional Parameters
- Mark a parameter as optional using `?` before the type — the function can then be called **without** providing that argument.
```ts
function greet(name?: string): void {
  console.log(`Hi ${name}`);
}
greet("Vinit"); // "Hi Vinit"
greet();        // "Hi undefined"
```
- Without `?`, omitting the argument causes an error.
- Very common pattern in automation libraries — seeing `param?: type` in a method signature means that argument is optional.

---

## 6. Arithmetic Operators

Same behavior as JavaScript — no TypeScript-specific differences.

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | Addition | `5 + 8` | `13` |
| `-` | Subtraction | `100 - 70` | `30` |
| `*` | Multiplication | `5 * 4` | `20` |
| `/` | Division | `10 / 2` | `5` (or `3.33...` for `10/3`) |
| `%` | Modulus (remainder) | `10 % 3` | `1` |

---

## 7. Comparison Operators

Used to compare values; always return `true` or `false`. Work the same on numbers, strings, etc.

| Operator | Meaning |
|---|---|
| `===` | Equal to |
| `!==` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |

Example:
```ts
let a: number = 3;
let b: number = 9;
console.log(a === b);  // false
console.log(a !== b);  // true
console.log(a < b);    // true
console.log(a >= b);   // false
```
- Works identically for strings: `val1 === val2`.

---

## 8. Logical Operators

Used to combine multiple conditions; commonly used in `if` statements and validations.

| Operator | Symbol | Behavior |
|---|---|---|
| AND | `&&` | `true` only if **both** conditions are true |
| OR | `\|\|` | `true` if **at least one** condition is true |
| NOT | `!` | **Reverses** the result (`true` ↔ `false`) |

Example:
```ts
let age: number = 28;
let isLoggedIn: boolean = true;

console.log(age >= 18 && isLoggedIn); // AND
console.log(age >= 18 || isLoggedIn); // OR
console.log(!(age >= 18));            // NOT
```

---

## 9. Conditions (if / else / else if)

Same syntax as JavaScript.

```ts
let age: number = 18;

if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
```

### Multiple conditions with `else if`
```ts
const a: number = 3;
const b: number = 5;

if (a === b) {
  console.log("a is equal to b");
} else if (a > b) {
  console.log("a is greater");
} else if (b > a) {
  console.log("b is greater");
} else {
  console.log("Invalid number");
}
```
- Conditions are checked **top to bottom**; once one is true, the rest are skipped.
- The final `else` (no condition) runs only if none of the above conditions matched.

---

## 10. Loops

### 10.1 `for` Loop
Used to repeat code a set number of times. Has three parts: **initialization; condition; increment/decrement**.

```ts
for (let i = 0; i <= 10; i++) {
  console.log(i); // prints numbers 0 through 10
}
```
- The loop variable (`i`) doesn't have to be used inside the loop body — it can just control how many times the loop runs:
```ts
for (let i = 1; i <= 10; i++) {
  console.log("Vision Infinite"); // prints 10 times
}
```

### 10.2 `for...of` Loop (iterating arrays)
Used to loop through **each value** in an array directly (no index needed).

```ts
let users: string[] = ['Ram', 'Vinit', 'Tom', 'Sam'];

for (const user of users) {
  console.log(user); // prints each name one by one
}
```
- The temporary variable (`user`) can be named anything, but should be meaningful.
- Very useful for processing arrays of test data, locators, etc.

---

## 11. Async / Await

- Used for tasks that **take time to complete** (e.g., waiting for a page element, an API response).
- Behavior is **identical to JavaScript** — TypeScript just adds the ability to type the return value.
- **Rule:**
  - Use `await` in front of any operation you need to "wait for" before moving to the next line.
  - Any function/method that contains an `await` must be marked as `async`.
- **Conceptual analogy:** A function that returns a "promise" is like someone promising to complete a task — `await` means "wait here until that promise is fulfilled before continuing."
- Forgetting `await` is a very common bug and can cause confusing errors — especially in Playwright/Cypress where most actions are asynchronous.

---

## 12. Interfaces

- Interfaces define the **structure/shape of an object** — what keys it has and what type each value must be.
- Makes object-typing **cleaner and reusable** compared to writing the type inline every time.
- **Naming convention:** PascalCase (every word capitalized, e.g., `UserDetails`, `LoginPage`).

```ts
interface User {
  username: string;
  password: string;
  age: number;
}

let userDetails: User = {
  username: 'Vinit',
  password: 'pass123',
  age: 25
};

console.log(userDetails.username);
```
- Compare to writing the type inline (`{ username: string; password: string; age: number }`) — interfaces avoid repeating this structure and keep code readable, especially with many fields.
- Very commonly used for **test data models** in automation frameworks.

---

## 13. Type Aliases (`type`)

- An **alternative to interfaces** for defining a custom data structure. Functionally very similar.

```ts
type User = {
  username: string;
  password: string;
  age: number;
};

let userDetails: User = {
  username: 'Vinit',
  password: 'pass123',
  age: 35
};
```
- Both `interface` and `type` are widely used — neither is "wrong." Be comfortable reading both.

### Restricting a variable to specific allowed values (Union types)
`type` is especially useful for creating a fixed set of allowed string values:
```ts
type Status = "Pass" | "Fail" | "Skip";

let testStatus: Status = "Pass"; // only "Pass", "Fail", or "Skip" allowed
```
- Assigning any other value (e.g., `"Test"`) causes a compile-time error, and the editor will suggest valid options.
- TypeScript is **case-sensitive** — `"skip"` ≠ `"Skip"`.
- This pattern is common in configuration files (e.g., Playwright config options).

---

## 14. Classes

- Classes **group related data (properties) and behavior (methods)** together — central to building automation frameworks (e.g., Page Object Model).
- Syntax is very similar to JavaScript, with added type annotations.
- **Naming convention:** PascalCase (e.g., `LoginPage`).

```ts
class LoginPage {
  login(): void {
    console.log("login called");
  }
}
```

### 14.1 Methods
- A **method** is simply a function defined inside a class (no `function` keyword needed).
- Can have a return type (`void`, `string`, `number`, etc.) just like regular functions.

### 14.2 Properties
- Variables declared inside a class (without `let`/`const`), with an optional type.
```ts
class LoginPage {
  nameValue: string;
  company: string;
}
```
- If not initialized immediately, TypeScript requires them to be initialized in the **constructor** — otherwise it shows: *"Property has no initializer and is not definitely assigned in the constructor."*

### 14.3 Objects & Method Calling
- To use a class's methods/properties, you must create an **object (instance)** of the class using `new`:
```ts
const loginPageObj = new LoginPage();
loginPageObj.login(); // calls the method via dot notation
```
- Don't confuse this "object" (an instance of a class) with the earlier "object" data type (key-value pairs) — they're different concepts that share the term "object."

### 14.4 Constructors
- The **constructor** runs **automatically** when an object is created — used to initialize property values.
- Every class has a default (empty) constructor unless you define your own.
- Constructor parameters can have types, just like function parameters.

```ts
class LoginPage {
  nameValue: string;
  company: string;

  constructor(nameValue: string) {
    this.nameValue = nameValue; // assign parameter to property
    this.company = "YouTube";   // direct assignment
    console.log("inside LoginPage constructor");
  }

  login(): void {
    console.log("login called");
  }
}

const loginPageObj = new LoginPage("Vinit"); // must pass argument matching constructor
console.log(loginPageObj.nameValue); // "Vinit"
console.log(loginPageObj.company);   // "YouTube"
```
- **Key point:** Once you define a custom constructor with required parameters, you **must** provide matching arguments when creating the object — the default (parameterless) constructor is no longer available.
- `this.propertyName` refers to the class's own property; the parameter name and property name are often the same, but they are distinct (parameter vs. property).
- Any code inside the constructor (e.g., a `console.log`) runs immediately when the object is created.

---

## 15. Import & Export

- Used to **split code across multiple files** for better organization (every real automation project uses multiple files).
- Behavior matches JavaScript.

### Exporting
```ts
// file1.ts
export class LoginPage {
  login(): void {
    console.log("login called");
  }
}
```

### Importing (named export)
```ts
// file2.ts
import { LoginPage } from "./file1";

const obj = new LoginPage();
obj.login();
```
- Note the curly braces `{ }` around the class name — required for **named exports**.

### Default export
```ts
// file1.ts
export default class LoginPage { ... }
```
```ts
// file2.ts
import LoginPage from "./file1"; // no curly braces for default export
```
- **Rule of thumb:**
  - Curly braces in the import → it's a **named export**.
  - No curly braces → it was exported as **default**.
- Import/export is used constantly in Playwright/Cypress (importing Page Object classes, test data, fixtures, etc.).

---

## 16. Statement Termination (Semicolons)

- Semicolons (`;`) at the end of statements are **optional** in both JavaScript and TypeScript.
- **Best practice:** Be **consistent** — either use semicolons everywhere or omit them everywhere across your codebase.
- Note: In Java, semicolons are mandatory — this is a key difference if coming from a Java background.

---

## 17. TypeScript vs. JavaScript — Quick Summary

- **TypeScript is not a separate language** — it's JavaScript **plus** an optional type system.
- Remove all type annotations (`: string`, `: number`, interfaces, types, etc.) → you get plain, valid JavaScript.
- Benefits of keeping the types:
  - Errors caught **at compile time**, before running the code.
  - Better autocomplete/IntelliSense in the editor.
  - Safer, more maintainable automation frameworks.
- Recommended learning path: understand JavaScript fundamentals first, then layer TypeScript's type annotations on top — the concepts map directly.

---

## Quick Reference Cheat-Sheet

| Concept | Syntax Example |
|---|---|
| Variable with type | `let age: number = 25;` |
| String (template literal) | `` `Hello ${name}` `` |
| Array of strings | `let names: string[] = ["a","b"];` |
| Tuple-like (mixed types) | `let data: any[] = ["a", 1, true];` |
| Object with type | `let user: {name: string} = {name: "x"};` |
| Arrow function | `const fn = (a: number): number => a + 1;` |
| Optional parameter | `function greet(name?: string) {}` |
| Interface | `interface User { name: string; }` |
| Type alias | `type User = { name: string };` |
| Union type | `type Status = "Pass" \| "Fail";` |
| Class with constructor | `class A { constructor(x: string) { this.x = x; } }` |
| Named export/import | `export class A {}` / `import { A } from "./file";` |
| Default export/import | `export default class A {}` / `import A from "./file";` |
| for loop | `for (let i=0; i<=10; i++) {}` |
| for...of loop | `for (const item of arr) {}` |