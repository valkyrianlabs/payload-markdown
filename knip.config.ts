import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/index.ts',
    'src/client.ts',
    'src/server.ts',
    'src/**/*.client.ts',
    'src/**/*.client.tsx',
  ],
  project: ['src/**/*.ts', 'src/**/*.tsx'],
}

export default config
