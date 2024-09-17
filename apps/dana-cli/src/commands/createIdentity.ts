import {
  DANA_ID_TYPE_PAGE,
  DANA_ID_TYPE_PROFILE,
  idGenesis
} from '@dana-network/core';
import { ChronikClient } from 'chronik-client';
import { PrivateKey, Transaction } from 'ecash-lib';

export async function createIdentity(options: {
  name: string;
  namespace: string;
  type: string;
  key?: string;
}) {
  const { name, namespace, type, key } = options;

  // Validate input
  if (type !== 'profile' && type !== 'page') {
    console.error('Invalid type. Must be either "profile" or "page".');
    return;
  }

  const idType = type === 'profile' ? DANA_ID_TYPE_PROFILE : DANA_ID_TYPE_PAGE;

  // Generate identity genesis data
  const genesisData = idGenesis(0, {
    name,
    namespace,
    type: idType
  });

  // Create and sign transaction
  const privateKey = key ? PrivateKey.fromWIF(key) : PrivateKey.fromRandom();
  const address = privateKey.toAddress().toString();

  const chronik = new ChronikClient('https://chronik.be.cash/xec');
  const utxos = await chronik.address(address).utxos();

  if (utxos.length === 0) {
    console.error('No UTXOs found. Please fund the address:', address);
    return;
  }

  const tx = new Transaction()
    .from(utxos)
    .addOutput(
      new Transaction.Output({
        script: Transaction.Script.buildDataOut(genesisData),
        satoshis: 0
      })
    )
    .change(address)
    .sign(privateKey);

  // Broadcast transaction
  try {
    const txid = await chronik.broadcastTx(tx.toString());
    console.log('Identity created successfully!');
    console.log('Transaction ID:', txid);
  } catch (error) {
    console.error('Error broadcasting transaction:', error);
  }
}
