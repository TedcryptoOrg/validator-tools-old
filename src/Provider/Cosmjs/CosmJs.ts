import { type ProviderInterface } from '../ProviderInterface'
import {
  type DeliverTxResponse,
  GasPrice,
  StargateClient
} from '@cosmjs/stargate'
import { type Chain } from '@tedcryptoorg/cosmos-directory/lib/cjs/types/types/ChainDirectory/Chain'
import { type CosmjsOptions } from '../../Types/Provider/Cosmjs/CosmjsOptions'
import { type TxResult } from '../../Types/Provider/TxResult'
import { type Account } from '../../Account/Account'
import { type Coin } from '@cosmjs/proto-signing'
import { type MessageInterface } from './Messages/MessageInterface'
import { Network, SigningClient } from '@tedcryptoorg/cosmos-signer'
import { CosmosDirectory } from '@tedcryptoorg/cosmos-directory'

export class CosmJs implements ProviderInterface {
  private readonly rpcNodeAddress: string
  private readonly restNodeAddress: string

  constructor (
      private readonly chain: Chain,
      private readonly account: Account,
      private readonly options: CosmjsOptions,
      rpcNodeAddress?: string,
      restNodeAddress?: string
  ) {
    this.rpcNodeAddress = rpcNodeAddress ?? new CosmosDirectory().rpcUrl(this.chain.name)
    this.restNodeAddress = restNodeAddress ?? new CosmosDirectory().restUrl(this.chain.name)
    console.debug('CosmJs initialized with options: ', options)
  }

  async getWalletBalance (walletAddress?: string|undefined, denom?: string|undefined): Promise<Coin> {
    const client = await StargateClient.connect(this.rpcNodeAddress)

    return await client.getBalance(walletAddress ?? await this.account.getAddress(), denom ?? this.chain.denom)
  }

  async getSignerClient (): Promise<SigningClient> {
    return new SigningClient(
        Network.createFromChain(this.chain, 960000, this.restNodeAddress).data,
        GasPrice.fromString(this.options.defaultFee),
        this.account.getSigner(),
        this.options.defaultModifier
    )
  }

  async sendMessages (messages: MessageInterface[], memo?: string): Promise<TxResult> {
    const signerAddress = await this.account.getAddress()
    const encodedMessages = messages.map(message => message.toObject())

    const client = await this.getSignerClient()

    console.log('Sending message')

    const result: DeliverTxResponse = await client.signAndBroadcast(
        signerAddress,
        encodedMessages,
        memo
    )

    console.log('Broadcasted!', result)

    return { transaction_hash: result.transactionHash }
  }
}
