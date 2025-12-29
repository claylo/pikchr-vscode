# Plan

## Phase 0: Project Setup

- [x] Initialize `package.json` with pnpm scripts and VS Code test dependencies.
- [x] Add `tsconfig.json` and TypeScript source layout.
- [x] Add baseline VS Code test harness.

## Phase 1: Discovery

- [x] Review README and existing extension structure to understand current capabilities and entry points.
- [x] Identify where pikchr rendering and preview integration should live.

## Phase 2: Implementation

- [x] Add or update extension logic to invoke `pikchr-cmd` for `.pikchr` files and embedded Markdown blocks.
- [x] Wire preview rendering to VS Code APIs with appropriate error handling.
- [x] Add appropriate "contributes" section to `package.json` to register the extension's capabilities with VS Code.
- [x] Add tests for extension logic and preview rendering.
- [x] Add .github/workflows/ci.yml for continuous integration.

## Phase 3: Syntax Highlighting

- [x] Add TextMate grammar and language configuration for Pikchr.
- [x] Register the language and associate `.pikchr` files with it.
- [x] Create comprehensive grammar covering objects, keywords, attributes, colors, and more.
