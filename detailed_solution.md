# 🧪 Godspeed Test Case Scaffolding: Component-wise Workflows

---

## 🔁 1. **Workflows (`src/functions/*.yaml`)**

### 🔍 Discovery

* Scan `src/functions/` for all `.yaml` files.
* Parse each workflow to extract:

  * `id`, `tasks`, and associated `fn` values.
  * Inputs via `args`, outputs via task chaining.

### 🏗 Scaffolding Generation

* For each workflow:

  * Create test file at: `tests/functions/<workflow_id>.test.ts`
  * Include test cases for:

    * Normal flow.
    * Missing required inputs.
    * Failing inner tasks (placeholder).
    * Return value checks from `ctx.outputs.<taskId>`.

### 🧪 Test File Skeleton

```ts
describe("Workflow: <workflow_id>", () => {
  it("should complete all tasks successfully", async () => {
    // Load workflow and GSContext
    const ctx = mockContext({ ... });
    const inputs = { body: { ... }, query: {} };

    const result = await runWorkflow("<workflow_id>", ctx, inputs);

    expect(result.code).toBe(200); // placeholder
  });
});
```

---

## ⚙️ 2. **Functions (`src/functions/*.ts`)**

### 🔍 Discovery

* Traverse `src/functions/` for `.ts` files that export default functions.

### 🏗 Scaffolding Generation

* Create test file: `tests/functions/<function_name>.test.ts`
* Mock:

  * `GSContext` with dummy datasources, functions, and mappings.
  * `args` from YAML workflows if possible.

### 🧪 Test File Skeleton

```ts
describe("Function: <function_name>", () => {
  it("should handle valid input", async () => {
    const ctx = mockContext();
    const args = { key: "value" };

    const result = await <function_name>(ctx, args);

    expect(result.success).toBe(true);
  });
});
```

---

## 🌐 3. **Events (`src/events/*.yaml`)**

### 🔍 Discovery

* Traverse `src/events/` for `.yaml` files.
* Extract:

  * HTTP method and path (for HTTP events).
  * `fn` target (links to a workflow or native function).
  * `params`, `body`, and `responses`.

### 🏗 Scaffolding Generation

* Create test file: `tests/events/<event_id>.test.ts`
* Mock event (e.g., HTTP POST) using supertest or raw function invocation.
* Use extracted schema to generate sample request body.

### 🧪 Test File Skeleton

```ts
describe("Event: POST /helloworld", () => {
  it("should return 200 with valid body", async () => {
    const res = await request(app)
      .post("/helloworld")
      .send({ name: "Alice" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});
```

---

## 🔧 4. **Utility Functions (`src/plugins/*.ts` or `src/utils/*.ts`)**

### 🔍 Discovery

* Look for pure functions outside of event/workflow handlers.

### 🏗 Scaffolding Generation

* Create test file at: `tests/utils/<filename>.test.ts`
* Include:

  * Default test case calling the utility with dummy inputs.
  * Placeholder for edge cases.

### 🧪 Test File Skeleton

```ts
describe("Util: formatDate", () => {
  it("should return ISO string", () => {
    const result = formatDate(new Date("2023-01-01"));
    expect(result).toMatch(/2023-01-01/);
  });
});
```

---

## 📡 5. **Datasources (`src/datasources/*.yaml`)**

### 🔍 Discovery

* Traverse `src/datasources/`, extract `.yaml` files.
* Resolve `type` (e.g., `axios`, `aws`) and methods exposed via workflow usage.

### 🏗 Scaffolding Generation

* Create test file: `tests/datasources/<ds_name>.test.ts`
* Include:

  * Mock client with stubbed responses.
  * Tests for `execute(ctx, args)` using `meta`.

### 🧪 Test File Skeleton

```ts
describe("Datasource: api", () => {
  it("should return expected response for GET /endpoint", async () => {
    const ctx = mockContext();
    const ds = datasources.api;

    const result = await ds.execute(ctx, {
      meta: { fnNameInWorkflow: "datasource.api.get./endpoint" },
      params: {}
    });

    expect(result.code).toBe(200);
  });
});
```

---

## 📑 6. **Event Schemas (Validation) (`src/events/*.yaml`)**

### 🔍 Discovery

* For each event YAML, extract:

  * Schema definitions from `params`, `body`, and `responses`.

### 🏗 Scaffolding Generation

* Create test file: `tests/events/validation/<event_name>.schema.test.ts`
* Use AJV to validate:

  * Correct schemas.
  * Failures on missing or invalid values.

### 🧪 Test File Skeleton

```ts
describe("Event Schema: POST /helloworld", () => {
  it("should fail when body.name is missing", () => {
    const result = validateEvent(eventDef, "http.post./helloworld");
    expect(result).toBe(false);
  });
});
```

---

## 🔄 Mock Context Generator (shared)

All test files can use:

```ts
import { GSContext } from "@godspeedsystems/core";

export function mockContext(overrides = {}): GSContext {
  return {
    logger: console,
    childLogger: console,
    outputs: {},
    datasources: {},
    functions: {},
    mappings: {},
    inputs: { data: {} },
    ...overrides
  } as unknown as GSContext;
}
```
