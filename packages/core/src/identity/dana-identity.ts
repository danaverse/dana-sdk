import {
  Writer,
  WriterBytes,
  WriterLength,
  fromHex,
  fromHexRev,
  strToBytes
} from 'ecash-lib';
import { putVarBytes } from '../common';

export const GENESIS = strToBytes('GENESIS');
export const SEND = strToBytes('SEND');
export const BURN = strToBytes('BURN');

/** LOKAD ID for DANA Identity */
export const DANA_ID_LOKAD_ID = strToBytes('DNID');

export const DANA_ID_TYPE_PROFILE = 0;
export const DANA_ID_TYPE_PAGE = 1;
export const DANA_ID_TYPES = [DANA_ID_TYPE_PROFILE, DANA_ID_TYPE_PAGE];
export type DanaIdType = typeof DANA_ID_TYPE_PROFILE | typeof DANA_ID_TYPE_PAGE;

export interface DanaId {
  namespace: string;
  name: string;
  type: DanaIdType;
  authPubkey?: string;
}

/** Genesis info found in GENESIS txs of tokens */
export interface GenesisInfo {
  /** name of the id */
  name: string;
  /** type of the id: profile or page */
  type: DanaIdType;
  /** namespace of the id */
  namespace: string;
  /** auth_pubkey of the token (only on ALP) */
  authPubkey?: string;
}

/**
 * Build an Id Handle GENESIS pushdata.
 *
 * @param version - The version number of the identity protocol.
 * @param genesisInfo - An object containing the genesis information.
 * @returns A Uint8Array representing the Id Handle GENESIS pushdata.
 */
export function idGenesis(
  version: number,
  genesisInfo: GenesisInfo
): Uint8Array {
  // Verify the version number
  verifyVersion(version);

  // Verify the type, namespace, and name in the genesisInfo object
  verifyType(genesisInfo.type);
  verifyNamespace(genesisInfo.namespace);
  verifyName(genesisInfo.name);

  // Define a function to write the sections of the Id Handle GENESIS pushdata
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(version);
    putVarBytes(GENESIS, writer);
    writer.putU8(genesisInfo.type ?? 0);
    putVarBytes(strToBytes(genesisInfo.namespace ?? ''), writer);
    putVarBytes(strToBytes(genesisInfo.name ?? ''), writer);
    putVarBytes(fromHex(genesisInfo.authPubkey ?? ''), writer);
  };

  // Calculate the length of the writer
  const writerLength = new WriterLength();
  writeSection(writerLength);

  // Create a new writer with the calculated length and write the sections
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);

  // Return the data as a Uint8Array
  return writerBytes.data;
}

/**
 * Builds an Id Handle SEND pushdata section, moving the handle to different outputs.
 *
 * @param {string} id - The identity string to be processed.
 * @param {number} version - The version number of the identity protocol.
 * @param {number} outputNum - The output number to move the handle to.
 * @returns {Uint8Array} - The constructed pushdata section as a Uint8Array.
 * @throws Will throw an error if the provided id does not pass the hash verification.
 */
export function idSend(
  id: string,
  version: number,
  outputNum: number
): Uint8Array {
  verifyVersion(version);
  verifyHash(id);
  const idBytes = fromHexRev(id);
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(version);
    putVarBytes(SEND, writer);
    writer.putBytes(idBytes);
    writer.putU8(outputNum);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}

/**
 * Builds a Burn Handle BURN pushdata section, intentionally destroying the handle.
 *
 * @param {string} handleId - The handle ID to be burned.
 * @param {number} version - The version number of the identity protocol.
 * @returns {Uint8Array} - The byte array representing the BURN pushdata section.
 */
export function idBurn(handleId: string, version: number): Uint8Array {
  verifyVersion(version);
  verifyHash(handleId);
  const handleIdBytes = fromHexRev(handleId);
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(version);
    putVarBytes(BURN, writer);
    writer.putBytes(handleIdBytes);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}

function verifyVersion(version: number) {
  if (version < 0) {
    throw new Error(`Unsupported version ${version}`);
  }
}

function verifyType(type: DanaIdType) {
  if (type !== DANA_ID_TYPE_PROFILE && type !== DANA_ID_TYPE_PAGE) {
    throw new Error(`Unsupported type ${type}`);
  }
}

function verifyNamespace(namespace: string) {
  if (!namespace || (namespace && namespace.length > 32)) {
    throw new Error(`Namespace invalid or too long: ${namespace}`);
  }
}

function verifyName(name: string) {
  if (!name || (name && name.length > 32)) {
    throw new Error(`Name invalid or too long: ${name}`);
  }
}

function verifyHash(hash: string) {
  if (!hash || (hash && hash.length !== 64)) {
    throw new Error(`Hash invalid: ${hash}`);
  }
}
