#!/usr/bin/env python3
"""Lightweight checks for docs authored with Payload Markdown directives."""

from __future__ import annotations

import re
import sys
from pathlib import Path

CONTAINER_DIRECTIVES = {
    "callout",
    "details",
    "toc",
    "steps",
    "cards",
    "card",
    "buttons",
    "tabs",
    "tab",
    "section",
    "2col",
    "3col",
    "cell",
}
LEAF_DIRECTIVES = {"button"}
ALL_DIRECTIVES = CONTAINER_DIRECTIVES | LEAF_DIRECTIVES

LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
DIRECTIVE_RE = re.compile(r"^\s*::(?P<colons>:?)(?P<name>[A-Za-z0-9_-]+)\b(?P<rest>.*)$")
ATTR_RE = re.compile(r"([A-Za-z][A-Za-z0-9_-]*)=(?:\"([^\"]*)\"|'([^']*)'|([^\s}]+))")


def strip_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return text
    end = text.find("\n---\n", 4)
    if end < 0:
        return text
    return text[end + 5 :]


def iter_content_lines(text: str):
    in_fence = False
    fence_marker = ""
    for index, line in enumerate(text.splitlines(), start=1):
        stripped = line.strip()
        fence = re.match(r"^(```+|~~~+)", stripped)
        if fence:
            marker = fence.group(1)
            if not in_fence:
                in_fence = True
                fence_marker = marker[:3]
            elif marker.startswith(fence_marker):
                in_fence = False
                fence_marker = ""
            yield index, line, True
            continue
        yield index, line, in_fence


def parse_attrs(rest: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for match in ATTR_RE.finditer(rest):
        attrs[match.group(1)] = next(value for value in match.groups()[1:] if value is not None)
    return attrs


def check_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    body = strip_frontmatter(text)
    warnings: list[str] = []
    h1_count = 0
    stack: list[tuple[str, int]] = []

    for line_no, line, in_fence in iter_content_lines(body):
        if in_fence:
            continue

        if re.match(r"^# ", line):
            h1_count += 1

        for target in LINK_RE.findall(line):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if target.endswith(".md") or ".md#" in target:
                warnings.append(f"{path}:{line_no}: internal docs link should not target .md source: {target}")
            elif not target.startswith("/"):
                warnings.append(f"{path}:{line_no}: internal docs link should be root-relative: {target}")

        match = DIRECTIVE_RE.match(line)
        if not match:
            continue

        name = match.group("name")
        is_container = bool(match.group("colons"))
        rest = match.group("rest")

        if name in {"end", "endcol", "endsection"}:
            if name == "endcol":
                while stack and stack[-1][0] not in {"2col", "3col"}:
                    stack.pop()
                if stack:
                    stack.pop()
            elif name in {"end", "endsection"}:
                while stack and stack[-1][0] != "section":
                    stack.pop()
                if stack:
                    stack.pop()
            continue

        if name not in ALL_DIRECTIVES:
            warnings.append(f"{path}:{line_no}: unsupported Payload Markdown directive: {name}")
            continue

        if name in LEAF_DIRECTIVES and is_container:
            warnings.append(f"{path}:{line_no}: leaf directive should use two colons: {name}")
        if name in CONTAINER_DIRECTIVES and not is_container:
            warnings.append(f"{path}:{line_no}: container directive should use three colons: {name}")

        attrs = parse_attrs(rest)
        if name == "button" and "href" not in attrs:
            warnings.append(f"{path}:{line_no}: button directive should include href")
        if name == "tab" and "value" not in attrs:
            warnings.append(f"{path}:{line_no}: tab directive should include a stable value")
        if name == "card" and attrs.get("linkScope") == "full":
            warnings.append(f"{path}:{line_no}: use card linkScope=\"title\" when the body may contain links")

        if name in CONTAINER_DIRECTIVES:
            stack.append((name, line_no))

    if h1_count != 1:
        warnings.append(f"{path}: expected exactly one H1, found {h1_count}")

    return warnings


def main(argv: list[str]) -> int:
    paths = [Path(arg) for arg in argv]
    if not paths:
        print("Usage: check_payload_markdown_doc.py <markdown-file> [...]", file=sys.stderr)
        return 2

    warnings: list[str] = []
    for path in paths:
        if path.is_file() and path.suffix == ".md":
            warnings.extend(check_file(path))

    for warning in warnings:
        print(warning)

    return 1 if warnings else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
