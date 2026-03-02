import { Wallet } from 'ethers';
import { clients, Choice, offchainMainnet } from '@snapshot-labs/sx';
import 'dotenv/config';

const PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY;

async function vote() {
  const wallet = new Wallet(PRIVATE_KEY);
  console.log('Wallet:', wallet.address);

  const client = new clients.OffchainEthereumSig({
    networkConfig: offchainMainnet,
    rpc: 'https://rpc.ankr.com/eth',
    ipfs: 'https://ipfs.fleek.co/ipfs/'
  });

  const result = await client.vote({
    signer: wallet,
    data: {
      space: 'shapeshiftdao.eth',
      proposal: '0xe9de333ae5f22451bbc0e57cfca351b305d500967f1f6849d34fe666b52ccd51',
      choice: 1,
      type: 'single-choice',
      privacy: 'shutter',  // Shutter privacy
      app: 'snapshot',
      from: wallet.address,
      reason: ''
    }
  });

  console.log('Signed, sending...');
  const sendResult = await client.send(result);
  console.log('Result:', JSON.stringify(sendResult, null, 2));
}

vote();
