import type { ContainerDirective } from 'mdast-util-directive'

export function getDirectiveLabel(node: ContainerDirective): string | undefined {
  const label = node.data?.vlDirectiveLabel

  return typeof label === 'string' && label.trim() ? label.trim() : undefined
}

export function getDirectiveLabelOrAttribute(
  node: ContainerDirective,
  attributeName: string,
): string | undefined {
  const label = getDirectiveLabel(node)
  const attributeValue = node.attributes?.[attributeName]

  if (label) return label
  return typeof attributeValue === 'string' && attributeValue.trim()
    ? attributeValue.trim()
    : undefined
}
