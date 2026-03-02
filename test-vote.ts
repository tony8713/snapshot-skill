import { Wallet } from 'ethers';
import { clients, offchainMainnet } from '@snapshot-labs/sx';

const wallet = new Wallet('16787e7f171253edfa07ba8ab1ea18ec1291067630a155564ebdd09896a01456');

console.log('Wallet:', wallet.address);

// Use offchainMainnet config explicitly
const client = new clients.OffchainEthereumSig({
  networkConfig: offchainMainnet,
  rpc: 'https://rpc.ankr.com/eth',
  ipfs: 'https://ipfs.fleek.co/ipfs/'
});

console.log('Sequencer URL:', client.sequencerUrl);

const result = await client.vote({
  signer: wallet,
  data: {
    space: 'pistachiodao.eth',
    proposal: '0x38c654c0f81b63ea1839ec3b221fad6ecba474aa0c4e8b4e8bc957f70100e753',
    choice: 1,
    type: 'single-choice',
    privacy: 'none',
    app: 'snapshot',
    from: wallet.address,
    reason: ''
  }
});

console.log('Signed, now sending...');

// Try sending
try {
  const sendResult = await client.send(result);
  console.log('Send result:', sendResult);
} catch (e) {
  console.log('Send error:', e.message);
}
