import { Amount, Writer, WriterBytes, WriterLength, fromHex, fromHexRev } from "ecash-lib";
import { putVarBytes } from "../common";

/** LOKAD ID for DANA Vote */
export const DANA_VOTE_LOKAD_ID = fromHex('DNVT');

export const DANA_VOTE_UP = 1;
export const DANA_VOTE_DOWN = 0;

export const DANA_VOTE_TYPE_ID = 1;
export const DANA_VOTE_TYPE_HASH = 2;


export type DanaVoteDirection = typeof DANA_VOTE_UP | typeof DANA_VOTE_DOWN;
export type DanaVoteForType = typeof DANA_VOTE_TYPE_ID | typeof DANA_VOTE_TYPE_HASH;


export function danaVote(
  version: number,
  direction: DanaVoteDirection,
  type: DanaVoteForType,
  voteFor: string,
  amount: Amount,
  voteById?: string,

): Uint8Array {
  const writeSection = (writer: Writer) => {
    writer.putBytes(DANA_VOTE_LOKAD_ID);
    writer.putU8(version);
    writer.putU8(direction);
    writer.putU8(type);
    const voteForBytes = fromHexRev(voteFor);
    writer.putBytes(voteForBytes);
    const voteByIdBytes = fromHexRev(voteById ?? '');
    putVarBytes(voteByIdBytes, writer);
    writer.putBytes(voteByIdBytes);

    // amount is 6 bytes
    const amountN = BigInt(amount);
    writer.putU32(amountN & 0xffffffffn);
    writer.putU16(amountN >> 32n);


  };
  const writerLength = new WriterLength();
  writeSection(writerLength);
  const writerBytes = new WriterBytes(writerLength.length);
  writeSection(writerBytes);
  return writerBytes.data;
}
