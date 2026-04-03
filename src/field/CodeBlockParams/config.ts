import type { Field, GroupField } from 'payload'

export type CodeBlockParams = {
  admin?: Partial<GroupField['admin']>
  label?: string
  name?: string
}

export function codeBlockParams(options: CodeBlockParams = {}): Field {
  const {
    name = 'code_params',
    admin,
    label = 'Code Block Params',
  } = options

  return {
    name,
    type: 'group',
    admin,
    fields: [
      {
        name: 'shiki_theme',
        type: 'select',
        admin: {
          description: 'The Shiki theme to use for syntax highlighting this code block. ' +
            'Defaults to "github-dark". Note that this plugin is optimized around themes that ' +
            'still look good when block backgrounds are removed or reduced. ' +
            'Some light themes may require additional customization ' +
            'to maintain good contrast and readability.',
        },
        dbName: 'theme',
        defaultValue: 'github-dark',
        options: [
          { label: 'Andromeeda', value: 'andromeeda' },
          { label: 'Aurora X', value: 'aurora-x' },
          { label: 'Ayu Dark', value: 'ayu-dark' },
          { label: 'Ayu Light', value: 'ayu-light' },
          { label: 'Ayu Mirage', value: 'ayu-mirage' },
          { label: 'Catppuccin Frappé', value: 'catppuccin-frappe' },
          { label: 'Catppuccin Latte', value: 'catppuccin-latte' },
          { label: 'Catppuccin Macchiato', value: 'catppuccin-macchiato' },
          { label: 'Catppuccin Mocha', value: 'catppuccin-mocha' },
          { label: 'Dark Plus', value: 'dark-plus' },
          { label: 'Dracula Theme', value: 'dracula' },
          { label: 'Dracula Theme Soft', value: 'dracula-soft' },
          { label: 'Everforest Dark', value: 'everforest-dark' },
          { label: 'Everforest Light', value: 'everforest-light' },
          { label: 'GitHub Dark', value: 'github-dark' },
          { label: 'GitHub Dark Default', value: 'github-dark-default' },
          { label: 'GitHub Dark Dimmed', value: 'github-dark-dimmed' },
          { label: 'GitHub Dark High Contrast', value: 'github-dark-high-contrast' },
          { label: 'GitHub Light', value: 'github-light' },
          { label: 'GitHub Light Default', value: 'github-light-default' },
          { label: 'GitHub Light High Contrast', value: 'github-light-high-contrast' },
          { label: 'Gruvbox Dark Hard', value: 'gruvbox-dark-hard' },
          { label: 'Gruvbox Dark Medium', value: 'gruvbox-dark-medium' },
          { label: 'Gruvbox Dark Soft', value: 'gruvbox-dark-soft' },
          { label: 'Gruvbox Light Hard', value: 'gruvbox-light-hard' },
          { label: 'Gruvbox Light Medium', value: 'gruvbox-light-medium' },
          { label: 'Gruvbox Light Soft', value: 'gruvbox-light-soft' },
          { label: 'Horizon', value: 'horizon' },
          { label: 'Horizon Bright', value: 'horizon-bright' },
          { label: 'Houston', value: 'houston' },
          { label: 'Kanagawa Dragon', value: 'kanagawa-dragon' },
          { label: 'Kanagawa Lotus', value: 'kanagawa-lotus' },
          { label: 'Kanagawa Wave', value: 'kanagawa-wave' },
          { label: 'LaserWave', value: 'laserwave' },
          { label: 'Light Plus', value: 'light-plus' },
          { label: 'Material Theme', value: 'material-theme' },
          { label: 'Material Theme Darker', value: 'material-theme-darker' },
          { label: 'Material Theme Lighter', value: 'material-theme-lighter' },
          { label: 'Material Theme Ocean', value: 'material-theme-ocean' },
          { label: 'Material Theme Palenight', value: 'material-theme-palenight' },
          { label: 'Min Dark', value: 'min-dark' },
          { label: 'Min Light', value: 'min-light' },
          { label: 'Monokai', value: 'monokai' },
          { label: 'Night Owl', value: 'night-owl' },
          { label: 'Night Owl Light', value: 'night-owl-light' },
          { label: 'Nord', value: 'nord' },
          { label: 'One Dark Pro', value: 'one-dark-pro' },
          { label: 'One Light', value: 'one-light' },
          { label: 'Plastic', value: 'plastic' },
          { label: 'Poimandres', value: 'poimandres' },
          { label: 'Red', value: 'red' },
          { label: 'Rosé Pine', value: 'rose-pine' },
          { label: 'Rosé Pine Dawn', value: 'rose-pine-dawn' },
          { label: 'Rosé Pine Moon', value: 'rose-pine-moon' },
          { label: 'Slack Dark', value: 'slack-dark' },
          { label: 'Slack Ochin', value: 'slack-ochin' },
          { label: 'Snazzy Light', value: 'snazzy-light' },
          { label: 'Solarized Dark', value: 'solarized-dark' },
          { label: 'Solarized Light', value: 'solarized-light' },
          { label: "Synthwave '84", value: 'synthwave-84' },
          { label: 'Tokyo Night', value: 'tokyo-night' },
          { label: 'Vesper', value: 'vesper' },
          { label: 'Vitesse Black', value: 'vitesse-black' },
          { label: 'Vitesse Dark', value: 'vitesse-dark' },
          { label: 'Vitesse Light', value: 'vitesse-light' },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'showLineNumbers',
            type: 'checkbox',
            admin: {
              description: 'Whether to show line numbers in the code block.',
            },
            defaultValue: true,
            label: 'Show Line Numbers'
          },
          {
            name: 'prettyCodeBlocks',
            type: 'checkbox',
            admin: {
              description: 'Whether to apply the plugin\'s enhanced code block formatting. ' +
                'When enabled, the renderer normalizes Shiki output for better integration with ' +
                'markdown prose styling. This includes adjustments such as background removal, ' +
                'spacing cleanup, line layout normalization, and other structural fixes needed ' +
                'for features like line numbers and consistent empty-line rendering. ' +
                'Set this to false if you want to preserve raw Shiki block styling as much as possible.',
            },
            defaultValue: true,
            label: 'Pretty Code Blocks',
          },
          {
            name: 'highlightLines',
            type: 'checkbox',
            admin: {
              description: 'Whether to enable line highlighting for the code block. ' +
                'When enabled, you can specify lines to highlight by including a line number list in the code block\'s language declaration. ' +
                'For example, a declaration of "js{1,4-5}" would highlight lines 1, 4, and 5 in the block.',
            },
            defaultValue: false,
            label: 'Highlight Lines',
          }
        ]
      }
    ],
    label,
  }
}
