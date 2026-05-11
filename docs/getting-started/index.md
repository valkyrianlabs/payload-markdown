---
title: Getting Started
navTitle: Getting Started
description: Install Payload Markdown, enable it for collections, and render Markdown content.
order: 10
status: published
tags:
  - getting-started
---

# Getting Started

Use this section when wiring the plugin into a Payload project for the first time.

:::steps {variant="cards" layout="grid" columns="3" numbered stepTheme="cyan"}

### Install

Add `@valkyrianlabs/payload-markdown` to the Payload app.

### Configure

Register `payloadMarkdown()` in `payload.config.ts` and enable the collections that should receive Markdown support.

### Render

Render fields and blocks with the server exports so collection-scoped settings can resolve correctly.

:::

## Pages In This Section

:::cards {columns="3" cardTheme="glass"}

:::card {title="Installation" href="/getting-started/installation"}
Plugin registration, package installation, and Tailwind setup.
:::

:::card {title="Fields and Blocks" href="/getting-started/fields-and-blocks"}
Automatic install behavior, manual schema control, and block rendering.
:::

:::card {title="Rendering" href="/getting-started/rendering"}
Server renderer usage, renderer props, empty fallbacks, and block component usage.
:::

:::
