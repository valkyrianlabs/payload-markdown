# payload-markdown Codex Context

This repository contains the `@valkyrianlabs/payload-markdown` plugin.

- `/src` is the plugin source that is built and published.
- `/dev` is the local Payload/Next sample project used for development and test coverage.
- The plugin provides Markdown field and Markdown block support for Payload CMS.
- The editor uses CodeMirror through `src/editor/MarkdownCodeMirror`.
- Markdown rendering is centralized in `src/core/renderMarkdown.ts`.
- Custom Markdown directives are registry-backed under `src/directives`.
- Current public directives include layout directives (`:::section`, `:::2col`, `:::3col`, `:::cell`), static directives (`:::callout`, `:::details`), docs directives (`:::toc`, `:::steps`), and card directives (`:::cards`, `:::card`).
- Directive definitions should stay modular under `src/directives`; avoid adding future directives to one giant parser or renderer file.
- Server rendering and editor behavior should stay aligned where practical. Directive snippets, autocomplete, and diagnostics should reuse registry metadata.

Current directive expansion plan:

- Phase 1 is directive-system foundation and regression hardening.
- Later phases may add `:::callout`, `:::details`, `:::toc`, `:::steps`, code metadata, `:::cards`, `:::tabs`, and optional authoring intelligence.
- Do not implement the whole expansion pack in one pass.
