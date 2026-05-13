import type { DirectiveAttributes } from './attributes.js'

function getEditDistance(left: string, right: string): number {
  const columns = right.length + 1
  const distances = Array.from({ length: (left.length + 1) * columns }, () => 0)

  for (let row = 0; row <= left.length; ++row) distances[row * columns] = row
  for (let column = 0; column <= right.length; ++column) distances[column] = column

  for (let row = 1; row <= left.length; ++row) {
    for (let column = 1; column <= right.length; ++column) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1
      distances[row * columns + column] = Math.min(
        distances[(row - 1) * columns + column] + 1,
        distances[row * columns + column - 1] + 1,
        distances[(row - 1) * columns + column - 1] + cost,
      )
    }
  }

  return distances[left.length * columns + right.length]
}

function findClosestAttribute(attribute: string, allowedAttributes: readonly string[]): string | undefined {
  let closest: string | undefined
  let closestDistance = Number.POSITIVE_INFINITY

  for (const allowedAttribute of allowedAttributes) {
    const distance = getEditDistance(attribute.toLowerCase(), allowedAttribute.toLowerCase())

    if (distance >= closestDistance) continue

    closest = allowedAttribute
    closestDistance = distance
  }

  return closest && closestDistance <= 2 ? closest : undefined
}

export function getUnknownAttributeWarnings(
  directiveName: string,
  allowedAttributes: readonly string[] | undefined,
  attributes: DirectiveAttributes,
): string[] {
  if (!allowedAttributes) return []

  return Object.keys(attributes)
    .filter((attribute) => !allowedAttributes.includes(attribute))
    .map((attribute) => {
      const suggestion = findClosestAttribute(attribute, allowedAttributes)

      return suggestion
        ? `Unknown attribute "${attribute}" on "${directiveName}". Did you mean "${suggestion}"?`
        : `Unknown attribute "${attribute}" on "${directiveName}".`
    })
}
