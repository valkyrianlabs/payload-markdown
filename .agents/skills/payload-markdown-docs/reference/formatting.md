# Formatting

Keep docs as plain Markdown that validates before sync.

Expected shape:

- supported frontmatter at the top
- one H1 for the page title
- H2 and H3 sections for structure
- root-relative internal links, such as `/workflow/publishing`
- supported `payload-markdown` directives only
- `index.ai.yml` updated when pages are added, moved, renamed, or removed

Do not add:

- `.mdx` files
- arbitrary YAML objects
- inline frontmatter arrays
- invented directive names or props
- HTML scripts, iframes, or client-side widgets
- one Payload Page per Markdown file
- production docs domains for internal links

Prefer short, concrete sections over long pages with deeply nested headings.
