# Automated Docs Workflow

Use this workflow when generating or maintaining docs with Payload Markdown.

## 1. Build The Source Model

Before writing, inspect the real project surface:

- package metadata and exported entry points
- README and existing docs
- public types and config names
- examples, tests, fixtures, and generated types
- CLI commands, route names, environment variables, and migration notes

Do not describe a feature as implemented unless the source proves it.

## 2. Choose The Page Type

Use the page type to decide which directives belong:

- Overview: cards for page maps, callouts for positioning, short sections.
- Installation: steps, tabs for package managers, warnings for prerequisites.
- Usage guide: steps, callouts, details for optional branches.
- API reference: TOC, dense headings, small cards for related APIs.
- Migration: danger/warning callouts, steps, details for rollback notes.
- Troubleshooting: callouts for symptoms, details for error shapes, cards for common causes.
- Release notes: cards for highlights, details for compatibility notes.

## 3. Draft With A Clear Reading Path

Write the page in this order:

1. H1 with the page topic.
2. One short paragraph that says what the page helps the reader do.
3. TOC on long pages.
4. Main sections ordered from common workflow to advanced detail.
5. Related links or next steps at the end.

Keep prose direct. Avoid marketing copy when the page is operational documentation.

## 4. Add Directives For Structure

Use directives to make the document easier to scan:

- Use callouts for risk, caveats, and important context.
- Use steps for sequential procedures.
- Use cards for choice sets, related pages, or capability summaries.
- Use tabs for equivalent alternatives.
- Use details for optional information that would interrupt the main path.

Do not wrap every paragraph in a directive. The base format is still Markdown.

## 5. Audit For Drift

During a docs audit, verify:

- option names and default values
- import paths and exported symbols
- directive names and attributes
- command names and flags
- file paths and route paths
- warnings, limitations, and migration behavior

Update docs when they differ from the implementation, even if the drift is small.
