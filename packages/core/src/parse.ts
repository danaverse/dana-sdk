import { Tx } from 'chronik-client';
import { consume, consumeNextPush } from 'ecash-script';
import { opReturn } from './constants/op_return';
import { EmppParseSectionResult } from './empp';
import { DANA_ID_TYPES, DanaId, DanaIdType } from './identity/dana-identity';
import { swapEndianness } from './utils';
import {
  DANA_VOTE_TYPE_HASH,
  DANA_VOTE_TYPE_ID,
  DanaVote,
  DanaVoteDirection,
  DanaVoteForType
} from './vote/dana-vote';

/**
 * Parse a transaction and extract Dana Identity and Dana Vote information.
 * @param {Tx} tx - The transaction object to parse.
 * @returns {EmppParseSectionResult[]} An array of parsed sections containing Dana Identity and Dana Vote information.
 */
export function parseTx(tx: Tx): EmppParseSectionResult[] {
  const { outputs } = tx;
  let results: EmppParseSectionResult[] = [];

  // Iterate over outputs to check for OP_RETURN msgs
  for (const output of outputs) {
    const { outputScript } = output;
    if (outputScript.startsWith(opReturn.opReturnPrefix)) {
      const sectionResults = parseOpReturn(outputScript.slice(2));
      results = results.concat(sectionResults);
    }
  }

  return results;
}

/**
 * Parse the OP_RETURN data of a transaction and extract Dana Identity and Dana Vote information.
 * @param {string} opReturnHex - The hexadecimal string of the OP_RETURN data.
 * @returns {EmppParseSectionResult[]} An array of parsed sections containing Dana Identity and Dana Vote information.
 */
export function parseOpReturn(opReturnHex: string): EmppParseSectionResult[] {
  // Get array of pushes
  let stack = { remainingHex: opReturnHex };
  let stackArray: string[] = [];
  while (stack.remainingHex.length > 0) {
    const { data } = consumeNextPush(stack);
    if (data !== '') {
      stackArray.push(data);
    }
  }

  // Get the protocolIdentifier, the first push
  const protocolIdentifier = stackArray[0];

  // Test for other known apps with known msg processing methods
  switch (protocolIdentifier) {
    case opReturn.opReserved: {
      // Parse for empp OP_RETURN
      return parseMultipushStack(stackArray);
    }
    default: {
      // If you do not recognize the protocol identifier, return an empty array
      return [];
    }
  }
}

/**
 * Parse an empp stack
 * @param {string[]} emppStackArray - An array containing a hex string for every push of this memo OP_RETURN outputScript
 * @returns {EmppParseSectionResult[]} An array of parsed sections containing Dana Identity and Dana Vote information
 */
export function parseMultipushStack(
  emppStackArray: string[]
): EmppParseSectionResult[] {
  let results: EmppParseSectionResult[] = [];

  // Start at i=1 because emppStackArray[0] is OP_RESERVED
  for (let i = 1; i < emppStackArray.length; i += 1) {
    if (emppStackArray[i].slice(0, 8) === opReturn.knownApps.danaId.prefix) {
      const idResult = parseDanaIdSection(emppStackArray[i].slice(8));
      if (idResult) {
        results.push(idResult);
      }
    } else if (
      emppStackArray[i].slice(0, 8) === opReturn.knownApps.danaVote.prefix
    ) {
      const voteResult = parseDanaVoteSection(emppStackArray[i].slice(8));
      if (voteResult) {
        results.push(voteResult);
      }
    }
  }

  return results;
}

/**
 * Parse dana identity empp section
 * @param {string} danaIdPush a string of hex characters in an empp tx representing an danaId push
 * @returns {DanaId} The dana identity object
 */
export function parseDanaIdSection(
  danaIdPush: string
): EmppParseSectionResult | undefined {
  let stack = { remainingHex: danaIdPush };

  // Read the version byte
  const version = consume(stack, 1);

  if (version !== '00') {
    throw 'Unsupported version';
  }

  const sectionBytesLength = parseInt(consume(stack, 1), 16);

  const sectionType = Buffer.from(
    consume(stack, sectionBytesLength),
    'hex'
  ).toString('utf8');

  const DANA_ID_BYTES_LENGTH = 32;

  // Parsing differs depending on section type
  switch (sectionType) {
    case 'GENESIS': {
      // Parse the section 'GENESIS'
      const type = parseInt(consume(stack, 1), 16);
      // check type is in DANA_ID_TYPES
      if (!DANA_ID_TYPES.includes(type)) {
        throw 'Invalid type';
      }
      const danaIdType = type as DanaIdType;

      const namespaceBytesLength = parseInt(consume(stack, 1), 16);
      if (namespaceBytesLength <= 0 || namespaceBytesLength > 15) {
        throw 'Invalid namespace';
      }
      const namespace = Buffer.from(
        consume(stack, namespaceBytesLength),
        'hex'
      ).toString('utf8');

      const nameBytesLength = parseInt(consume(stack, 1), 16);
      if (nameBytesLength <= 0 || nameBytesLength > 21) {
        throw 'Invalid namespace';
      }
      const name = Buffer.from(consume(stack, nameBytesLength), 'hex').toString(
        'utf8'
      );

      const authPubkeyBytesLength = parseInt(consume(stack, 1), 16);
      const authPubkey =
        authPubkeyBytesLength > 0
          ? Buffer.from(consume(stack, nameBytesLength), 'hex').toString('utf8')
          : '';

      const danaId: DanaId = {
        namespace,
        name,
        authPubkey,
        type: danaIdType
      };

      return {
        app: opReturn.knownApps.danaId.app,
        subType: opReturn.knownApps.danaId.subTypes.genesis,
        data: danaId
      };
    }
    case 'SEND': {
      // Parse the section 'SEND'
      const handleId = swapEndianness(consume(stack, DANA_ID_BYTES_LENGTH));
      return {
        app: opReturn.knownApps.danaId.app,
        subType: opReturn.knownApps.danaId.subTypes.send,
        data: handleId
      };
    }
    case 'BURN': {
      // Parse the section 'SEND'
      const handleId = swapEndianness(consume(stack, DANA_ID_BYTES_LENGTH));
      return {
        app: opReturn.knownApps.danaId.app,
        subType: opReturn.knownApps.danaId.subTypes.burn,
        data: handleId
      };
    }
  }
}

export function parseDanaVoteSection(
  danaVotePush: string
): EmppParseSectionResult | undefined {
  let stack = { remainingHex: danaVotePush };

  // Read the version byte
  const version = consume(stack, 1);

  if (version !== '00') {
    throw 'Unsupported version';
  }

  // Read the direction byte
  const direction: DanaVoteDirection = parseInt(consume(stack, 1), 16) ? 1 : 0;

  // Read the voteById if present
  let voteById = undefined;
  const voteByIdLength = parseInt(consume(stack, 1), 16);
  if (voteByIdLength !== 0 && voteByIdLength !== 32) {
    throw 'Unsupported vote by';
  }
  voteById = voteByIdLength === 32 ? swapEndianness(consume(stack, 32)) : '';

  // Read the type byte
  const danaVoteForType: DanaVoteForType = parseInt(
    consume(stack, 1),
    16
  ) as DanaVoteForType;

  // Read the voteFor
  let voteFor;
  if (danaVoteForType === DANA_VOTE_TYPE_ID) {
    voteFor = swapEndianness(consume(stack, 32)); // Assuming 32 bytes for ID
  } else if (danaVoteForType === DANA_VOTE_TYPE_HASH) {
    voteFor = swapEndianness(consume(stack, 32)); // Assuming 32 bytes for hash
  } else {
    throw 'Unsupported dana vote type';
  }

  // Read the amount, which is 6 bytes
  const amountHex = consume(stack, 6);
  const amount = BigInt(`0x${amountHex}`);

  const danaVote: DanaVote = {
    direction,
    type: danaVoteForType,
    voteFor,
    amount: amount.toString(),
    voteById
  };

  return {
    app: opReturn.knownApps.danaVote.app,
    subType: opReturn.knownApps.danaId.subTypes.burn,
    data: danaVote
  };
}
