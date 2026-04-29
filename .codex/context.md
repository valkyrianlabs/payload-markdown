# payload-markdown Codex Context

This repository contains the `@valkyrianlabs/payload-markdown` plugin.

- `/src` is the plugin source that is built and published.
- `/dev` is the local Payload/Next sample project used for development and test coverage.
- The plugin provides Markdown field and Markdown block support for Payload CMS.
- The editor uses CodeMirror through `src/editor/MarkdownCodeMirror`.
- Markdown rendering is centralized in `src/core/renderMarkdown.ts`.
- Custom Markdown layout directives are internal renderer features, currently covering `:::section`, `:::2col`, `:::3col`, and `:::cell`.
- Directive definitions should stay modular under `src/directives`; avoid adding future directives to one giant parser or renderer file.
- Server rendering and editor behavior should stay aligned. If future phases add snippets, autocomplete, diagnostics, or highlighting, reuse the directive registry metadata where practical.

Current directive expansion plan:

- Phase 1 is directive-system foundation and regression hardening.
- Later phases may add `:::callout`, `:::details`, `:::toc`, `:::steps`, code metadata, `:::cards`, `:::tabs`, and optional authoring intelligence.
- Do not implement the whole expansion pack in one pass.
