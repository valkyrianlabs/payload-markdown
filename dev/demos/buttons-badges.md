# Buttons And Badges

Link buttons (`::button`) and button groups (`:::buttons`) in every variant, size, icon position, alignment, gap, and stack mode; then Shields badges (`::badge`) and badge groups (`:::badges`) with every curated resolver, style, alignment, gap, and wrap mode. Only two icons exist in the dev pack: `@fa-duotone/server` and `@fa-duotone/laptop`.

## Buttons: Variants

### Buttons: every variant at the default size

:::buttons
::button[Primary]{
  href="/posts"
  variant="primary"
}

::button[Secondary]{
  href="/posts"
  variant="secondary"
}

::button[Outline]{
  href="/posts"
  variant="outline"
}

::button[Ghost]{
  href="/posts"
  variant="ghost"
}

::button[Link]{
  href="/posts"
  variant="link"
}
:::

### Buttons: every variant with a left icon

:::buttons
::button[Primary]{
  href="/posts"
  variant="primary"
  icon="@fa-duotone/laptop"
}

::button[Secondary]{
  href="/posts"
  variant="secondary"
  icon="@fa-duotone/laptop"
}

::button[Outline]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/laptop"
}

::button[Ghost]{
  href="/posts"
  variant="ghost"
  icon="@fa-duotone/laptop"
}

::button[Link]{
  href="/posts"
  variant="link"
  icon="@fa-duotone/laptop"
}
:::

### Buttons: every variant with a right icon

:::buttons
::button[Primary]{
  href="/posts"
  variant="primary"
  icon="@fa-duotone/server"
  iconPosition="right"
}

::button[Secondary]{
  href="/posts"
  variant="secondary"
  icon="@fa-duotone/server"
  iconPosition="right"
}

::button[Outline]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}

::button[Ghost]{
  href="/posts"
  variant="ghost"
  icon="@fa-duotone/server"
  iconPosition="right"
}

::button[Link]{
  href="/posts"
  variant="link"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

## Buttons: Sizes

### Buttons: primary in sm, md, lg

:::buttons{align="left"}
::button[Primary sm]{
  href="/posts"
  variant="primary"
  size="sm"
  icon="@fa-duotone/laptop"
}

::button[Primary md]{
  href="/posts"
  variant="primary"
  size="md"
  icon="@fa-duotone/laptop"
}

::button[Primary lg]{
  href="/posts"
  variant="primary"
  size="lg"
  icon="@fa-duotone/laptop"
}
:::

### Buttons: secondary in sm, md, lg

:::buttons{align="left"}
::button[Secondary sm]{
  href="/posts"
  variant="secondary"
  size="sm"
  icon="@fa-duotone/laptop"
}

::button[Secondary md]{
  href="/posts"
  variant="secondary"
  size="md"
  icon="@fa-duotone/laptop"
}

::button[Secondary lg]{
  href="/posts"
  variant="secondary"
  size="lg"
  icon="@fa-duotone/laptop"
}
:::

### Buttons: outline in sm, md, lg

:::buttons{align="left"}
::button[Outline sm]{
  href="/posts"
  variant="outline"
  size="sm"
  icon="@fa-duotone/laptop"
}

::button[Outline md]{
  href="/posts"
  variant="outline"
  size="md"
  icon="@fa-duotone/laptop"
}

::button[Outline lg]{
  href="/posts"
  variant="outline"
  size="lg"
  icon="@fa-duotone/laptop"
}
:::

### Buttons: ghost in sm, md, lg

:::buttons{align="left"}
::button[Ghost sm]{
  href="/posts"
  variant="ghost"
  size="sm"
  icon="@fa-duotone/laptop"
}

::button[Ghost md]{
  href="/posts"
  variant="ghost"
  size="md"
  icon="@fa-duotone/laptop"
}

::button[Ghost lg]{
  href="/posts"
  variant="ghost"
  size="lg"
  icon="@fa-duotone/laptop"
}
:::

### Buttons: link in sm, md, lg

:::buttons{align="left"}
::button[Link sm]{
  href="/posts"
  variant="link"
  size="sm"
  icon="@fa-duotone/laptop"
}

::button[Link md]{
  href="/posts"
  variant="link"
  size="md"
  icon="@fa-duotone/laptop"
}

::button[Link lg]{
  href="/posts"
  variant="link"
  size="lg"
  icon="@fa-duotone/laptop"
}
:::

## Buttons: Icon-Only

### Buttons: icon-only in every variant (ariaLabel)

:::buttons
::button[]{
  href="/posts"
  variant="primary"
  icon="@fa-duotone/server"
  ariaLabel="Open primary"
}

::button[]{
  href="/posts"
  variant="secondary"
  icon="@fa-duotone/laptop"
  ariaLabel="Open secondary"
}

::button[]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  ariaLabel="Open outline"
}

::button[]{
  href="/posts"
  variant="ghost"
  icon="@fa-duotone/laptop"
  ariaLabel="Open ghost"
}

::button[]{
  href="/posts"
  variant="link"
  icon="@fa-duotone/server"
  ariaLabel="Open link"
}
:::

### Buttons: icon-only in every size

:::buttons
::button[]{
  href="/posts"
  size="sm"
  icon="@fa-duotone/server"
  ariaLabel="Servers (sm)"
}

::button[]{
  href="/posts"
  size="md"
  icon="@fa-duotone/server"
  ariaLabel="Servers (md)"
}

::button[]{
  href="/posts"
  size="lg"
  icon="@fa-duotone/server"
  ariaLabel="Servers (lg)"
}
:::

## Buttons: Group Alignment

### Buttons: align="left"

:::buttons{align="left"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: align="center"

:::buttons{align="center"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: align="right"

:::buttons{align="right"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

## Buttons: Group Gap

### Buttons: gap="sm"

:::buttons{gap="sm"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: gap="md"

:::buttons{gap="md"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: gap="lg"

:::buttons{gap="lg"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

## Buttons: Group Stacking

Resize to a phone width to compare `mobile` with `never`.

### Buttons: stack="mobile"

:::buttons{stack="mobile"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: stack="always"

:::buttons{stack="always"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: stack="never"

:::buttons{stack="never"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: stack="always" align="center" gap="lg"

:::buttons{
  stack="always"
  align="center"
  gap="lg"
}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: stack="never" align="right" gap="sm"

:::buttons{
  stack="never"
  align="right"
  gap="sm"
}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Documentation]{
  href="/posts"
  variant="secondary"
}

::button[GitHub]{
  href="/posts"
  variant="outline"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

## Buttons: Other Cases

### Buttons: many buttons that wrap

:::buttons{stack="never"}
::button[Button 1]{
  href="/posts"
  variant="primary"
}

::button[Button 2]{
  href="/posts"
  variant="secondary"
}

::button[Button 3]{
  href="/posts"
  variant="outline"
}

::button[Button 4]{
  href="/posts"
  variant="ghost"
}

::button[Button 5]{
  href="/posts"
  variant="link"
}

::button[Button 6]{
  href="/posts"
  variant="primary"
}

::button[Button 7]{
  href="/posts"
  variant="secondary"
}

::button[Button 8]{
  href="/posts"
  variant="outline"
}

::button[Button 9]{
  href="/posts"
  variant="ghost"
}

::button[Button 10]{
  href="/posts"
  variant="link"
}

::button[Button 11]{
  href="/posts"
  variant="primary"
}

::button[Button 12]{
  href="/posts"
  variant="secondary"
}
:::

### Buttons: long labels

:::buttons
::button[A deliberately long button label that may need to wrap]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[Another long secondary button label]{
  href="/posts"
  variant="secondary"
  icon="@fa-duotone/server"
  iconPosition="right"
}
:::

### Buttons: external links with newTab

:::buttons
::button[Payload CMS]{
  href="https://payloadcms.com"
  newTab=true
  icon="@fa-duotone/laptop"
  iconPosition="right"
}

::button[GitHub]{
  href="https://github.com/valkyrianlabs/payload-markdown"
  variant="secondary"
  newTab="true"
}
:::

### Button: standalone, outside a group

::button[Standalone primary]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

### Buttons: standalone buttons back to back (no group)

::button[First standalone]{
  href="/posts"
}

::button[Second standalone]{
  href="/posts"
  variant="secondary"
}

### Buttons: group directly after a paragraph

A paragraph directly above a button group, to check the vertical gap.

:::buttons
::button[After a paragraph]{
  href="/posts"
}
:::

A paragraph directly below a button group.

### Buttons: non-button Markdown inside a group

:::buttons{align="center"}
::button[Primary]{
  href="/posts"
}

::button[Secondary]{
  href="/posts"
  variant="secondary"
}

A plain paragraph inside the group renders normally.
:::

## Badges: Curated Resolvers

### Badge: static

:::badges
::badge[docs ready]{
  type="static"
  label="docs"
  message="ready"
  color="0ea5e9"
}
::badge[license MIT]{
  type="static"
  label="license"
  message="MIT"
  color="blue"
}
::badge[status stable]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
:::

### Badge: npm version, downloads, license

:::badges
::badge[npm version]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  href="https://www.npmjs.com/package/@valkyrianlabs/payload-markdown"
}
::badge[npm downloads (weekly)]{
  type="npm"
  target="downloads"
  package="@valkyrianlabs/payload-markdown"
}
::badge[npm downloads (monthly)]{
  type="npm"
  target="downloads"
  package="@valkyrianlabs/payload-markdown"
  interval="dm"
}
::badge[npm downloads (yearly)]{
  type="npm"
  target="downloads"
  package="@valkyrianlabs/payload-markdown"
  interval="dy"
}
::badge[npm downloads (total)]{
  type="npm"
  target="downloads"
  package="@valkyrianlabs/payload-markdown"
  interval="dt"
}
::badge[npm license]{
  type="npm"
  target="license"
  package="@valkyrianlabs/payload-markdown"
}
:::

### Badge: GitHub workflow, release, license, stars

:::badges
::badge[build]{
  type="github"
  target="workflow"
  repo="valkyrianlabs/payload-markdown"
  workflow="deploy.yml"
  href="https://github.com/valkyrianlabs/payload-markdown/actions"
}
::badge[release]{
  type="github"
  target="release"
  repo="valkyrianlabs/payload-markdown"
}
::badge[GitHub license]{
  type="github"
  target="license"
  repo="valkyrianlabs/payload-markdown"
}
::badge[stars]{
  type="github"
  target="stars"
  repo="valkyrianlabs/payload-markdown"
}
:::

### Badge: Debian and apt alias

:::badges
::badge[debian curl]{
  type="debian"
  target="version"
  package="curl"
}
::badge[apt git]{
  type="apt"
  target="version"
  package="git"
}
:::

### Badge: path and src escape hatches

:::badges
::badge[coverage]{
  path="badge/coverage-95%-brightgreen"
  style="flat-square"
}
::badge[license from src]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
:::

## Badges: Styles And Query Attributes

### Badge: every style

:::badges
::badge[style flat]{
  type="static"
  label="style"
  message="flat"
  color="0ea5e9"
  style="flat"
}
::badge[style flat-square]{
  type="static"
  label="style"
  message="flat-square"
  color="0ea5e9"
  style="flat-square"
}
::badge[style plastic]{
  type="static"
  label="style"
  message="plastic"
  color="0ea5e9"
  style="plastic"
}
::badge[style for-the-badge]{
  type="static"
  label="style"
  message="for-the-badge"
  color="0ea5e9"
  style="for-the-badge"
}
::badge[style social]{
  type="static"
  label="style"
  message="social"
  color="0ea5e9"
  style="social"
}
:::

### Badge: logo, logoColor, labelColor

:::badges
::badge[GitHub logo]{
  type="static"
  label="github"
  message="valkyrianlabs"
  color="181717"
  logo="github"
  logoColor="white"
}
::badge[npm logo]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  logo="npm"
  labelColor="cb3837"
}
::badge[TypeScript]{
  type="static"
  label="types"
  message="TypeScript"
  color="3178c6"
  logo="typescript"
  logoColor="white"
  style="for-the-badge"
}
:::

### Badge: custom label on a curated badge

:::badges
::badge[package version]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
  label="package"
  color="8b5cf6"
}
:::

### Badge: alt overrides the label

:::badges
::badge[visible label]{
  type="static"
  label="alt"
  message="custom"
  color="gray"
  alt="Badge with custom alt text"
}
:::

### Badge: links and newTab

:::badges
::badge[linked badge]{
  src="https://img.shields.io/badge/link-same%20tab-blue"
  href="/posts"
}
::badge[new tab badge]{
  src="https://img.shields.io/badge/link-new%20tab-blue"
  href="https://shields.io"
  newTab=true
}
:::

## Badges: Group Alignment

### Badges: align="left"

:::badges{align="left"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

### Badges: align="center"

:::badges{align="center"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

### Badges: align="right"

:::badges{align="right"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

## Badges: Group Gap

### Badges: gap="sm"

:::badges{gap="sm"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

### Badges: gap="md"

:::badges{gap="md"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

### Badges: gap="lg"

:::badges{gap="lg"}
::badge[license]{
  src="https://img.shields.io/badge/license-MIT-blue"
}
::badge[status]{
  type="static"
  label="status"
  message="stable"
  color="brightgreen"
}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
:::

## Badges: Wrapping

### Badges: wrap="true" with many badges

:::badges{wrap="true"}
::badge[typescript]{
  type="static"
  label="built with"
  message="typescript"
  color="0ea5e9"
  logo="typescript"
}
::badge[react]{
  type="static"
  label="built with"
  message="react"
  color="8b5cf6"
  logo="react"
}
::badge[nextdotjs]{
  type="static"
  label="built with"
  message="nextdotjs"
  color="10b981"
  logo="nextdotjs"
}
::badge[tailwindcss]{
  type="static"
  label="built with"
  message="tailwindcss"
  color="f59e0b"
  logo="tailwindcss"
}
::badge[markdown]{
  type="static"
  label="built with"
  message="markdown"
  color="0ea5e9"
  logo="markdown"
}
::badge[github]{
  type="static"
  label="built with"
  message="github"
  color="8b5cf6"
  logo="github"
}
::badge[npm]{
  type="static"
  label="built with"
  message="npm"
  color="10b981"
  logo="npm"
}
::badge[pnpm]{
  type="static"
  label="built with"
  message="pnpm"
  color="f59e0b"
  logo="pnpm"
}
::badge[docker]{
  type="static"
  label="built with"
  message="docker"
  color="0ea5e9"
  logo="docker"
}
::badge[node.js]{
  type="static"
  label="built with"
  message="node.js"
  color="8b5cf6"
  logo="node.js"
}
::badge[vercel]{
  type="static"
  label="built with"
  message="vercel"
  color="10b981"
  logo="vercel"
}
::badge[eslint]{
  type="static"
  label="built with"
  message="eslint"
  color="f59e0b"
  logo="eslint"
}
::badge[prettier]{
  type="static"
  label="built with"
  message="prettier"
  color="0ea5e9"
  logo="prettier"
}
::badge[vitest]{
  type="static"
  label="built with"
  message="vitest"
  color="8b5cf6"
  logo="vitest"
}
::badge[playwright]{
  type="static"
  label="built with"
  message="playwright"
  color="10b981"
  logo="playwright"
}
::badge[postgresql]{
  type="static"
  label="built with"
  message="postgresql"
  color="f59e0b"
  logo="postgresql"
}
:::

### Badges: wrap="false" with many badges (should not wrap)

:::badges{wrap=false}
::badge[typescript]{
  type="static"
  label="built with"
  message="typescript"
  color="0ea5e9"
  logo="typescript"
}
::badge[react]{
  type="static"
  label="built with"
  message="react"
  color="8b5cf6"
  logo="react"
}
::badge[nextdotjs]{
  type="static"
  label="built with"
  message="nextdotjs"
  color="10b981"
  logo="nextdotjs"
}
::badge[tailwindcss]{
  type="static"
  label="built with"
  message="tailwindcss"
  color="f59e0b"
  logo="tailwindcss"
}
::badge[markdown]{
  type="static"
  label="built with"
  message="markdown"
  color="0ea5e9"
  logo="markdown"
}
::badge[github]{
  type="static"
  label="built with"
  message="github"
  color="8b5cf6"
  logo="github"
}
::badge[npm]{
  type="static"
  label="built with"
  message="npm"
  color="10b981"
  logo="npm"
}
::badge[pnpm]{
  type="static"
  label="built with"
  message="pnpm"
  color="f59e0b"
  logo="pnpm"
}
::badge[docker]{
  type="static"
  label="built with"
  message="docker"
  color="0ea5e9"
  logo="docker"
}
::badge[node.js]{
  type="static"
  label="built with"
  message="node.js"
  color="8b5cf6"
  logo="node.js"
}
::badge[vercel]{
  type="static"
  label="built with"
  message="vercel"
  color="10b981"
  logo="vercel"
}
::badge[eslint]{
  type="static"
  label="built with"
  message="eslint"
  color="f59e0b"
  logo="eslint"
}
::badge[prettier]{
  type="static"
  label="built with"
  message="prettier"
  color="0ea5e9"
  logo="prettier"
}
::badge[vitest]{
  type="static"
  label="built with"
  message="vitest"
  color="8b5cf6"
  logo="vitest"
}
::badge[playwright]{
  type="static"
  label="built with"
  message="playwright"
  color="10b981"
  logo="playwright"
}
::badge[postgresql]{
  type="static"
  label="built with"
  message="postgresql"
  color="f59e0b"
  logo="postgresql"
}
:::

### Badges: center, gap="sm", wrap="true"

:::badges{
  align="center"
  gap="sm"
  wrap=true
}
::badge[typescript]{
  type="static"
  label="built with"
  message="typescript"
  color="0ea5e9"
  logo="typescript"
}
::badge[react]{
  type="static"
  label="built with"
  message="react"
  color="8b5cf6"
  logo="react"
}
::badge[nextdotjs]{
  type="static"
  label="built with"
  message="nextdotjs"
  color="10b981"
  logo="nextdotjs"
}
::badge[tailwindcss]{
  type="static"
  label="built with"
  message="tailwindcss"
  color="f59e0b"
  logo="tailwindcss"
}
::badge[markdown]{
  type="static"
  label="built with"
  message="markdown"
  color="0ea5e9"
  logo="markdown"
}
::badge[github]{
  type="static"
  label="built with"
  message="github"
  color="8b5cf6"
  logo="github"
}
::badge[npm]{
  type="static"
  label="built with"
  message="npm"
  color="10b981"
  logo="npm"
}
::badge[pnpm]{
  type="static"
  label="built with"
  message="pnpm"
  color="f59e0b"
  logo="pnpm"
}
::badge[docker]{
  type="static"
  label="built with"
  message="docker"
  color="0ea5e9"
  logo="docker"
}
::badge[node.js]{
  type="static"
  label="built with"
  message="node.js"
  color="8b5cf6"
  logo="node.js"
}
::badge[vercel]{
  type="static"
  label="built with"
  message="vercel"
  color="10b981"
  logo="vercel"
}
::badge[eslint]{
  type="static"
  label="built with"
  message="eslint"
  color="f59e0b"
  logo="eslint"
}
::badge[prettier]{
  type="static"
  label="built with"
  message="prettier"
  color="0ea5e9"
  logo="prettier"
}
::badge[vitest]{
  type="static"
  label="built with"
  message="vitest"
  color="8b5cf6"
  logo="vitest"
}
::badge[playwright]{
  type="static"
  label="built with"
  message="playwright"
  color="10b981"
  logo="playwright"
}
::badge[postgresql]{
  type="static"
  label="built with"
  message="postgresql"
  color="f59e0b"
  logo="postgresql"
}
:::

## Badges: Outside A Group And Inline

### Badge: standalone, outside a group

::badge[standalone]{
  src="https://img.shields.io/badge/standalone-badge-blue"
}

### Badge: standalone directly after a paragraph

A paragraph with a standalone badge on the very next line.
::badge[after paragraph]{
  src="https://img.shields.io/badge/after-paragraph-orange"
}

### Badges: inline Markdown images in a paragraph

`::badge` is a leaf directive and must start its own line. To put a badge inside running text, use a normal Markdown image: this project is ![license MIT](https://img.shields.io/badge/license-MIT-blue) licensed, ships ![types TypeScript](https://img.shields.io/badge/types-TypeScript-3178c6) types, and is currently ![status stable](https://img.shields.io/badge/status-stable-brightgreen) for production use. The line height of the surrounding text should not jump around the images.

### Badges: a row of Markdown image badges in a paragraph

[![npm](https://img.shields.io/npm/v/@valkyrianlabs/payload-markdown)](https://www.npmjs.com/package/@valkyrianlabs/payload-markdown) [![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/valkyrianlabs/payload-markdown) [![build](https://img.shields.io/github/actions/workflow/status/valkyrianlabs/payload-markdown/deploy.yml)](https://github.com/valkyrianlabs/payload-markdown/actions)

### Badges and buttons together (README header)

:::badges{align="center"}
::badge[npm]{
  type="npm"
  target="version"
  package="@valkyrianlabs/payload-markdown"
}
::badge[license]{
  type="npm"
  target="license"
  package="@valkyrianlabs/payload-markdown"
}
::badge[build]{
  type="github"
  target="workflow"
  repo="valkyrianlabs/payload-markdown"
  workflow="deploy.yml"
}
:::

:::buttons{align="center"}
::button[Get Started]{
  href="/posts"
  icon="@fa-duotone/laptop"
}

::button[GitHub]{
  href="https://github.com/valkyrianlabs/payload-markdown"
  variant="secondary"
  icon="@fa-duotone/server"
  newTab=true
}
:::
