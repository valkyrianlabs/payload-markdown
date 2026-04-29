# Phase 1 Notes

## Scope

This phase prepares the existing directive system for future expansion without adding the planned directive pack.

Implemented foundation work:

- Added `src/directives` as the internal source of truth for supported layout directives.
- Moved existing directive metadata and HAST class behavior into dedicated directive definition modules.
- Rewired remark lifting, layout compilation, mdast render metadata, and rehype class application through the registry.
- Added a small attribute parser utility for future directives. Attributed layout marker lines are intentionally not enabled yet, preserving the existing exact-marker public behavior.
- Added `:::cell` to the line-token compiler because the renderer already had a cell directive path and the expansion directive identifies it as existing directive surface.

## Preserved Behavior

- `:::section`, `:::2col`, and `:::3col` still use exact marker lines.
- `:::end`, `:::endsection`, `:::endcol`, and `:::` retain their existing close semantics.
- Grid directives still infer cell grouping from the heading depth active when the grid opens.
- Unknown directive lines remain normal Markdown content.
- Unterminated layout blocks are still auto-closed by the compiler.
- Existing `sectionClassName` and `columnClassName` overrides are still applied during HAST class application.

## Follow-Up Notes

- Future directive attributes should be wired deliberately through the registry with validation and tests before becoming public behavior.
- Editor snippets/autocomplete/diagnostics should consume registry metadata rather than hardcoding directive names elsewhere.
- Server rendering is the only Markdown compilation path today; the client renderer only adds code-copy behavior.

## Test Runs

- `pnpm test:int` passed: 13 integration tests.
- `pnpm lint` passed.
- `pnpm build` passed: copyfiles, type generation, and SWC build.
- `pnpm test:e2e` initially failed in the sandbox with `listen EPERM: operation not permitted 0.0.0.0:3000`.
- `pnpm test:e2e` then reached Playwright but failed because the local Chromium browser was missing.
- `pnpm exec playwright install chromium` passed and installed Chromium/FFmpeg into the local Playwright cache.
- `pnpm test:e2e` passed after escalation/browser install: 2 Playwright tests.
