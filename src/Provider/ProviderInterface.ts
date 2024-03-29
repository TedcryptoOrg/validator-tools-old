import { type TxResult } from '../Types/Provider/TxResult'
import { type MessageInterface } from './Cosmjs/Messages/MessageInterface.ts'

export interface ProviderInterface {
  sendMessages: (messages: MessageInterface[], memo?: string) => Promise<TxResult>
}
