#!/usr/bin/env bun
import inquirer from 'inquirer';
import { Wallet } from 'ethers';
import { clients, Choice, offchainMainnet } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const ETH_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';

async function main() {
  if (!PRIVATE_KEY) {
    console.error('Error: SNAPSHOT_PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'space',
      message: 'Space ID (e.g., pistachiodao.eth):',
      validate: (input) => input.length > 0
    },
    {
      type: 'input',
      name: 'proposal',
      message: 'Proposal ID:',
      validate: (input) => input.length > 0
    },
    {
      type: 'list',
      name: 'choice',
      message: 'Choice:',
      choices: ['for', 'against', 'abstain']
    }
  ]);

  const wallet = new Wallet(PRIVATE_KEY);
  console.log(`\nWallet: ${wallet.address}`);

  // Convert choice
  let choiceNum: number;
  if (answers.choice === 'for') {
    choiceNum = Choice.For;
  } else if (answers.choice === 'against') {
    choiceNum = Choice.Against;
  } else {
    choiceNum = Choice.Abstain;
  }

  const client = new clients.OffchainEthereumSig({
    networkConfig: offchainMainnet,
    rpc: ETH_RPC,
    ipfs: 'https://ipfs.fleek.co/ipfs/'
  });

  console.log(`Voting ${answers.choice} on proposal ${answers.proposal} in ${answers.space}...`);

  const result = await client.vote({
    signer: wallet,
    data: {
      space: answers.space,
      proposal: answers.proposal,
      choice: choiceNum,
      type: 'single-choice',
      privacy: 'none',
      app: 'snapshot',
      from: wallet.address,
      reason: ''
    }
  });

  const sendResult = await client.send(result);
  console.log('\n✅ Vote submitted successfully!');
  console.log('Vote ID:', sendResult.id);
  console.log('IPFS:', sendResult.ipfs);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
