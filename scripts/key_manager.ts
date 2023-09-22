import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as promptly from 'promptly'
import { Keystore } from '../src/Util/Keystore'
import {Account} from "../src/Account/Account.ts";
import {ChainDirectory} from "@tedcryptoorg/cosmos-directory";

const keystore = new Keystore()

yargs(hideBin(process.argv))
  .command(
    'add <key>',
    'Add a key with the given name',
    (yargs) => {
      return yargs
        .positional('key', {
          type: 'string',
          describe: 'name of the key',
          demandOption: true
        })
        .option('mnemonic', {
          type: 'string',
          describe: 'BIP-39 mnemonic seed phrase',
          demandOption: false
        })
        .option('password', {
          type: 'string',
          describe: 'password to encrypt the key',
          demandOption: false
        })
    },
    async (argv) => {
      if (argv.mnemonic !== undefined && argv.password !== undefined) {
        const accAddress = keystore.save(argv.key, argv.mnemonic, argv.password)
        console.log('Success! Address:', accAddress)
        return
      }

      const mnemonic = await promptly.prompt('Enter BIP-39 seed phrase:')

      const password = await promptly.password('Enter a password to encrypt the key:')
      const repeat = await promptly.password('Repeat the password:')
      if (password !== repeat) {
        throw new Error("Passwords don't match!")
      }

      const accAddress = keystore.save(argv.key, mnemonic, password)
      console.log('Success! Address:', accAddress)
    }
  )
  .command(
    'remove <key>',
    'Remove a key of the given name',
    (yargs) => {
      return yargs
        .positional('key', {
          type: 'string',
          describe: 'name of the key',
          demandOption: true
        })
    },
    (argv) => {
      keystore.remove(argv.key)
      console.log('Success!')
    }
  )
  .command(
    'show <key>',
    'Show a single key',
    (yargs) => {
      return yargs
        .positional('key', {
          type: 'string',
          describe: 'name of the key',
          demandOption: true
        })
    },
    async (argv) => {
      const password = await promptly.password('Enter the password used to encrypt the key:')
      const mnemonic = keystore.load(argv.key, password)
      console.log(mnemonic)
    }
  )
    .command('list',
        'List all keys',
        (yargs) => {
            return yargs
                .option('password', {
                    type: 'string',
                    describe: 'password to decrypt the key',
                    demandOption: false
                })
        },
        async (yargs) => {
            const files = keystore.list();
            for (const file of files) {
                if (!file.includes('.key')) {
                    continue;
                }
                const fileName = file.split('.')[0];
                try {
                    console.log(`${fileName}: ` + (await getAccountAddress(fileName, yargs.password ?? '')));
                } catch (error) {
                    const password = await promptly.password(`Enter the password used to decrypt the key "${fileName}":`)
                    console.log(`${fileName}: ` + (await getAccountAddress(fileName, password)));
                }
            }
        },
    )
  .wrap(100)
  .parse()


async function getAccountAddress(fileName: string, password: string): Promise<string>
{
    const chain = (await new ChainDirectory().getChainData(fileName)).chain;
    if (!chain) {
        throw new Error('Chain not found');
    }

    const account = await Account.create(chain, fileName, password);

    return account.getAddress();
}