import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

/**
 * Creates a configured Turndown instance.
 * @returns Configured TurndownService
 */
const createTurndownService = (): TurndownService => {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  })

  turndown.use(gfm)

  turndown.addRule('fencedCodeWithLang', {
    filter: (node) => {
      return node.nodeName === 'PRE' && node.querySelector('code') !== null
    },
    replacement: (content, node) => {
      const codeEl = (node as HTMLElement).querySelector('code')
      const className = codeEl?.className || ''
      const langMatch = className.match(/language-(\w+)/)
      const lang = langMatch ? langMatch[1] : ''
      const code = codeEl?.textContent || content

      return `\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`
    }
  })

  return turndown
}

/**
 * Converts HTML content to Markdown.
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export const htmlToMarkdown = (html: string): string => {
  const turndown = createTurndownService()
  return turndown.turndown(html)
}
