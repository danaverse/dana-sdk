// import {
//   DANA_VOTE_DOWN,
//   DANA_VOTE_TYPE_HASH,
//   DANA_VOTE_TYPE_ID,
//   DANA_VOTE_UP,
//   voteCreate
// } from '@dana-protocols/core';
// import { ChronikClient } from 'chronik-client';
// import { PrivateKey, Transaction } from 'ecash-lib';

export async function createVote(options: {
  direction: string;
  type: string;
  voteFor: string;
  amount: string;
  voteById?: string;
  key?: string;
}) {
  const { direction, type, voteFor, amount, voteById, key } = options;

  // Validate input
  // if (direction !== 'up' && direction !== 'down') {
  //   console.error('Invalid direction. Must be either "up" or "down".');
  //   return;
  // }
  //
  // if (type !== 'id' && type !== 'hash') {
  //   console.error('Invalid type. Must be either "id" or "hash".');
  //   return;
  // }
  //
  // const voteDirection = direction === 'up' ? DANA_VOTE_UP : DANA_VOTE_DOWN;
  // const voteType = type === 'id' ? DANA_VOTE_TYPE_ID : DANA_VOTE_TYPE_HASH;
  //
  // // Generate vote data
  // const voteData = voteCreate(0, {
  //   direction: voteDirection,
  //   type: voteType,
  //   voteFor,
  //   amount,
  //   voteById
  // });
  //
  // // Create and sign transaction
  // const privateKey = key ? PrivateKey.fromWIF(key) : PrivateKey.fromRandom();
  // const address = privateKey.toAddress().toString();
  //
  // const chronik = new ChronikClient(
  //   process.env.CHRONIK_URL || 'https://chronik.be.cash/xpi'
  // );
  // const utxos = await chronik.address(address).utxos();
  //
  // if (utxos.length === 0) {
  //   console.error('No UTXOs found. Please fund the address:', address);
  //   return;
  // }
  //
  // const tx = new Transaction()
  //   .from(utxos)
  //   .addOutput(
  //     new Transaction.Output({
  //       script: Transaction.Script.buildDataOut(voteData),
  //       satoshis: 0
  //     })
  //   )
  //   .change(address)
  //   .sign(privateKey);
  //
  // // Broadcast transaction
  // try {
  //   const txid = await chronik.broadcastTx(tx.toString());
  //   console.log('Vote created successfully!');
  //   console.log('Transaction ID:', txid);
  // } catch (error) {
  //   console.error('Error broadcasting transaction:', error);
  // }
}
