export interface MarkdownChunk {
  type: 'markdown' | 'code'
  content: string
  language?: string
}

/**
 * Parses Markdown content into chunks for notebook cells.
 * Splits on headers and extracts code blocks separately.
 * @param markdown - Markdown string
 * @returns Array of typed chunks
 */
export const parseMarkdown = (markdown: string): MarkdownChunk[] => {
  const chunks: MarkdownChunk[] = []
  const lines = markdown.split('\n')

  let currentMarkdown: string[] = []
  let inCodeBlock = false
  let codeBlockLang = ''
  let codeBlockContent: string[] = []

  const flushMarkdown = (): void => {
    const content = currentMarkdown.join('\n').trim()
    if (content) {
      chunks.push({ type: 'markdown', content })
    }
    currentMarkdown = []
  }

  const flushCode = (): void => {
    const content = codeBlockContent.join('\n')
    if (content) {
      chunks.push({
        type: 'code',
        content,
        language: codeBlockLang || 'python'
      })
    }
    codeBlockContent = []
    codeBlockLang = ''
  }

  for (const line of lines) {
    const codeBlockMatch = line.match(/^```(\w*)/)

    if (codeBlockMatch) {
      if (inCodeBlock) {
        flushCode()
        inCodeBlock = false
      } else {
        flushMarkdown()
        inCodeBlock = true
        codeBlockLang = codeBlockMatch[1]
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    const isHeader = /^#{1,6}\s/.test(line)

    if (isHeader && currentMarkdown.length > 0) {
      flushMarkdown()
    }

    currentMarkdown.push(line)
  }

  if (inCodeBlock) {
    flushCode()
  } else {
    flushMarkdown()
  }

  return chunks
}
