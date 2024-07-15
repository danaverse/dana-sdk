
import { Writer, WriterBytes, WriterLength, strToBytes, fromHex, fromHexRev } from "ecash-lib";

export const GENESIS = strToBytes('GENESIS');
export const SEND = strToBytes('SEND');
export const BURN = strToBytes('BURN');

/** Genesis info found in GENESIS txs of tokens */
export interface GenesisInfo {
  /** name of the id */
  name?: string;
  /** type of the arbitrary data */
  namespace?: string;
  /** auth_pubkey of the token (only on ALP) */
  authPubkey?: string;
}


/** LOKAD ID for DANA Identity */
export const DANA_ID_LOKAD_ID = strToBytes('DNID');

function putVarBytes(bytes: Uint8Array, writer: Writer) {
  if (bytes.length > 127) {
    throw new Error('Length of bytes must be between 0 and 127');
  }
  writer.putU8(bytes.length);
  writer.putBytes(bytes);
}


/** Build an Burn Handle GENESIS pushdata section */
export function idGenesis(
  version: number,
  genesisInfo: GenesisInfo,
): Uint8Array {
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(version);
    putVarBytes(GENESIS, writer);
    putVarBytes(strToBytes(genesisInfo.name ?? ''), writer);
    putVarBytes(strToBytes(genesisInfo.namespace ?? ''), writer);
    putVarBytes(fromHex(genesisInfo.authPubkey ?? ''), writer);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}

/**
 * Build an Burn Handle SEND pushdata section, moving the handle to different outputs
 **/
export function idSend(
  id: string,
): Uint8Array {
  const idBytes = fromHexRev(id);
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(SEND.length);
    writer.putBytes(SEND);
    writer.putBytes(idBytes);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}

/** Build an Burn Handle BURN pushdata section, intentionally burning the handle. */
export function idBurn(
  handleId: string,
): Uint8Array {
  const handleIdBytes = fromHexRev(handleId);
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_ID_LOKAD_ID);
    writer.putU8(BURN.length);
    writer.putBytes(BURN);
    writer.putBytes(handleIdBytes);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}
