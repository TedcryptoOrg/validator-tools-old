import {PayRewards} from "./src/Commands/Reward/PayRewards.ts";
import {ChainDirectory} from "@tedcryptoorg/cosmos-directory";
import {CosmJs} from "./src/Provider/Cosmjs/CosmJs.ts";
import {Account} from "./src/Account/Account.ts";

const npid = require('npid')

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Missing command to run!');
    process.exit(1);
}

const commandArgs = args.slice(1);

// Define a function to handle the specified action
const runAction = async (action: string) => {
    console.debug('Creating PID file...')
    const pid = npid.create(`/tmp/validator-tools-${action}.pid`)
    pid.removeOnExit()

    const chain = (await new ChainDirectory().getChainData(commandArgs[0])).chain;
    if (!chain) {
        throw new Error('Chain not found');
    }
    const account = await Account.create(chain, chain.chain_name, process.env.WALLET_PASSWORD ?? '');
    const defaultFee =
        process.env.DEFAULT_FEE ??
        chain.fees.fee_tokens
        ?.find((fee) => fee.denom === chain.denom)
        ?.fixed_min_gas_price;

    console.log('Bot address is: ' + await account.getAddress())

    const cosmjs = new CosmJs(chain, account, {
        defaultFee: defaultFee+chain.denom,
        defaultModifier: 1.3,
    })

    switch (action) {
        case 'payRewards':
            const payRewards = new PayRewards(account, chain, cosmjs);
            if (!payRewards.validate(commandArgs)) {
                throw new Error('Invalid arguments');
            }

            await payRewards.run(commandArgs);

            break;
        default:
            console.error(`Unknown action: ${action}`);
            break;
    }
};

Promise.all([runAction(args[0])])
    .then(() => {
        console.log('Done!')
        process.exit(0)
    })
    .catch((error: any) => {
        console.error('Error:', error.message)
        throw error
    })
