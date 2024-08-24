import BigNumber from 'bignumber.js';
import { Tx } from 'chronik-client';
import { consume, consumeNextPush } from 'ecash-script';
import { opReturn } from './constants/op_return';
import { bigNumberAmountToLocaleString, swapEndianness } from './utils';

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
      return module.exports.parseMultipushStack(stackArray);
    }
    case opReturn.knownApps.alias.prefix: {
      app = opReturn.knownApps.alias.app;
      /*
      For now, parse and render alias txs by going through OP_RETURN
      When aliases are live, refactor to use alias-server for validation
      <protocolIdentifier> <version> <alias> <address type + hash>

      Only parse the msg if the tx is constructed correctly
      */
      msg =
        stackArray.length === 4 && stackArray[1] === '00'
          ? prepareStringForTelegramHTML(
            Buffer.from(stackArray[2], 'hex').toString(
              'utf8',
            ),
          )
          : 'Invalid alias registration';

      break;
    }
    case opReturn.knownApps.airdrop.prefix: {
      app = opReturn.knownApps.airdrop.app;

      // Initialize msg as empty string. Need tokenId info to complete.
      msg = '';

      // Airdrop tx has structure
      // <prefix> <tokenId>

      // Cashtab allows sending a cashtab msg with an airdrop
      // These look like
      // <prefix> <tokenId> <cashtabMsgPrefix> <msg>
      if (stackArray.length >= 2 && stackArray[1].length === 64) {
        tokenId = stackArray[1];
      }
      break;
    }
    case opReturn.knownApps.cashtabMsg.prefix: {
      app = opReturn.knownApps.cashtabMsg.app;
      // For a Cashtab msg, the next push on the stack is the Cashtab msg
      // Cashtab msgs use utf8 encoding

      // Valid Cashtab Msg
      // <protocol identifier> <msg in utf8>
      msg =
        stackArray.length >= 2
          ? prepareStringForTelegramHTML(
            Buffer.from(stackArray[1], 'hex').toString(
              'utf8',
            ),
          )
          : `Invalid ${app}`;
      break;
    }
    case opReturn.knownApps.cashtabMsgEncrypted.prefix: {
      app = opReturn.knownApps.cashtabMsgEncrypted.app;
      // For an encrypted cashtab msg, you can't parse and display the msg
      msg = '';
      // You will add info about the tx when you build the msg
      break;
    }
    case opReturn.knownApps.fusionLegacy.prefix:
    case opReturn.knownApps.fusion.prefix: {
      /**
       * Cash Fusion tx
       * <protocolIdentifier> <sessionHash>
       * https://github.com/cashshuffle/spec/blob/master/CASHFUSION.md
       */
      app = opReturn.knownApps.fusion.app;
      // The session hash is not particularly interesting to users
      // Provide tx info in telegram prep function
      msg = '';
      break;
    }
    case opReturn.knownApps.swap.prefix: {
      // Swap txs require special parsing that should be done in getSwapTgMsg
      // We may need to get info about a token ID before we can
      // create a good msg
      app = opReturn.knownApps.swap.app;
      msg = '';

      if (
        stackArray.length >= 3 &&
        stackArray[1] === '01' &&
        stackArray[2] === '01' &&
        stackArray[3].length === 64
      ) {
        // If this is a signal for buy or sell of a token, save the token id
        // Ref https://github.com/vinarmani/swap-protocol/blob/master/swap-protocol-spec.md
        // A buy or sell signal tx will have '01' at stackArray[1] and stackArray[2] and
        // token id at stackArray[3]
        tokenId = stackArray[3];
      }
      break;
    }
    case opReturn.knownApps.payButton.prefix: {
      app = opReturn.knownApps.payButton.app;
      // PayButton v0
      // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/doc/standards/paybutton.md
      // <lokad> <OP_0> <data> <nonce>
      // The data could be interesting, ignore the rest
      if (stackArray.length >= 3) {
        // Version byte is at index 1
        const payButtonTxVersion = stackArray[1];
        if (payButtonTxVersion !== '00') {
          msg = `Unsupported version: 0x${payButtonTxVersion}`;
        } else {
          const dataPush = stackArray[2];
          if (dataPush === '00') {
            // Per spec, PayButton txs with no data push OP_0 in this position
            msg = 'no data';
          } else {
            // Data is utf8 encoded
            msg = prepareStringForTelegramHTML(
              Buffer.from(stackArray[2], 'hex').toString(
                'utf8',
              ),
            );
          }
        }
      } else {
        msg = '[off spec]';
      }
      break;
    }
    case opReturn.knownApps.paywall.prefix: {
      app = opReturn.knownApps.paywall.app;
      // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/doc/standards/op_return-prefix-guideline.md
      // <lokad> <txid of the article this paywall is paying for>
      if (stackArray.length === 2) {
        const articleTxid = stackArray[1];
        if (
          typeof articleTxid === 'undefined' ||
          articleTxid.length !== 64
        ) {
          msg = `Invalid paywall article txid`;
        } else {
          msg = `<a href="${config.blockExplorer}/tx/${articleTxid}">Article paywall payment</a>`;
        }
      } else {
        msg = '[off spec paywall payment]';
      }
      break;
    }
    case opReturn.knownApps.authentication.prefix: {
      app = opReturn.knownApps.authentication.app;
      // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/doc/standards/op_return-prefix-guideline.md
      // <lokad> <authentication identifier>
      if (stackArray.length === 2) {
        const authenticationHex = stackArray[1];
        if (authenticationHex === '00') {
          msg = `Invalid eCashChat authentication identifier`;
        } else {
          msg = 'eCashChat authentication via dust tx';
        }
      } else {
        msg = '[off spec eCashChat authentication]';
      }
      break;
    }
    default: {
      // If you do not recognize the protocol identifier, just print the pushes in hex
      // If it is an app or follows a pattern, can be added later
      app = 'unknown';

      if (containsOnlyPrintableAscii(stackArray.join(''))) {
        msg = prepareStringForTelegramHTML(
          Buffer.from(stackArray.join(''), 'hex').toString(
            'ascii',
          ),
        );
      } else {
        // If you have non-ascii characters, print each push as a hex number
        msg = '';
        for (let i = 0; i < stackArray.length; i += 1) {
          msg += `0x${stackArray[i]} `;
        }
        // Remove the last space
        msg = msg.slice(0, -1);

        // Trim the msg for Telegram to avoid 200+ char msgs
        const unknownMaxChars = 20;
        if (msg.length > unknownMaxChars) {
          msg = msg.slice(0, unknownMaxChars) + '...';
        }
      }

      break;
    }
  }

  return { app, msg, stackArray, tokenId };

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


export function parseDanaId(danaIdPush: string) {
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

  const DANA_ID_BYTES = 32;

  // Parsing differs depending on section type
  switch (sectionType) {
    case 'GENESIS': {
      const danaIdType = parseInt(consume(stack, 1), 16);

      const namespaceBytesLength = parseInt(consume(stack, 1), 16);
      if (namespaceBytesLength <= 0 || namespaceBytesLength > 15) {
        throw 'Invalid namespace';
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
        ).toString('utf8'): '';

        return 

        break;
      }
    }

  }

  export function parseDanaVote(danaVotePush: string) {
    // TODO
  }

