import { angular as angularLang } from '@codemirror/lang-angular'
import { cpp as cppLang } from '@codemirror/lang-cpp'
import { css as cssLang } from '@codemirror/lang-css'
import { go as goLang } from '@codemirror/lang-go'
import { html as htmlLang } from '@codemirror/lang-html'
import { java as javaLang } from '@codemirror/lang-java'
import { javascript as jsLang } from '@codemirror/lang-javascript'
import { json as jsonLang } from '@codemirror/lang-json'
import { markdown as markdownLang } from '@codemirror/lang-markdown'
import { php as phpLang } from '@codemirror/lang-php'
import { python as pythonLang } from '@codemirror/lang-python'
import { rust as rustLang } from '@codemirror/lang-rust'
import { sass as sassLang } from '@codemirror/lang-sass'
import { sql as sqlLang } from '@codemirror/lang-sql'
import { vue as vueLang } from '@codemirror/lang-vue'
import { xml as xmlLang } from '@codemirror/lang-xml'
import { yaml as yamlLang } from '@codemirror/lang-yaml'
import { LanguageDescription } from '@codemirror/language'

export const angular = angularLang()
export const cpp = cppLang()
export const css = cssLang()
export const go = goLang()
export const html = htmlLang()
export const java = javaLang()
export const javascript = jsLang()
export const typescript = jsLang({ typescript: true })
export const json = jsonLang()
export const markdown = markdownLang()
export const php = phpLang()
export const python = pythonLang()
export const rust = rustLang()
export const sass = sassLang()
export const sql = sqlLang()
export const vue = vueLang()
export const xml = xmlLang()
export const yaml = yamlLang()

export const languages: LanguageDescription[] = [
  LanguageDescription.of({ name: 'Angular', alias: ['angular'], support: angular }),
  LanguageDescription.of({ name: 'C++', alias: ['cpp', 'c++', 'cc', 'cxx'], support: cpp }),
  LanguageDescription.of({ name: 'CSS', alias: ['css'], support: css }),
  LanguageDescription.of({ name: 'Go', alias: ['go'], support: go }),
  LanguageDescription.of({ name: 'HTML', alias: ['html', 'htm'], support: html }),
  LanguageDescription.of({ name: 'Java', alias: ['java'], support: java }),
  LanguageDescription.of({
    name: 'JavaScript',
    alias: ['javascript', 'js', 'mjs', 'cjs'],
    support: javascript,
  }),
  LanguageDescription.of({
    name: 'TypeScript',
    alias: ['typescript', 'ts'],
    support: typescript,
  }),
  LanguageDescription.of({ name: 'JSON', alias: ['json'], support: json }),
  LanguageDescription.of({ name: 'Markdown', alias: ['markdown', 'md'], support: markdown }),
  LanguageDescription.of({ name: 'PHP', alias: ['php'], support: php }),
  LanguageDescription.of({ name: 'Python', alias: ['python', 'py'], support: python }),
  LanguageDescription.of({ name: 'Rust', alias: ['rust', 'rs'], support: rust }),
  LanguageDescription.of({ name: 'Sass', alias: ['sass', 'scss'], support: sass }),
  LanguageDescription.of({ name: 'SQL', alias: ['sql'], support: sql }),
  LanguageDescription.of({ name: 'Vue', alias: ['vue'], support: vue }),
  LanguageDescription.of({ name: 'XML', alias: ['xml'], support: xml }),
  LanguageDescription.of({ name: 'YAML', alias: ['yaml', 'yml'], support: yaml }),
]

export const supported = {
  angular,
  cpp,
  css,
  go,
  html,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  rust,
  sass,
  sql,
  typescript,
  vue,
  xml,
  yaml,
}
