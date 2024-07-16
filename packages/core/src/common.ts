import { Amount, Writer } from "ecash-lib";

function putAlpAmount(amount: Amount, writer: Writer) {
  const amountN = BigInt(amount);
  writer.putU32(amountN & 0xffffffffn);
  writer.putU16(amountN >> 32n);
}

export function putVarBytes(bytes: Uint8Array, writer: Writer) {
  if (bytes.length > 127) {
    throw new Error('Length of bytes must be between 0 and 127');
  }
  writer.putU8(bytes.length);
  writer.putBytes(bytes);
}
