# validator-tools

This repo is a mix of validator tools that help on the day to day
tasks. The plan is to keep adding commands/tools that will help you
on your job as a validator.

## Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts <command> <args>
```

This project was created using `bun init` in bun v1.0.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Wallet

We encrypt the wallet using the key manager located in `scripts/key_manager.ts`.

To create and encrypt a wallet you need to

```bash
bun run scripts/key_manager.ts create <chain_name>
```

It will ask for a password, please keep the password with you at all times.
The password will decrypt the file and reveal the mnemonic.

Always create new wallets for these scripts and deposit funds when you need.

## Commands

### Pay rewards

This command allow validators to pay rewards to their delegators.
You can use it as a marketing tool or when something happens like a jail event. You could compensate your delegators
by paying their rewards back.

The following example will pay 9% APR to the delegators of Tedcrypto.io.

```bash
WALLET_PASSWORD=<your password> bun run index.ts payRewards akash akashvaloper1u7k6tpyvtw25we4mnu6ld6cjs3p8f0256v7g4z 9
```