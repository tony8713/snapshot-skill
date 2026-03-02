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

  let space: string, proposal: string, choice: string;

  // Check for CLI arguments
  if (process.argv.length > 2) {
    space = process.argv[2];
    proposal = process.argv[3];
    choice = process.argv[4];
  } else {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'space', message: 'Space ID:', validate: (i) => i.length > 0 },
      { type: 'input', name: 'proposal', message: 'Proposal ID:', validate: (i) => i.length > 0 },
      { type: 'list', name: 'choice', message: 'Choice:', choices: ['for', 'against', 'abstain'] }
    ]);
    space = answers.space;
    proposal = answers.proposal;
    choice = answers.choice;
  }

  const wallet = new Wallet(PRIVATE_KEY);
  console.log(`Wallet: ${wallet.address}`);

  const choiceNum = choice === 'for' ? Choice.For : choice === 'against' ? Choice.Against : Choice.Abstain;

  const client = new clients.OffchainEthereumSig({
    networkConfig: offchainMainnet,
    rpc: ETH_RPC,
    ipfs: 'https://ipfs.fleek.co/ipfs/'
  });

  console.log(`Voting ${choice} on ${proposal} in ${space}...`);

  const result = await client.vote({
    signer: wallet,
    data: { space, proposal, choice: choiceNum, type: 'single-choice', privacy: 'none', app: 'snapshot', from: wallet.address, reason: '' }
  });

  const sendResult = await client.send(result);
  console.log('✅ Vote submitted!', sendResult.id);
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
