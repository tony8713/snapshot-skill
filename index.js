// Snapshot Skill - Vote on Snapshot proposals using snapshot.js
import { Wallet } from 'ethers';
import snapshot from '@snapshot-labs/snapshot.js';
import dotenv from 'dotenv';
dotenv.config();

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;
const SNAPSHOT_URL = process.env.SNAPSHOT_URL || 'https://hub.snapshot.org';

/**
 * Cast a vote on a Snapshot proposal
 * @param {Object} input - Vote parameters
 * @param {string} input.space - Space ID (e.g., 'snapshot.eth')
 * @param {string} input.proposal - Proposal ID
 * @param {string} input.choice - Choice (e.g., 'for', 'against', 'abstain' or number)
 * @param {string} input.reason - Optional reason comment
 * @returns {Object} Result with tx hash
 */
export default async function vote(input) {
  if (!PRIVATE_KEY) {
    return { ok: false, error: 'SNAPSHOT_PRIVATE_KEY not set in .env' };
  }

  const { space, proposal, choice, reason = '' } = input;

  if (!space || !proposal || !choice) {
    return { ok: false, error: 'Missing required fields: space, proposal, choice' };
  }

  try {
    const wallet = new Wallet(PRIVATE_KEY);
    console.log(`Wallet: ${wallet.address}`);

    // Prepare vote message
    const voteMessage = {
      space,
      proposal,
      choice: typeof choice === 'string' ? choice : String(choice),
      metadata: JSON.stringify({ voting_power: '1', reason })
    };

    // Sign the vote message
    const domain = {
      name: 'snapshot',
      version: '0.1.4',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    };

    const types = {
      Vote: [
        { name: 'space', type: 'string' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'uint32' },
        { name: 'metadata', type: 'string' }
      ]
    };

    // Convert choice to number if it's a string
    let choiceNum;
    if (typeof choice === 'number') {
      choiceNum = choice;
    } else if (choice === 'for' || choice === 'yes') {
      choiceNum = 1;
    } else if (choice === 'against' || choice === 'no') {
      choiceNum = 2;
    } else if (choice === 'abstain') {
      choiceNum = 3;
    } else {
      choiceNum = parseInt(choice, 10) || 1;
    }

    const signedMessage = await wallet.signTypedData(domain, types, {
      space,
      proposal,
      choice: choiceNum,
      metadata: voteMessage.metadata
    });

    // Submit vote via snapshot.js
    const result = await snapshot.utils.submitVote(SNAPSHOT_URL, {
      space,
      proposal,
      choice: choiceNum,
      metadata: voteMessage.metadata,
      signature: signedMessage
    });

    return {
      ok: true,
      message: `Vote submitted successfully!`,
      vote: voteMessage,
      result
    };
  } catch (error) {
    return { ok: false, error: error.message, stack: error.stack };
  }
}

// Allow direct execution
if (process.argv[1]?.includes('index.js')) {
  const args = JSON.parse(process.argv[2] || '{}');
  vote(args).then(console.log);
}
