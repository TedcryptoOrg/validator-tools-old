import {beforeAll, describe, expect, it} from "bun:test";
import {StakingRestClient} from "../../../../src/Service/Cosmos/StakingRestClient.ts";
import {ChainDirectory} from "@tedcryptoorg/cosmos-directory";

describe('StakingRestClient', () => {
    let stakingRestClient: StakingRestClient;

    beforeAll(async () => {
        const chain = (await new ChainDirectory().getChainData('akash')).chain;
        stakingRestClient = new StakingRestClient(chain);
    });

    it('should fetch delegators', async () => {
        const delegators = await stakingRestClient.getDelegators('akashvaloper1u7k6tpyvtw25we4mnu6ld6cjs3p8f0256v7g4z');
        expect(delegators).not.toBe(undefined);
        expect(delegators.find(delegation => delegation.delegator_address === 'akash1g9vuah63u723gkgvkppnfs2kdv7xwzzkvswass')).not.toBe(undefined);
    });
});