import { ChronikClient } from "chronik-client";
import * as bip39 from "bip39";
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import xaddress from '@bcpros/xaddress';

const bip32 = BIP32Factory(ecc);

export async function createWallet() {
  const chronik = new ChronikClient(process.env.CHIONIK_URL || 'https://chronik.be.cash/xpi');
  const mnemonic = bip39.generateMnemonic();
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  const XPI_DERIVATION_PATH_TOKENS = `m/44'/10605'/0'/0/0`;
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(XPI_DERIVATION_PATH_TOKENS);

  // Get private key and public key
  const { privateKey, identifier } = child;
  // bip32 child.privateKey is Buffer | undefined
  const skString = privateKey!.toString('hex');
  const address = xaddress

}
