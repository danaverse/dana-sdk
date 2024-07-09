
import { Writer, WriterBytes, WriterLength, strToBytes, fromHex, fromHexRev } from "ecash-lib";
import { BURN, GENESIS, GenesisInfo, SEND } from "./common";


/** LOKAD ID for ALP */
export const HDLE_LOKAD_ID = strToBytes('HDLE');

function putVarBytes(bytes: Uint8Array, writer: Writer) {
  if (bytes.length > 127) {
    throw new Error('Length of bytes must be between 0 and 127');
  }
  writer.putU8(bytes.length);
  writer.putBytes(bytes);
}


/** Build an Burn Handle GENESIS pushdata section */
export function hdleGenesis(
  genesisInfo: GenesisInfo,
): Uint8Array {
  const writeSection = (writer: Writer) => {
    writer.putBytes(HDLE_LOKAD_ID);
    putVarBytes(GENESIS, writer);
    putVarBytes(strToBytes(genesisInfo.handleName ?? ''), writer);
    putVarBytes(strToBytes(genesisInfo.dataType ?? ''), writer);
    putVarBytes(strToBytes(genesisInfo.dataValue ?? ''), writer);
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
export function hdleSend(
  handleId: string,
): Uint8Array {
  const handleIdBytes = fromHexRev(handleId);
  const writeSection = (writer: Writer) => {
    writer.putBytes(HDLE_LOKAD_ID);
    writer.putU8(SEND.length);
    writer.putBytes(SEND);
    writer.putBytes(handleIdBytes);
  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}

/** Build an Burn Handle BURN pushdata section, intentionally burning the handle. */
export function hdleBurn(
  handleId: string,
): Uint8Array {
  const handleIdBytes = fromHexRev(handleId);
  const writeSection = (writer: Writer) => {
    writer.putBytes(HDLE_LOKAD_ID);
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
