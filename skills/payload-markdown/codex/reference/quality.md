# Quality Checklist

Use this checklist before returning generated docs.

## Accuracy

- Public names match source exactly.
- Defaults are stated only when verified.
- Deprecated features are labeled as supported legacy paths, not removed behavior.
- Examples use real import paths, config keys, and commands.
- Warnings and limitations are visible near the relevant instructions.

## Structure

- One H1 per page.
- H2 sections follow the user's workflow.
- TOC appears on long pages.
- Cards summarize choices or related links.
- Steps are reserved for sequential work.
- Details contain optional content, not required setup.

## Directive Hygiene

- Only supported directives are used.
- Visible titles use `[Label]`.
- Multiline attributes are used for dense directives.
- `linkScope="title"` is used for cards containing buttons or links.
- Button directives include `href`.
- Icon-only buttons include `ariaLabel`.
- Tabs have stable `value` attributes.

## Markdown Hygiene

- Internal docs links are root-relative.
- Fenced code blocks use language tags.
- Markdown-in-Markdown examples use outer fences longer than inner fences.
- No MDX imports, JSX widgets, or arbitrary HTML layout.
- No runtime Tailwind classes in authored Markdown unless the target project explicitly allows it.

## Automated Checks

Run:

```bash
python3 skills/payload-markdown/codex/scripts/check_payload_markdown_doc.py path/to/docs.md
```

If working inside a downstream docs package, run its docs validation command as well.
