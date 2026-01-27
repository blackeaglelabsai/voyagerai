import * as vscode from 'vscode'
import { processUrl } from './lib/pipeline/index.js'

export const handleChatRequest = async (
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<void> => {
  if (request.command === 'url') {
    await handleUrlCommand(request, stream)
    return
  }

  stream.markdown('Use `/url <article-url>` to convert an article.')
}

const handleUrlCommand = async (
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream
): Promise<void> => {
  const url = extractUrl(request.prompt)

  if (!url) {
    stream.markdown('⚠️ Please provide a valid URL.')
    return
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    stream.markdown('⚠️ Please open a folder first.')
    return
  }

  const result = await processUrl(url, workspaceFolder.uri.fsPath, (msg) => {
    stream.markdown(msg + '\n\n')
  })

  if (!result.success) {
    stream.markdown(`❌ Error: ${result.error}`)
    return
  }

  const notebookUri = vscode.Uri.file(result.notebookPath!)
  //await vscode.commands.executeCommand('vscode.openNotebookDocument', notebookUri)
  await vscode.commands.executeCommand('vscode.open', notebookUri)

  stream.markdown(`📓 Notebook saved: \`${result.notebookPath}\``)
}

const extractUrl = (prompt: string): string | null => {
  const match = prompt.trim().match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}
