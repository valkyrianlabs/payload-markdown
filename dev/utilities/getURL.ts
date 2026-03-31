import canUseDOM from './canUseDOM'

// Get base server-side origin
export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    'http://localhost:3000'
  )
}

// Get base client-side origin
export const getClientSideURL = () => {
  if (canUseDOM) {
    const { hostname, port, protocol } = window.location
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
}

export const getMediaURL = (url: string): string => {
  if (!url) return ''

  try {
    // If already fully-qualified, return as-is
    // const parsed = new URL(url)
    return url
  } catch {
    // Not a valid full URL, treat as relative
  }

  const isProject = url.startsWith('/api/project-media')
  const isTechnology = url.startsWith('/api/technology-media')
  const isMedia = url.startsWith('/api/media')

  const base =
    (isProject && process.env.S3_PUBLIC_PROJECT_MEDIA_ENDPOINT) ||
    (isTechnology && process.env.S3_PUBLIC_TECHNOLOGY_MEDIA_ENDPOINT) ||
    (isMedia && process.env.S3_PUBLIC_ENDPOINT) ||
    getClientSideURL()

  return `${base.replace(/\/$/, '')}${url}`
}
