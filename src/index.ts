#!/usr/bin/env bun
import { Command } from 'commander';
import { Wallet } from 'ethers';
import { clients, Choice, offchainMainnet } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const ETH_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';

const program = new Command();

program
  .name('snapshot-vote')
  .description('Vote on Snapshot proposals using @snapshot-labs/sx')
  .version('1.0.0');

program
  .command('vote')
  .description('Cast a vote on a Snapshot proposal')
  .requiredOption('-s, --space <space>', 'Space ID (e.g., snapshot.eth)')
  .requiredOption('-p, --proposal <proposal>', 'Proposal ID')
  .requiredOption('-c, --choice <choice>', 'Choice (for/against/abstain or number)')
  .option('-r, --reason <reason>', 'Vote reason')
  .action(async (options) => {
    if (!PRIVATE_KEY) {
      console.error('Error: SNAPSHOT_PRIVATE_KEY not set in .env');
      process.exit(1);
    }

    try {
      const wallet = new Wallet(PRIVATE_KEY);
      console.log(`Wallet: ${wallet.address}`);

      // Convert choice to number
      let choiceNum: number;
      const choice = options.choice.toLowerCase();
      if (choice === 'for' || choice === 'yes') {
        choiceNum = Choice.For;
      } else if (choice === 'against' || choice === 'no') {
        choiceNum = Choice.Against;
      } else if (choice === 'abstain') {
        choiceNum = Choice.Abstain;
      } else {
        choiceNum = parseInt(options.choice, 10) || Choice.For;
      }

      const client = new clients.OffchainEthereumSig({
        networkConfig: offchainMainnet,
        rpc: ETH_RPC,
        ipfs: 'https://ipfs.fleek.co/ipfs/'
      });

      console.log(`Voting ${options.choice} on proposal ${options.proposal} in ${options.space}...`);

      const result = await client.vote({
        signer: wallet,
        data: {
          space: options.space,
          proposal: options.proposal,
          choice: choiceNum,
          type: 'single-choice',
          privacy: 'none',
          app: 'snapshot',
          from: wallet.address,
          reason: options.reason || ''
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
  });

program.parse();
