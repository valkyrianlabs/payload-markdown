#!/usr/bin/env python3
"""Lightweight checks for docs authored with Payload Markdown directives.

Directive knowledge (names, kinds, close markers, attributes, enum values,
badge types and targets) comes from ``../reference/directive-spec.json``,
which is generated from the renderer's directive registry. When the spec is
missing or unreadable, the embedded fallback tables below are used. Pass
``--spec PATH`` to use another spec (for example ``dist/directive-spec.json``).

The checker is line based. It mirrors the renderer's rules that can be
derived from a single line or a simple open/close stack:

- markers only open directives at the start of a top-level line (markers in
  list items and blockquotes render as text);
- text after a container marker must be ``[label]``, ``{attributes}`` or
  ``key=value`` tokens, otherwise the line renders as text;
- ``:::`` closes the innermost container, ``:::endcol`` the nearest grid,
  ``:::end``/``:::endsection`` the nearest section; stray closers and
  containers left open are reported;
- unknown directives, unknown attributes and invalid enum values.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DEFAULT_SPEC_PATH = Path(__file__).resolve().parent.parent / "reference" / "directive-spec.json"

# Fallback tables, used only when the generated spec cannot be loaded.
FALLBACK_CONTAINER_DIRECTIVES = {
    "callout",
    "details",
    "toc",
    "steps",
    "cards",
    "card",
    "buttons",
    "badges",
    "tabs",
    "tab",
    "section",
    "2col",
    "3col",
    "cell",
}
FALLBACK_LEAF_DIRECTIVES = {"button", "badge"}
FALLBACK_BADGE_TYPES = {"static", "npm", "github", "debian", "apt"}
FALLBACK_BADGE_TARGETS = {
    "npm": {"version", "downloads", "license"},
    "github": {"workflow", "release", "license", "stars"},
    "debian": {"version"},
    "apt": {"version"},
}
FALLBACK_CLOSE_MARKERS = {
    ":::": "innermost",
    ":::end": "section",
    ":::endcol": "grid",
    ":::endsection": "section",
}


class Spec:
    def __init__(self, data: dict | None):
        self.loaded = data is not None
        if data is None:
            self.containers = set(FALLBACK_CONTAINER_DIRECTIVES)
            self.leaves = set(FALLBACK_LEAF_DIRECTIVES)
            self.close_markers = dict(FALLBACK_CLOSE_MARKERS)
            self.badge_types = set(FALLBACK_BADGE_TYPES)
            self.badge_targets = {key: set(value) for key, value in FALLBACK_BADGE_TARGETS.items()}
            self.attributes: dict[str, dict[str, dict]] = {}
            self.grids = {"2col", "3col"}
            return

        directives = data.get("directives", [])
        self.containers = {d["name"] for d in directives if d.get("kind") == "container"}
        self.leaves = {d["name"] for d in directives if d.get("kind") == "leaf"}
        self.close_markers = {m["marker"]: m["closes"] for m in data.get("closeMarkers", [])}
        badges = data.get("badges", {})
        self.badge_types = set(badges.get("types", FALLBACK_BADGE_TYPES))
        self.badge_targets = {
            key: set(value) for key, value in badges.get("targets", {}).items() if value
        }
        self.attributes = {
            d["name"]: {a["name"]: a for a in d.get("attributes", [])} for d in directives
        }
        self.grids = {
            d["name"] for d in directives if ":::endcol" in d.get("closeMarkers", [])
        }

    @property
    def all_directives(self) -> set[str]:
        return self.containers | self.leaves


def load_spec(path: Path | None) -> Spec:
    try:
        with (path or DEFAULT_SPEC_PATH).open(encoding="utf-8") as handle:
            data = json.load(handle)
        if not isinstance(data, dict) or "directives" not in data:
            return Spec(None)
        return Spec(data)
    except (OSError, ValueError):
        return Spec(None)


LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
DIRECTIVE_RE = re.compile(r"^\s*::(?P<colons>:?)(?P<name>[A-Za-z0-9_-]+)\b(?P<rest>.*)$")
CLOSER_RE = re.compile(r"^\s*(?P<marker>:::(?:end|endcol|endsection)?)\s*$")
NESTED_MARKER_RE = re.compile(
    r"^\s*(?:(?P<list>(?:[-*+]|\d+[.)])\s+)|(?P<quote>>\s?))+(?P<marker>:{2,3}[A-Za-z0-9_-]*)"
)
ATTR_RE = re.compile(r"([A-Za-z][A-Za-z0-9_-]*)=(?:\"([^\"]*)\"|'([^']*)'|([^\s}]+))")
SHORTHAND_TOKEN_RE = re.compile(
    r"""^(?:[A-Za-z_][\w-]*=(?:"[^"]*"|'[^']*'|\S+)|#[\w-]+|\.[\w-]+)$"""
)
TOKEN_RE = re.compile(r"""[^\s"']+(?:"[^"]*"|'[^']*')?[^\s"']*|"[^"]*"|'[^']*'""")


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


def collect_attr_text(lines: list[tuple[int, str, bool]], start_index: int, rest: str) -> str:
    if "{" not in rest or "}" in rest:
        return rest

    parts = [rest]
    for _, next_line, in_fence in lines[start_index + 1 :]:
        if in_fence:
            break
        parts.append(next_line)
        if "}" in next_line:
            break
    return "\n".join(parts)


def strip_label(rest: str) -> str | None:
    """Removes a balanced leading [label]; None when the label never closes."""
    text = rest.lstrip()
    if not text.startswith("["):
        return text
    depth = 0
    index = 0
    while index < len(text):
        char = text[index]
        if char == "\\":
            index += 2
            continue
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return text[index + 1 :].lstrip()
        index += 1
    return None


def unexpected_text(rest: str) -> str | None:
    """Text after a container marker that is not a label, {…} block or key=value tokens."""
    after_label = strip_label(rest)
    if after_label is None or not after_label or after_label.startswith("{"):
        return None
    tokens = TOKEN_RE.findall(after_label)
    if tokens and all(SHORTHAND_TOKEN_RE.match(token) for token in tokens):
        return None
    return after_label


def check_attributes(
    spec: Spec, name: str, attrs: dict[str, str], where: str, warnings: list[str]
) -> None:
    known = spec.attributes.get(name)
    if not known:
        return
    for attr, value in attrs.items():
        definition = known.get(attr)
        if definition is None:
            warnings.append(f"{where}: unknown attribute on {name}: {attr}")
            continue
        values = definition.get("values")
        if definition.get("type") in {"enum", "boolean"} and values and value not in values:
            warnings.append(f"{where}: unsupported {attr} value for {name}: {value}")


def close_frames(stack: list[tuple[str, int]], marker: str, spec: Spec) -> bool:
    closes = spec.close_markers.get(marker)
    if closes == "innermost":
        if not stack:
            return False
        stack.pop()
        return True
    wanted = spec.grids if closes == "grid" else {"section"}
    for index in range(len(stack) - 1, -1, -1):
        if stack[index][0] in wanted:
            del stack[index:]
            return True
    return False


def check_file(path: Path, spec: Spec | None = None) -> list[str]:
    spec = spec or load_spec(None)
    text = path.read_text(encoding="utf-8")
    body = strip_frontmatter(text)
    lines = list(iter_content_lines(body))
    warnings: list[str] = []
    h1_count = 0
    stack: list[tuple[str, int]] = []

    for index, (line_no, line, in_fence) in enumerate(lines):
        if in_fence:
            continue

        where = f"{path}:{line_no}"

        if re.match(r"^# ", line):
            h1_count += 1

        for target in LINK_RE.findall(line):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if target.endswith(".md") or ".md#" in target:
                warnings.append(f"{where}: internal docs link should not target .md source: {target}")
            elif not target.startswith("/"):
                warnings.append(f"{where}: internal docs link should be root-relative: {target}")

        nested = NESTED_MARKER_RE.match(line)
        if nested:
            container = "blockquote" if nested.group("quote") else "list item"
            warnings.append(
                f"{where}: directive marker {nested.group('marker')} inside a {container} "
                "renders as text; directives must start a top-level line"
            )
            continue

        closer = CLOSER_RE.match(line)
        if closer:
            marker = closer.group("marker")
            if not close_frames(stack, marker, spec):
                warnings.append(f"{where}: closing marker {marker} has no open directive to close")
            continue

        match = DIRECTIVE_RE.match(line)
        if not match:
            continue

        name = match.group("name")
        is_container = bool(match.group("colons"))
        rest = match.group("rest")

        if name not in spec.all_directives:
            warnings.append(f"{where}: unsupported Payload Markdown directive: {name}")
            continue

        if name in spec.leaves and is_container:
            warnings.append(f"{where}: leaf directive should use two colons: {name}")
        if name in spec.containers and not is_container:
            warnings.append(f"{where}: container directive should use three colons: {name}")

        if is_container and name in spec.containers:
            extra = unexpected_text(rest)
            if extra is not None:
                preview = extra if len(extra) <= 40 else f"{extra[:40]}…"
                warnings.append(
                    f"{where}: unexpected text after :::{name}: {preview!r}; attributes must be "
                    "wrapped in {…} (the line renders as text)"
                )
                continue

        attrs = parse_attrs(collect_attr_text(lines, index, rest))
        check_attributes(spec, name, attrs, where, warnings)

        if name == "button" and "href" not in attrs:
            warnings.append(f"{where}: button directive should include href")
        if name == "badge":
            badge_type = attrs.get("type")
            target = attrs.get("target")
            src = attrs.get("src", "")
            if "src" in attrs and not src.startswith("https://img.shields.io/"):
                warnings.append(f"{where}: badge src must use https://img.shields.io")
            if not badge_type and "path" not in attrs and "src" not in attrs:
                warnings.append(f"{where}: badge directive should include type, path, or Shields src")
            if badge_type and badge_type not in spec.badge_types:
                warnings.append(f"{where}: unsupported badge type: {badge_type}")
            if badge_type in spec.badge_targets and target not in spec.badge_targets[badge_type]:
                warnings.append(f"{where}: unsupported badge target for {badge_type}: {target}")
            if badge_type in {"npm", "debian", "apt"} and "package" not in attrs:
                warnings.append(f"{where}: {badge_type} badge should include package")
            if badge_type == "github" and "repo" not in attrs:
                warnings.append(f"{where}: github badge should include repo")
            if badge_type == "github" and target == "workflow" and "workflow" not in attrs:
                warnings.append(f"{where}: github workflow badge should include workflow")
            if badge_type == "static":
                for required in ("label", "message", "color"):
                    if required not in attrs:
                        warnings.append(f"{where}: static badge should include {required}")
        if name == "tab" and "value" not in attrs:
            warnings.append(f"{where}: tab directive should include a stable value")
        if name == "card" and attrs.get("linkScope") == "full":
            warnings.append(f"{where}: use card linkScope=\"title\" when the body may contain links")

        if is_container and name in spec.containers:
            if name in spec.grids:
                # Opening a grid closes a grid that is open inside the nearest section.
                names = [frame[0] for frame in stack]
                sections = [i for i, frame_name in enumerate(names) if frame_name == "section"]
                grids = [i for i, frame_name in enumerate(names) if frame_name in spec.grids]
                if sections and grids and grids[-1] > sections[-1]:
                    del stack[grids[-1] :]
            stack.append((name, line_no))

    for name, line_no in stack:
        warnings.append(f"{path}:{line_no}: unclosed directive :::{name} (closed automatically at the end)")

    if h1_count != 1:
        warnings.append(f"{path}: expected exactly one H1, found {h1_count}")

    return warnings


def main(argv: list[str]) -> int:
    spec_path: Path | None = None
    args = list(argv)
    if "--spec" in args:
        position = args.index("--spec")
        if position + 1 >= len(args):
            print("--spec requires a path", file=sys.stderr)
            return 2
        spec_path = Path(args[position + 1])
        del args[position : position + 2]

    paths = [Path(arg) for arg in args]
    if not paths:
        print(
            "Usage: check_payload_markdown_doc.py [--spec directive-spec.json] <markdown-file> [...]",
            file=sys.stderr,
        )
        return 2

    spec = load_spec(spec_path)
    warnings: list[str] = []
    for path in paths:
        if path.is_file() and path.suffix == ".md":
            warnings.extend(check_file(path, spec))

    for warning in warnings:
        print(warning)

    return 1 if warnings else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
