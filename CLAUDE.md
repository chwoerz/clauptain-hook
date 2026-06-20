# Code Style

- Prefer `const` over `let`. If a variable needs reassignment, extract the logic into a function and use `return` instead.
- Extract repeated property accesses into `const` variables. If you use `x.foo` more than once, pull it into `const foo = x.foo` (or destructure) and reuse the variable.
- Prefer `map`, `filter`, `flatMap` over `for` loops. Use `for...of` only when the loop has side effects or early exits. Do not use `reduce` — it's unreadable.
- Format with prettier (`npm run format`).
- When the public API changes, always update: (1) the README, (2) the site UI — landing page code snippets, scenario hook code, playground starter code, sandbox service, settings-generator service and their tests. All three must stay in sync.
- When hook or tool-input types change, run `npm run generate-monaco-dts` to regenerate `site/src/app/components/playground/editor/generated-dts.ts`.

# Config API

The public API is `defineHandler` only — there is no `defineHooks`. Config files export handlers as named exports; the compiler auto-collects them by their `__event` field. No default export is needed.

```ts
import { defineHandler } from "clauptain-hook"

export const blockRm = defineHandler("PreToolUse", { matcher: "Bash" }, async (input) => {
  // ...
})
```

Use this documentation: https://code.claude.com/docs/en/hooks
