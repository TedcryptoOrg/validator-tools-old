import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { type MessageInterface } from './MessageInterface'
import { type EncodeObject } from '@cosmjs/proto-signing'

export class SendMessage implements MessageInterface {
  constructor (
    private readonly from: string,
    private readonly to: string,
    private readonly amount: number,
    private readonly denom: string,
    private readonly memo?: string
  ) {
  }

  static pay(from: string, to: string, amount: number, denom: string, memo?: string): SendMessage {
    return new SendMessage(from, to, amount, denom, memo)
  }

  toObject (): EncodeObject {
    return {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: MsgSend.fromPartial({
        fromAddress: this.from,
        toAddress: this.to,
        amount: [{ denom: this.denom, amount: Math.round(this.amount).toString() }]
      })
    }
  }

  getMemo (): string {
    return this.memo ?? ''
  }
}
