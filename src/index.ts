// Snapshot Skill - Vote on Snapshot proposals using @snapshot-labs/sx
import { Wallet } from 'ethers';
import { clients, Choice, offchainMainnet } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const ETH_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';

interface VoteInput {
  space: string;
  proposal: string;
  choice: string | number;
}

interface VoteOutput {
  ok: boolean;
  message?: string;
  error?: string;
  wallet?: string;
  result?: unknown;
}

/**
 * Cast a vote on a Snapshot proposal
 */
export async function vote(input: VoteInput): Promise<VoteOutput> {
  if (!PRIVATE_KEY) {
    return { ok: false, error: 'SNAPSHOT_PRIVATE_KEY not set in .env' };
  }

  const { space, proposal, choice } = input;

  if (!space || !proposal || !choice) {
    return { ok: false, error: 'Missing required fields: space, proposal, choice' };
  }

  try {
    const wallet = new Wallet(PRIVATE_KEY);
    console.log(`Wallet: ${wallet.address}`);

    // Convert choice to number
    let choiceNum: number;
    if (typeof choice === 'number') {
      choiceNum = choice;
    } else if (choice === 'for' || choice === 'yes') {
      choiceNum = Choice.For;
    } else if (choice === 'against' || choice === 'no') {
      choiceNum = Choice.Against;
    } else if (choice === 'abstain') {
      choiceNum = Choice.Abstain;
    } else {
      choiceNum = parseInt(String(choice), 10) || Choice.For;
    }

    // Use offchainMainnet config for classic Snapshot
    const client = new clients.OffchainEthereumSig({
      networkConfig: offchainMainnet,
      rpc: ETH_RPC,
      ipfs: 'https://ipfs.fleek.co/ipfs/'
    });

    // Sign the vote
    const signResult = await client.vote({
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

    console.log('Vote signed, now sending...');

    // Send the vote
    const sendResult = await client.send(signResult);
    console.log('Vote submitted:', sendResult);

    return {
      ok: true,
      message: `Vote submitted successfully!`,
      wallet: wallet.address,
      result: sendResult
    };
  } catch (error: any) {
    console.error('Error:', error.message || error);
    return { ok: false, error: String(error) };
  }
}

// Allow direct execution
if (import.meta.main) {
  const stdin = await Bun.stdin.text();
  const args = stdin ? JSON.parse(stdin) : {};
  const result = await vote(args);
  console.log(JSON.stringify(result, null, 2));
}

export default vote;
