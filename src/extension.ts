import * as vscode from 'vscode'
import { handleChatRequest } from './participant.js'
import { createController } from './controller.js'

export const activate = (context: vscode.ExtensionContext): void => {
  console.log('Voyager: Activating...')
  
  const participant = vscode.chat.createChatParticipant(
    'voyager.participant',
    handleChatRequest
  )
  participant.iconPath = new vscode.ThemeIcon('globe')
  context.subscriptions.push(participant)

  const controller = createController()
  context.subscriptions.push(controller)
  
  console.log('Voyager: Activation complete!')
}

export const deactivate = (): void => {}
