import * as vscode from 'vscode'
import { handleChatRequest } from './participant.js'

export const activate = (context: vscode.ExtensionContext): void => {
  console.log('Voyager: Activating...')
  
  const participant = vscode.chat.createChatParticipant(
    'voyager.participant',
    handleChatRequest
  )

  participant.iconPath = new vscode.ThemeIcon('globe')
  context.subscriptions.push(participant)
  
  console.log('Voyager: Activation complete!')
}

export const deactivate = (): void => {}
