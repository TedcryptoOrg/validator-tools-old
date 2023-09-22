import {CommandInterface} from "../CommandInterface.ts";
import {SendMessage} from "../../Provider/Cosmjs/Messages/SendMessage.ts";
import {Chain} from '@tedcryptoorg/cosmos-directory'
import {CosmJs} from "../../Provider/Cosmjs/CosmJs.ts";
import {MessageInterface} from "../../Provider/Cosmjs/Messages/MessageInterface.ts";
import {Delegation, StakingRestClient} from "../../Service/Cosmos/StakingRestClient.ts";
import {sleep} from "../../Util/Sleep.ts";
import {Account} from "../../Account/Account.ts";
import {getDateFormatted} from "../../Util/Date.ts";

type Reward = {
    delegatorAddress: string,
    amount: number
}

export class PayRewards implements CommandInterface {
    name = 'pay-rewards';
    description = 'Pay rewards to users';

    private readonly stakingRestClient: StakingRestClient;

    public constructor(
        private readonly account: Account,
        private readonly chain: Chain,
        private readonly cosmjs: CosmJs
    ) {
        this.stakingRestClient = new StakingRestClient(this.chain);
    }

    validate(args: string[]): boolean {
        if (args.length !== 3) {
            console.error('Invalid arguments');
            return false;
        }
        if (!args[1].includes('valoper')) {
            console.error('Expected a valoper address, got' + args[1]);
            return false;
        }

        return true;
    }

    async run(args: string[]): Promise<void> {
        const validatorAddress = args[1];
        const apr = args[2];

        const ourWallet = await this.account.getAddress();
        const delegators = await this.stakingRestClient.getDelegators(validatorAddress);
        const rewards = this.calculateRewards(delegators, apr);

        const total = rewards.reduce((acc, reward) => acc + reward.amount, 0);
        console.log('Total rewards to pay: ', total);
        if (total < 0.0001) {
            throw new Error('Total reward is too small, aborting');
        }
        const currentFunds = parseFloat((await this.cosmjs.getWalletBalance()).amount);
        if (total > currentFunds) {
            throw new Error(`Not enough funds "${currentFunds}" to pay ${total} in rewards, aborting`);
        }

        const batchSize = 20;
        for (let i = 0; i < rewards.length; i += batchSize) {
            const batch = rewards.slice(i, i + batchSize);
            const messages = batch.map(reward => {
                console.log('Paying reward to', reward.delegatorAddress, reward.amount);
                return SendMessage.pay(ourWallet, reward.delegatorAddress, reward.amount, this.chain.denom);
            });
            let messagesSent = false;
            while(!messagesSent) {
                try {
                    await this.sendMessages(messages);
                    messagesSent = true;
                } catch (e) {
                    console.error(e);
                    console.log('Waiting 10 second before retrying...');
                    await sleep(10000);
                }
            }
        }
    }

    calculateRewards(delegations: Delegation[], apr: string): Reward[] {
        return delegations.map(delegation => {
            return {
                delegatorAddress: delegation.delegator_address,
                amount: parseFloat(delegation.delegation) * (parseFloat(apr)/100) / 365
            }
        });
    }

    async sendMessages(messages: MessageInterface[]): Promise<void>
    {
        const todayDate = new Date();
        const result = await this.cosmjs.sendMessages(messages, 'Tedcrypto.io - Compensation Rewards ' + getDateFormatted(todayDate));

        console.log('Transaction result: ', result, this.getExplorerUrl(result.transaction_hash));
    }

    getExplorerUrl(tx: string): string
    {
        this.chain.explorers.forEach(explorer => {
            if (explorer.kind === 'mintscan') {
                return explorer.url?.replaceAll('${txHash}', tx)
            }
        })

        return this.chain.explorers[0].url?.replaceAll('${txHash}', tx) ?? '';
    }
}