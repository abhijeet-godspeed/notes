# gs-test-scaffolding

This tool scaffolds TypeScript test stubs for every event defined in a Godspeed project. It sets up the project with a complete chai-mocha testing environment including test files, helper utilities, scripts, and configurations — all in one go.

---

## Prerequisites

- `mocha`
- `chai`
- `@types/mocha`
- `@types/chai`

---

## Installation

will be updated once the tool is published

---

## Description

gs-test-scaffolding automates the creation of test environments for Godspeed projects. It reads all `.yaml` event definitions in `src/events`, creates corresponding Mocha test files, and injects boilerplate code that integrates seamlessly with Godspeed's `GSContext`. This allows developers to immediately start writing meaningful test cases without having to set up the scaffolding manually or the LLM(Sarthi) can fill this auto generated boiler plate with mocha tests

---

## What this tool does


* **Folder structure it generates**

  ```
  test/
  ├── eventHandlers/
  │   └── <event>.test.ts      # per-YAML event test
  ├── helpers/
  │   ├── makeContext.ts
  │   └── makeEvent.ts
  └── hooks/
      └── globalSetup.ts
  ```
Here's a detailed breakdown of what the tool does — broken into **features**, **function roles**, and a **complete step-by-step workflow** of how it works:

---

### Adds Useful Test Scripts to `package.json`

**Function:** `addScriptsToPackageJson('.', newPackageJsonScripts);`

**What it does:**

* Adds or merges the following testing scripts to package.json file:
- `build:test`
- `test`
- `test:single`

---

### Feature 2: Excludes Test Folder from TypeScript Compilation

**Function:** `excludeTestFromTsconfig();`

**What it does:**

* Opens or creates `tsconfig.json`.
* Ensures `"./test"` is listed in the `exclude` array.
* Prevents test files from being included in the main app’s TypeScript compilation.
---

### Feature 3: Writes Helper & Config Files for Testing

**Object:** `newFilesToWrite`

**What it does:**

* Creates the following boilerplate files needed to support Mocha testing in Godspeed:

  ```txt
  ./test/hooks/globalSetup.ts         # Bootstraps the Godspeed app for all tests
  ./test/helpers/makeContext.ts       # Constructs a GSContext with dummy data
  ./test/helpers/makeEvent.ts         # Creates a minimal GSCloudEvent
  ./tsconfig.test.json                # A TypeScript config specific to tests
  ./mocha.config.js                   # Configures Mocha to load global setup
  ./src/index.ts                      # Loads Godspeed app 
  ```
---

### Feature 4: Scaffolds Test Files for All Event YAMLs

**Function:** `scaffoldEventTests();`

**What it does:**

* Recursively scans the `src/events/` folder for `.yaml` files.
* For each event YAML, creates a test file at `test/eventHandlers/<event>.test.ts`.
* Auto-fills the test file with:

  * Imports for `makeContext`, `GSStatus`, `getGSApp`
  * A `describe()` block for the event
  * An `it()` block scaffolded for the developer to write test cases
  * It creates a test boiler plate which a developer can fill or an LLM can auto write the tests. 
> ⚠️ Existing test files are not overwritten.

---

## Step-by-Step Workflow

Here is the full workflow performed by `gs-test-scaffolding`:

1. **Project Validation**

   * Calls `isGodspeedProject()`
   * Ensures `.godspeed` file exists in project root

2. **Write Required Support Files**

   * Uses `newFilesToWrite` + `writeCodeToFile()` to create:

     * Mocha setup scripts
     * Godspeed bootstrapping files
     * TypeScript and Mocha configs

3. **Add Mocha Scripts to `package.json`**

   * Uses `addScriptsToPackageJson()`
   * Appends `build:test`, `test`, and `test:single` commands

4. **Scaffold Test Files for All Events**

   * Uses `scaffoldEventTests()`
   * Walks through each `.yaml` in `src/events/`
   * For each, creates a test file in `test/eventHandlers/`
   * Each test imports required context and includes a sample test case

5. **Update Main TypeScript Config**

   * Uses `excludeTestFromTsconfig()`
   * Adds `"./test"` to `exclude` in `tsconfig.json` to isolate test compilation

---

This complete workflow allows developers to go from **zero tests** to a **ready-to-run test suite** for all event handlers in a Godspeed project with just one CLI command.

* **How it handles errors**

  * If the `.godspeed` file is missing, it throws a clear validation error.
  * Existing test files are skipped to prevent overwriting.
  * Automatically installs `@types/mocha` if not present.

* **What outputs (logs or responses) it produces**
  * CLI logs for each scaffolded file (e.g., `✅ Wrote: test/eventHandlers/hello.test.ts`)
  * Final message confirming successful setup.

* **Side effects**

  * Creates Mocha-compatible test files for each event.
  * Adds test scripts to `package.json`.
  * Writes:

    * `tsconfig.test.json`
    * `mocha.config.js`
    * Test helper files (`makeContext`, `makeEvent`, `globalSetup`)
  * Updates `tsconfig.json` to exclude `./test`

---

## What this tool does NOT do

* It only generates scaffolding for testcases and creates a boiler plate for each .ts function, rest testcases need to be manually written or can be generated using LLM (using custom mode of sarthi)

---

## Future Enhancements

* `/src/index.ts` is currently overwritten with test-compatible bootstrapping logic.
  ➤ A better approach could be to generate a separate entry file (e.g., `src/index.test.ts`) specifically for the testing environment to avoid modifying the main application entry.
---
