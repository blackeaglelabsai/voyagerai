import * as vscode from 'vscode'
import { buildContext, parseAskCommand, formatPrompt, askCopilot } from './lib/lm/index.js'

export const createController = (): vscode.NotebookController => {
  const controller = vscode.notebooks.createNotebookController(
    'voyager-ask-controller',
    'jupyter-notebook',
    'Voyager Ask'
  )

  controller.supportedLanguages = ['python']
  controller.supportsExecutionOrder = true

  controller.executeHandler = async (cells, notebook, ctrl) => {
    for (const cell of cells) {
      await executeCell(cell, notebook, ctrl)
    }
  }

  return controller
}

const executeCell = async (
  cell: vscode.NotebookCell,
  notebook: vscode.NotebookDocument,
  controller: vscode.NotebookController
): Promise<void> => {
  const execution = controller.createNotebookCellExecution(cell)
  execution.start(Date.now())

  const cellText = cell.document.getText()
  const askCommand = parseAskCommand(cellText)

  if (!askCommand) {
    execution.end(false, Date.now())
    return
  }

  const context = buildContext(notebook, cell.index)
  const prompt = formatPrompt(context, askCommand.question)

  const result = await askCopilot(prompt, execution.token, askCommand.model)

  if (result.success) {
        const lines = result.response!.split('\n').map(line => `> ${line}`).join('\n')
  const styledResponse = `> 🤖 **AI Response**
>
${lines}`
    
    execution.replaceOutput([
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.text(styledResponse, 'text/markdown')
      ])
    ])
    execution.end(true, Date.now())
  } else {
    execution.replaceOutput([
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.error(new Error(result.error!))
      ])
    ])
    execution.end(false, Date.now())
  }
}
