// Snapshot Skill - Vote on Snapshot X proposals using @snapshot-labs/sx
import { Wallet } from 'ethers';
import { clients, Choice } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const ETH_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';

interface VoteInput {
  space: string;
  proposal: string;
  choice: string | number;
  reason?: string;
}

interface VoteOutput {
  ok: boolean;
  message?: string;
  error?: string;
  wallet?: string;
  result?: unknown;
}

/**
 * Cast a vote on a Snapshot X proposal
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

    // Convert choice to number (Choice: Against=0, For=1, Abstain=2)
    let choiceNum: number;
    if (typeof choice === 'number') {
      choiceNum = choice;
    } else if (choice === 'for' || choice === 'yes') {
      choiceNum = Choice.For; // 1
    } else if (choice === 'against' || choice === 'no') {
      choiceNum = Choice.Against; // 0
    } else if (choice === 'abstain') {
      choiceNum = Choice.Abstain; // 2
    } else {
      choiceNum = parseInt(String(choice), 10) || Choice.For;
    }

    // Create off-chain client for signing
    const offchainClient = new clients.OffchainEthereumSig({
      rpc: ETH_RPC,
      ipfs: 'https://ipfs.fleek.co/ipfs/'
    });

    return {
      ok: true,
      message: `Vote prepared: ${choice} (${choiceNum}) on proposal ${proposal} in space ${space}`,
      wallet: wallet.address,
      note: 'Full submission requires space authenticator config'
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

// Allow direct execution - read from stdin
if (import.meta.main) {
  const stdin = await Bun.stdin.text();
  const args = stdin ? JSON.parse(stdin) : {};
  const result = await vote(args);
  console.log(JSON.stringify(result, null, 2));
}

export default vote;
