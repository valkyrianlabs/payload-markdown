import type { LayoutDirectiveDefinition } from '../types.js'

import { getUnknownAttributeWarnings } from '../attributeDiagnostics.js'
import { SHIELDS_BADGE_QUERY_ATTRIBUTES } from '../shields.js'

export const BADGE_TYPES = ['static', 'npm', 'github', 'debian', 'apt'] as const
export const BADGE_TARGETS = [
  'version',
  'downloads',
  'license',
  'workflow',
  'release',
  'stars',
] as const
export const BADGE_INTERVALS = ['dw', 'dm', 'dy', 'dt'] as const
export const BADGE_STYLES = ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'] as const
export const BADGE_ALLOWED_ATTRIBUTES = [
  'alt',
  'href',
  'interval',
  'message',
  'newTab',
  'package',
  'path',
  'repo',
  'src',
  'target',
  'type',
  'workflow',
  ...SHIELDS_BADGE_QUERY_ATTRIBUTES,
] as const

export const badgeDirective: LayoutDirectiveDefinition = {
  name: 'badge',
  allowedAttributes: BADGE_ALLOWED_ATTRIBUTES,
  attributeValues: {
    type: BADGE_TYPES,
    interval: BADGE_INTERVALS,
    newTab: ['true', 'false'],
    style: BADGE_STYLES,
    target: BADGE_TARGETS,
  },
  defaultAttributes: {
    newTab: 'false',
  },
  description: 'img.shields.io badge with curated resolvers and strict Shields escape hatches.',
  editor: {
    detail: 'Shields badge leaf directive',
    label: '::badge',
    snippet:
      '::badge[${npm version}]{\n  type="${npm}"\n  target="${version}"\n  package="${package-name}"\n}\n${}',
  },
  kind: 'badge',
  public: true,
  supportsAttributes: true,
  tagName: 'img',
  validateAttributes({ attributes }) {
    return getUnknownAttributeWarnings('badge', BADGE_ALLOWED_ATTRIBUTES, attributes)
  },
}
