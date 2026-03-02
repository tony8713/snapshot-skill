#!/usr/bin/env bun
import { Wallet } from 'ethers';
import { clients, Choice, offchainMainnet } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const ETH_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';

// Simple CLI: snapshot-vote <space> <proposal> <choice>
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: snapshot-vote <space> <proposal> <choice>');
  console.log('Example: snapshot-vote pistachiodao.eth 0x123 for');
  process.exit(1);
}

const [space, proposal, choiceStr] = args;
const choice = choiceStr.toLowerCase();

async function main() {
  if (!PRIVATE_KEY) {
    console.error('Error: SNAPSHOT_PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  try {
    const wallet = new Wallet(PRIVATE_KEY);
    console.log(`Wallet: ${wallet.address}`);

    // Convert choice to number
    let choiceNum: number;
    if (choice === 'for' || choice === 'yes') {
      choiceNum = Choice.For;
    } else if (choice === 'against' || choice === 'no') {
      choiceNum = Choice.Against;
    } else if (choice === 'abstain') {
      choiceNum = Choice.Abstain;
    } else {
      choiceNum = parseInt(choice, 10) || Choice.For;
    }

    const client = new clients.OffchainEthereumSig({
      networkConfig: offchainMainnet,
      rpc: ETH_RPC,
      ipfs: 'https://ipfs.fleek.co/ipfs/'
    });

    console.log(`Voting ${choice} on proposal ${proposal} in ${space}...`);

    const result = await client.vote({
      signer: wallet,
      data: {
        space,
        proposal,
        choice: choiceNum,
        type: 'single-choice',
        privacy: 'none',
        app: 'snapshot',
        from: wallet.address,
        reason: ''
      }
    });

    const sendResult = await client.send(result);
    console.log('Vote submitted successfully!');
    console.log('Vote ID:', sendResult.id);
    console.log('IPFS:', sendResult.ipfs);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
