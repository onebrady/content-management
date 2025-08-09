# Next.js TypeScript LSP Tune-Up (for Agentic Coding)

**Goal:** Give the AI agent (Cursor + Serena + Context7) a clean, high-signal view of the codebase so it can make correct edits, refactors, and tests with fewer tokens.

## Why this change helps

- **Better decisions:** LSP becomes the AI’s “eyes.” Clean, strict types → fewer hallucinated edits.
- **Fewer tokens:** Agent queries the LSP/Serena/Context7 for *precise* context instead of stuffing code into prompts.
- **Safer refactors:** Stricter flags catch silent bugs (optionals, index signatures, overrides) before the AI spreads them.
- **Faster iteration:** Separate test tsconfig prevents test/globals noise from polluting app types.

---

## 1) Replace `tsconfig.json` (root)

Use this exact config. It’s safe for Next 15 + TS ≥ 5.2.

```json
{
  "extends": "next/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },

    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,

    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx", "tests/**"]
}
```

**Notes for the agent:**

- `verbatimModuleSyntax` avoids fake default imports. If CJS libs complain, switch to `import * as pkg from 'lib'`.
- These flags may surface **new type errors**. Fixing them increases edit accuracy and reduces back-and-forth.

---

## 2) Add `tsconfig.test.json` (root)

Keeps test types isolated so app types stay pristine.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["jest", "@testing-library/jest-dom", "node", "playwright"]
  },
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "playwright.config.ts"
  ]
}
```

---

## 3) Keep `jest.config.js` (using `next/jest`)

`next/jest` transpiles with SWC and doesn’t read tsconfig for transforms. We do a **separate test type-check**. Use this config (merge with your current one if needed):

```js
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose$': '<rootDir>/src/__mocks__/jose.js',
    '^openid-client$': '<rootDir>/src/__mocks__/openid-client.js',
    '^@panva/hkdf$': '<rootDir>/src/__mocks__/hkdf.js',
    '^preact-render-to-string$': '<rootDir>/src/__mocks__/preact-render-to-string.js',
    '^preact$': '<rootDir>/src/__mocks__/preact.js',
    '^@auth/prisma-adapter$': '<rootDir>/src/__mocks__/@auth/prisma-adapter.js',
    '^next-auth$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next-auth/next$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next$': '<rootDir>/src/__mocks__/next.js',
    '^next/server$': '<rootDir>/src/__mocks__/next.js'
  },
  transformIgnorePatterns: ['node_modules/(?!(next-auth|@next-auth)/)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_*.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: { branches: 5, functions: 5, lines: 10, statements: 10 }
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/']
};

module.exports = createJestConfig(customJestConfig);
```

**Add script for test type-checking:**

```json
// package.json -> scripts
"type-check:test": "tsc -p tsconfig.test.json --noEmit"
```

---

## 4) What the agent should run (verification)

```bash
# keep Prisma types fresh for the LSP
npx prisma generate

# app types – must be clean
npm run type-check

# test types – must be clean
npm run type-check:test

# jest runs without transform/type issues
npm test --silent

# playwright is discoverable
npx playwright test --list
```

**Manual IDE sanity (60 seconds):**

- Go-to-definition on an imported hook lands on **source** (not `.d.ts`).
- Rename a prop in a component → **all consumers update**.
- Start typing `@/` import → auto-import prefers alias.
- If `verbatimModuleSyntax` errors on a CJS lib, fix import to `import * as x from 'lib'`.

---

## 5) What to tell the AI agent (intent + constraints)

- **Intent:** “Tune TypeScript LSP for maximal semantic accuracy and minimal token usage. Enforce strict typing to improve refactor safety. Isolate test types.”
- **Constraints/Rules:**
  - Use the exact `tsconfig.json` above.
  - Add `tsconfig.test.json` and the `type-check:test` script.
  - Keep `next/jest`; don’t replace with `ts-jest` transforms.
  - Always run `prisma generate` before type-checks.
  - If strict flags surface errors, **fix code**, don’t relax flags (unless explicitly approved).
  - Prefer `import * as pkg` for CJS libs when `verbatimModuleSyntax` complains.
- **Success Criteria:**
  - `npm run type-check` and `npm run type-check:test` pass.
  - Jest and Playwright commands above succeed.
  - IDE symbol nav/rename works across the project.
  - No recurring TS server log errors about project resolution or missing modules.

---

## Result you should expect

- Serena/Context7 rely on a **clean, strict** project graph → better edits, fewer misses.
- Reduced prompt size because the agent can query precise symbol locations/types instead of reading whole files.
- Safer refactors and fewer runtime “surprises” due to strict optionals/index signatures/overrides being enforced at compile-time.

