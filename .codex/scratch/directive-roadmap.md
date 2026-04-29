# Directive Roadmap

## Phase 1 - Directive Foundation And Regression Hardening

- Introduce a central directive registry and shared directive types.
- Keep directive definitions modular and discoverable under `src/directives/definitions`.
- Preserve existing layout directive behavior for `:::section`, `:::2col`, `:::3col`, and `:::cell`.
- Strengthen integration tests around parser behavior, nesting, unknown markers, unterminated markers, code fences, and style overrides.
- Strengthen e2e coverage around frontend rendering semantics in the dev app.
- Seed `.codex` repo context for future agent runs.

## Phase 2 - Simple Static Directives

- Add `:::callout`.
- Add `:::details`.
- Add directive snippets/autocomplete powered by registry metadata.
- Add basic directive diagnostics for unsupported names and malformed structures.

## Phase 3 - Docs-Mode Directives

- Add `:::toc`.
- Add heading anchors.
- Add `:::steps`.
- Add code block metadata for titles, copy labels, and line highlights.

## Phase 4 - Rich Layout Directives

- Add `:::cards` and `:::card`.
- Evaluate whether `:::tabs` belongs in this plugin surface or needs a stricter content model first.
- Add stronger attribute validation.
- Add richer editor diagnostics for invalid nesting and missing required child directives.

## Phase 5 - Optional Authoring Intelligence

- Add AI rewrite, continue, and edit commands only after the directive model is stable.
- Use a patch-proposal flow instead of silent content mutation.
- Define a custom endpoint/provider contract.
- Avoid provider lock-in.
