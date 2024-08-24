import BigNumber from 'bignumber.js';
import { Tx } from 'chronik-client';
import { consume, consumeNextPush } from 'ecash-script';
import { opReturn } from './constants/op_return';
import { bigNumberAmountToLocaleString, swapEndianness } from './utils';
import { DANA_ID_TYPES, DanaId, DanaIdType } from './identity/dana-identity';

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

export function parseOpReturn(opReturnHex: string) {
  // TODO
  // Initialize required vars
  let app;
  let msg;
  let tokenId = false;

  // Get array of pushes
  let stack = { remainingHex: opReturnHex };
  let stackArray: string[] = [];
  while (stack.remainingHex.length > 0) {
    const { data } = consumeNextPush(stack);
    if (data !== '') {
      // You may have an empty push in the middle of a complicated tx for some reason
      // Mb some libraries erroneously create these
      // e.g. https://explorer.e.cash/tx/70c2842e1b2c7eb49ee69cdecf2d6f3cd783c307c4cbeef80f176159c5891484
      // has 4c000100 for last characters. 4c00 is just nothing.
      // But you want to know 00 and have the correct array index
      stackArray.push(data);
    }
  }

  // Get the protocolIdentifier, the first push
  const protocolIdentifier = stackArray[0];

  // Test for other known apps with known msg processing methods
  switch (protocolIdentifier) {
    case opReturn.opReserved: {
      // Parse for empp OP_RETURN
      // Spec https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/chronik/bitcoinsuite-slp/src/empp/mod.rs
      return parseMultipushStack(stackArray);
    }
    default: {
      // If you do not recognize the protocol identifier, just print the pushes in hex
      // If it is an app or follows a pattern, can be added later
      app = 'unknown';

      break;
    }
  }

  return { app };

}

/**
 * Parse an empp stack
 * @param {array} emppStackArray an array containing a hex string for every push of this memo OP_RETURN outputScript
 * @returns {object} {app, msg} used to compose a useful telegram msg describing the transaction
 */
export function parseMultipushStack(emppStackArray: string[]) {

  // Parsing empp txs will require specific rules depending on the type of tx
  let msgs = [];

  // Start at i=1 because emppStackArray[0] is OP_RESERVED
  for (let i = 1; i < emppStackArray.length; i += 1) {
    if (
      emppStackArray[i].slice(0, 8) === opReturn.knownApps.danaId.prefix
    ) {
      const thisMsg = parseDanaId(
        emppStackArray[i].slice(8),
      );
      msgs.push(`${opReturn.knownApps.danaId.app}:${thisMsg}`);
    } else if (
      emppStackArray[i].slice(0, 8) === opReturn.knownApps.danaVote.prefix
    ) {
      const thisMsg = parseDanaId(
        emppStackArray[i].slice(8),
      );
      msgs.push(`${opReturn.knownApps.danaVote.app}:${thisMsg}`);
    } else {
      // Since we don't know any spec or parsing rules for other types of EMPP pushes,
      // Just add an ASCII decode of the whole thing if you see one
      msgs.push(
        `${'Unknown App:'}${Buffer.from(
          emppStackArray[i],
          'hex',
        ).toString('ascii')}`,
      );
    }
  }
}


/**
* Parse dana identity
 * @param {string} danaIdPush a string of hex characters in an empp tx representing an danaId push
 * @returns {DanaId} The dana identity object
 */
export function parseDanaId(danaIdPush: string): DanaId {
  let stack = { remainingHex: danaIdPush };

  // Read the version byte
  const version = consume(stack, 1);

  if (version !== '00') {
    throw 'Unsupported version';
  }

  const sectionBytesLength = parseInt(consume(stack, 1), 16);

  const sectionType = Buffer.from(
    consume(stack, sectionBytesLength),
    'hex',
  ).toString('utf8');

  const DANA_ID_BYTES_LENGTH = 32;

  // Parsing differs depending on section type
  switch (sectionType) {
    case 'GENESIS': {
      // Parse the section 'GENESIS'
      const type  = parseInt(consume(stack, 1), 16);
      // check type is in DANA_ID_TYPES
      if (!DANA_ID_TYPES.includes(type)) {
        throw 'Invalid type';
      }
      const danaType = type as DanaIdType;

      const namespaceBytesLength = parseInt(consume(stack, 1), 16);
      if (namespaceBytesLength <= 0 || namespaceBytesLength > 15) {
        throw 'Invalid namespace';
      }
      const namespace = Buffer.from(
        consume(stack, namespaceBytesLength),
        'hex',
      ).toString('utf8');

      const nameBytesLength = parseInt(consume(stack, 1), 16);
      if (nameBytesLength <= 0 || nameBytesLength > 21) {
        throw 'Invalid namespace';
      }
      const name = Buffer.from(
        consume(stack, nameBytesLength),
        'hex',
      ).toString('utf8');

      const authPubkeyBytesLength = parseInt(consume(stack, 1), 16);
      const authPubkey = authPubkeyBytesLength > 0 ? Buffer.from(
        consume(stack, nameBytesLength),
        'hex',
      ).toString('utf8') : '';

      const danaId: DanaId = {
        namespace,
        name,
        authPubkey,
        type: danaType
      };

      return danaId;
    }
    case 'SEND': {
      // Parse the section 'SEND'
    }
  }

}

export function parseDanaVote(danaVotePush: string) {
  // TODO
}

