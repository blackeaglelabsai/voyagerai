import * as vscode from 'vscode'

export interface CellContext {
  role: 'user' | 'assistant'
  content: string
}



export interface AskCommand {
  question: string
  model?: string
}

/**
 * Extracts the question and optional model from an ask cell.
 * @param cellText - The cell content
 * @returns AskCommand or null if not an ask cell
 */
export const parseAskCommand = (cellText: string): AskCommand | null => {
  const match = cellText.match(/^#\s*%ask\s+(.+)/is)

  if (!match) {
    return null
  }

  const args = match[1].trim()
  const modelMatch = args.match(/^--model\s+(\S+)\s+(.+)/is)

  if (modelMatch) {
    return {
      model: modelMatch[1],
      question: modelMatch[2].trim()
    }
  }

  return {
    question: args
  }
}




/**
 * Builds context from all cells above the specified index.
 * @param notebook - The notebook document
 * @param currentIndex - Index of the current ask cell
 * @returns Array of context messages
 */
export const buildContext = (
  notebook: vscode.NotebookDocument,
  currentIndex: number
): CellContext[] => {
  const context: CellContext[] = []

  for (let i = 0; i < currentIndex; i++) {
    const cell = notebook.cellAt(i)
    const content = cell.document.getText().trim()

    if (!content) {
      continue
    }

    context.push({
      role: 'user',
      content: content
    })
  }

  return context
}

/**
 * Extracts the question from an ask cell.
 * @param cellText - The cell content
 * @returns The question or null if not an ask cell
 */
export const extractQuestion = (cellText: string): string | null => {
  const match = cellText.match(/^#\s*%ask\s+(.+)/is)

  if (!match) {
    return null
  }

  return match[1].trim()
}

/**
 * Formats context into a single prompt string.
 * @param context - Array of context messages
 * @param question - The user's question
 * @returns Formatted prompt
 */
export const formatPrompt = (
  context: CellContext[],
  question: string
): string => {
  const contextText = context
    .map(c => c.content)
    .join('\n\n---\n\n')

  return `Based on the following article content:\n\n${contextText}\n\n---\n\nQuestion: ${question}`
}
