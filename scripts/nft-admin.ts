import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';

async function createCollection() {
  const provider = new WsProvider('wss://paseo-rpc.dwellir.com');
  const api = await ApiPromise.create({ provider });
  
  const keyring = new Keyring({ type: 'sr25519' });
  const admin = keyring.addFromUri('//Alice'); // Your admin account
  
  // Create collection 
  const createTx = api.tx.nfts.create(admin.address, { settings: 0 });
  const hash = await createTx.signAndSend(admin);
  
  console.log('Collection created:', hash.toString());
  
  // Set collection metadata
  const metadataTx = api.tx.nfts.setCollectionMetadata(0, 'ipfs://your_collection_metadata_cid');
  await metadataTx.signAndSend(admin);
  
  await api.disconnect();
}