### Task 2: Write Tasks Document

Trigger: When assigned to create docs/test/unit/tasks.md

Instructions:

Output Location: docs/test/tasks.md

In this prompt, i want you to fill these instructions -

iterate through each file in src/events directory. for each file:
add this on the document
```
## full event file path (example: `src/events/someFolder/anotherFolder/something.yaml`)
- **test strategy path:** `docs/test/unit/test-strategy/event-handlers/someFolder/anotherFolder/something.md`
- **test strategy status:** **Pending**
- **test file path**: `test/unit/event-handlers/someFolder/anotherFolder/something.md`
- **test file status:** **Pending**
```
