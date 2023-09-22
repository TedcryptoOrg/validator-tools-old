import {Chain, CosmosDirectory} from "@tedcryptoorg/cosmos-directory";
import axios from "axios";

export type Delegation = {
    delegator_address: string,
    validator_address: string,
    delegation: string
}

export class StakingRestClient {
    private readonly restAddress: string;

    public constructor(
        private readonly chain: Chain,
        restAddress: string|undefined = undefined
    ) {
        this.restAddress = restAddress ? restAddress : new CosmosDirectory().restUrl(chain.chain_name);
    }

    async getDelegators(validatorAddress: string): Promise<Delegation[]> {
        const url = `${this.restAddress}/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations`;
        console.log('Fetching delegations... ', url);

        const response = await axios.get(
            url,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status !== 200) {
            console.error(response)
            throw new Error('Error getting delegations, got response' + response.status);
        }

        return response.data.delegation_responses.map(
            (delegation: any): Delegation => {
                return {
                    delegator_address: delegation.delegation.delegator_address,
                    validator_address: delegation.delegation.validator_address,
                    delegation: delegation.balance.amount
                }
            }
        );
    }
}