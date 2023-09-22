import { type EncodeObject } from '@cosmjs/proto-signing'

export interface MessageInterface {
  toObject: () => EncodeObject

  getMemo: () => string
}
