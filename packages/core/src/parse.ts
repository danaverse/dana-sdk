import { Tx } from 'chronik-client';

export function parseTx(tx: Tx) {

  /* Parse an lotus tx as returned by chronik for newsworthy information
   * returns
   * { txid, genesisInfo, opReturnInfo }
   */

  const { txid, inputs, outputs } = tx;

  let isTokenTx = false;
  let genesisInfo = false;
  let opReturnInfo = false;


  let tokenSendInfo = false;
  let tokenSendingOutputScripts = new Set();
  let tokenReceivingOutputs = new Map();
  let tokenChangeOutputs = new Map();
  let undecimalizedTokenInputAmount = new BigNumber(0);

}
