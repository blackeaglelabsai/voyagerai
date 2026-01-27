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

  if (request.command === 'models') {
  await handleModelsCommand(stream)
  return
  }


  stream.markdown('Use `/url <article-url>` to convert an article.')
}

const handleModelsCommand = async (
  stream: vscode.ChatResponseStream
): Promise<void> => {
  const models = await vscode.lm.selectChatModels()

  if (models.length === 0) {
    stream.markdown('No models available.')
    return
  }

  stream.markdown('**Available models:**\n\n')
  for (const model of models) {
    stream.markdown(`- \`${model.id}\` (${model.vendor}/${model.family})\n`)
  }
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
