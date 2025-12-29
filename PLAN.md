# Plan

## Phase 0: Project Setup

- [x] Initialize `package.json` with pnpm scripts and VS Code test dependencies.
- [x] Add `tsconfig.json` and TypeScript source layout.
- [x] Add baseline VS Code test harness.

## Phase 1: Discovery

- [x] Review README and existing extension structure to understand current capabilities and entry points.
- [x] Identify where pikchr rendering and preview integration should live.

## Phase 2: Implementation

- [ ] Add or update extension logic to invoke `pikchr-cmd` for `.pikchr` files and embedded Markdown blocks.
- [ ] Wire preview rendering to VS Code APIs with appropriate error handling.

## Phase 3: Syntax Highlighting

- [ ] Add TextMate grammar and language configuration for Pikchr.
- [ ] Register the language and associate `.pikchr` files with it.
- [ ] Use `../reference/pikchr/doc/grammar.md` as a reference for the grammar implementation.

## Phase 4: Tests and Documentation

- [ ] Add or adjust tests for new behavior.
- [ ] Update README or related docs to reflect changes and usage.
