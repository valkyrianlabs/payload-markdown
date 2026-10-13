<!--
vl-release staged release notes: the user-facing story of the NEXT release.
Maintained continuously while working; `vlr prepare` promotes it into the release notes
history (and the GitHub release) and resets this file to this template.

Format: the first line is "# <release title>" WITHOUT a version number (vlr adds it).
Everything after the title is the Markdown release body. Describe the resulting behavior
for users and operators; keep it representative of what actually ships.
-->
# Card icon spacing under eyebrows

### Card icons no longer crowd the eyebrow

A card with both an `eyebrow` and an `icon` now leaves a clear gap between the eyebrow text and the icon below it. The icon gets an extra `mt-2`, so the gap grows from 8px to 16px. Cards without an eyebrow render exactly as before, with the icon at the top of the card.
