import { keystore } from '../Util/Keystore'
import { type AccountData } from '@cosmjs/amino'
import { Signer } from '@tedcryptoorg/cosmos-signer'
import { type Chain } from '@tedcryptoorg/cosmos-directory'

export class Account {
  private constructor (
    private readonly signer: Signer
  ) {
  }

  public static async create (chain: Chain, accName: string, keyringPassword: string): Promise<Account> {
    const mnemonic = keystore.load(accName, keyringPassword)
    const signer = await Signer.createSigner(chain, mnemonic)

    return new Account(signer)
  }

  async getAddress (): Promise<string> {
    return await this.signer.getAddress()
  }

  async getAccount (): Promise<AccountData> {
    const accounts = await this.signer.getAccounts()

    if (accounts[0] === undefined) {
      throw new Error('No accounts found in wallet')
    }

    return accounts[0]
  }

  getSigner (): Signer {
    return this.signer
  }
}
