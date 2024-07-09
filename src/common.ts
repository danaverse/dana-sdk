import { strToBytes } from "ecash-lib";


export const GENESIS = strToBytes('GENESIS');
export const SEND = strToBytes('SEND');
export const BURN = strToBytes('BURN');

/** Genesis info found in GENESIS txs of tokens */
export interface GenesisInfo {
  /** name of the handle */
  handleName?: string;
  /** type of the arbitrary data */
  dataType?: string;
  /** value of the arbitrary data */
  dataValue?: string;
  /** auth_pubkey of the token (only on ALP) */
  authPubkey?: string;
}
