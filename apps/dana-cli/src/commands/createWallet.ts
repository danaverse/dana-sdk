import { NetworkType, XAddress, XAddressType } from '@bcpros/xaddress';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import { ChronikClient } from 'chronik-client';
import { Script, sha256d } from 'ecash-lib';
import * as fs from 'fs';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export async function createWallet() {
  const chronik = new ChronikClient(
    process.env.CHIONIK_URL || 'https://chronik.be.cash/xpi'
  );
  const mnemonic = bip39.generateMnemonic();
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  const XPI_DERIVATION_PATH_TOKENS = `m/44'/10605'/0'/0/0`;
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(XPI_DERIVATION_PATH_TOKENS);

  // Get private key and public key
  const { privateKey, identifier } = child;
  // bip32 child.privateKey is Buffer | undefined
  const skString = Array.prototype.map.call(privateKey, x => ('00' + x.toString(16)).slice(-2)).join('');
  const pkString = Array.prototype.map.call(identifier, x => ('00' + x.toString(16)).slice(-2)).join('');
  const xType = XAddressType.ScriptPubKey;
  const p2pkhScript = Script.p2pkh(sha256d(identifier));
  const payload = p2pkhScript.bytecode;
  const xAddress = new XAddress(xType, NetworkType.MAIN, Buffer.from(payload));
  const address = XAddress.encode(xAddress);

  // Create object of address, mnemonic and public key, private key the save into file wallet.json
  const wallet = {
    address,
    mnemonic,
    publicKey: pkString,
    privateKey: skString,
  };

  fs.writeFileSync('wallet.json', JSON.stringify(wallet, null, 2));

}
