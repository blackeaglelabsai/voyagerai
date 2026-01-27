import * as vscode from 'vscode'

export interface AskResult {
  success: boolean
  response?: string
  error?: string
}

/**
 * Sends a prompt to Copilot via vscode.lm API.
 * @param prompt - The full prompt with context
 * @param token - Cancellation token
 * @param modelId - Optional model ID to use
 * @returns AskResult with response or error
 */
export const askCopilot = async (
  prompt: string,
  token: vscode.CancellationToken,
  modelId?: string
): Promise<AskResult> => {
  try {
    let models: vscode.LanguageModelChat[]

    if (modelId) {
      models = await vscode.lm.selectChatModels({
        id: modelId
      })

      if (models.length === 0) {
        models = await vscode.lm.selectChatModels({
          family: modelId
        })
      }
    } else {
      models = await vscode.lm.selectChatModels()
    }

    console.log('Available models:', models.map(m => m.id))

    if (models.length === 0) {
      return {
        success: false,
        error: `No model found${modelId ? ` matching "${modelId}"` : ''}. Check available models.`
      }
    }

    const model = models[0]
    console.log('Using model:', model.id)

    const messages = [
      vscode.LanguageModelChatMessage.User(prompt)
    ]

    const chatResponse = await model.sendRequest(messages, {}, token)

    let response = ''
    for await (const chunk of chatResponse.text) {
      response += chunk
    }

    return {
      success: true,
      response
    }
  } catch (error) {
    console.log('askCopilot error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
