
import { Writer, WriterBytes, WriterLength, strToBytes, fromHex, fromHexRev } from "ecash-lib";
import { putVarBytes } from "../common";

export const GENESIS = strToBytes('GENESIS');
export const SEND = strToBytes('SEND');
export const BURN = strToBytes('BURN');

/** LOKAD ID for DANA Identity */
export const DANA_ID_LOKAD_ID = strToBytes('DNID');

export const DANA_ID_TYPE_PROFILE = 0;
export const DANA_ID_TYPE_PAGE = 1;
export type DanaIdType = typeof DANA_ID_TYPE_PROFILE | typeof DANA_ID_TYPE_PAGE;


/** Genesis info found in GENESIS txs of tokens */
export interface GenesisInfo {
  /** name of the id */
  name?: string;
  /** type of the id: profile or page */
  type?: DanaIdType;
  /** namespace of the id */
  namespace?: string;
  /** auth_pubkey of the token (only on ALP) */
  authPubkey?: string;
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
    writer.putU8(genesisInfo.type ?? 0);
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
