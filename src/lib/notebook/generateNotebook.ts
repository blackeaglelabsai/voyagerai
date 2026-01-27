import { Notebook, NotebookCell, NotebookMetadata } from './types.js'
import { MarkdownChunk } from './parseMarkdown.js'

/**
 * Creates default notebook metadata.
 * @returns NotebookMetadata object
 */
const createMetadata = (): NotebookMetadata => {
  return {
    kernelspec: {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3'
    },
    language_info: {
      name: 'python',
      version: '3.10'
    }
  }
}

/**
 * Converts content string to source array format (line by line with newlines).
 * @param content - Content string
 * @returns Array of lines
 */
const toSourceArray = (content: string): string[] => {
  const lines = content.split('\n')
  return lines.map((line, index) => {
    return index < lines.length - 1 ? line + '\n' : line
  })
}

/**
 * Creates a Markdown cell.
 * @param content - Markdown content
 * @returns NotebookCell
 */
const createMarkdownCell = (content: string): NotebookCell => {
  return {
    cell_type: 'markdown',
    source: toSourceArray(content),
    metadata: {}
  }
}

/**
 * Creates a code cell.
 * @param content - Code content
 * @returns NotebookCell
 */
const createCodeCell = (content: string): NotebookCell => {
  return {
    cell_type: 'code',
    source: toSourceArray(content),
    metadata: {},
    execution_count: null,
    outputs: []
  } as NotebookCell
}

/**
 * Generates a Jupyter notebook from Markdown chunks.
 * @param chunks - Array of parsed Markdown chunks
 * @param title - Article title for the first cell
 * @returns Notebook object
 */
export const generateNotebook = (chunks: MarkdownChunk[], title: string): Notebook => {
  const cells: NotebookCell[] = []

  cells.push(createMarkdownCell(`# ${title}`))

  for (const chunk of chunks) {
    if (chunk.type === 'code') {
      cells.push(createCodeCell(chunk.content))
    } else {
      cells.push(createMarkdownCell(chunk.content))
    }
  }

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: createMetadata(),
    cells
  }
}
