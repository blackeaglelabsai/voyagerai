import * as vscode from 'vscode'
import { processUrl } from './lib/pipeline/index.js'

/**
 * Handles incoming chat requests to the Voyager participant.
 * Parses commands and delegates to appropriate handlers.
 * @param request - The chat request from the user
 * @param context - Chat context (history, etc.)
 * @param stream - Response stream to send messages back
 * @param token - Cancellation token
 */
export const handleChatRequest = async (
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<void> => {
  const command = request.command

  if (command === 'url') {
    await handleUrlCommand(request, stream, token)
    return
  }

  stream.markdown('Use `/url <article-url>` to convert an article to a Jupyter notebook.')
}

/**
 * Extracts a URL from the user's prompt text.
 * @param prompt - The user's input text
 * @returns The extracted URL or null if not found
 */
const extractUrl = (prompt: string): string | null => {
  const trimmed = prompt.trim()

  if (!trimmed) {
    return null
  }

  const urlPattern = /https?:\/\/[^\s]+/i
  const match = trimmed.match(urlPattern)

  if (!match) {
    return null
  }

  return match[0]
}


const handleUrlCommand = async (
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<void> => {
  const url = extractUrl(request.prompt)

  if (!url) {
    stream.markdown('⚠️ Please provide a valid URL. Example: `@voyager /url https://example.com/article`')
    return
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    stream.markdown('⚠️ Please open a folder in VS Code first.')
    return
  }

  const workspaceDir = workspaceFolder.uri.fsPath

  const result = await processUrl(url, workspaceDir, (message) => {
    stream.markdown(message + '\n\n')
  })

  if (!result.success) {
    stream.markdown(`❌ Error: ${result.error}`)
    return
  }

  const notebookUri = vscode.Uri.file(result.notebookPath!)
  await vscode.commands.executeCommand('vscode.openNotebookDocument', notebookUri)

  stream.markdown(`📓 Notebook saved: \`${result.notebookPath}\``)
}