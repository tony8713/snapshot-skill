import { init, encrypt } from '@shutter-network/shutter-crypto';
import { readFileSync } from 'fs';
import { Wallet } from 'ethers';

const PROPOSAL_ID = '0xe9de333ae5f22451bbc0e57cfca351b305d500967f1f6849d34fe666b52ccd51';

async function main() {
  // Load WASM from local file
  const wasmPath = './node_modules/@shutter-network/shutter-crypto/dist/shutter-crypto.wasm';
  const wasmBinary = readFileSync(wasmPath);
  
  await init(wasmBinary);
  console.log('Shutter initialized');
  
  const wallet = new Wallet('16787e7f171253edfa07ba8ab1ea18ec1291067630a155564ebdd09896a01456');
  console.log('Wallet:', wallet.address);

  // Encrypt choice = 1 (For)
  const choice = 1;
  const encrypted = await encrypt(PROPOSAL_ID, choice);
  console.log('Encrypted choice:', encrypted);
}

main().catch(console.error);
