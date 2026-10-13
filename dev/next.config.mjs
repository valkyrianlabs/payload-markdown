import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` would otherwise write AGENTS.md/CLAUDE.md into dev/; the
  // repository's agent instructions live in the root AGENTS.md.
  agentRules: false,
  allowedDevOrigins: ['10.0.0.11'],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  serverExternalPackages: ['mongodb-memory-server'],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
