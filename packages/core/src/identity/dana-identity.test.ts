import { expect } from 'chai';
import { fromHex, strToBytes } from 'ecash-lib';
import {
  DANA_ID_TYPE_PROFILE,
  GenesisInfo,
  idBurn,
  idGenesis,
  idSend
} from './dana-identity';

describe('Dana Identity', () => {
  describe('idGenesis', () => {
    it('should create correct profile', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi',
        authPubkey: '03040506'
      };
      const result = idGenesis(1, genesisInfo);

      // Check LOKAD ID
      expect(result.slice(0, 4)).to.deep.equal(new Uint8Array([68, 78, 73, 68])); // 'DNID' in ASCII

      // Check version
      expect(result[4]).to.equal(1);

      // Check GENESIS
      expect(result.slice(5, 12)).to.deep.equal(strToBytes('GENESIS'));

      // Further checks can be added for name, type, namespace, and authPubkey
    });
  });

  describe('idSend', () => {
    it('should create correct send data', () => {
      const id = '0123456789abcdef';
      const result = idSend(id);

      // Check LOKAD ID
      expect(result.slice(0, 4)).to.deep.equal(new Uint8Array([68, 78, 73, 68])); // 'DNID' in ASCII

      // Check SEND
      expect(result.slice(4, 9)).to.deep.equal(new Uint8Array([4, 83, 69, 78, 68]));

      // Check ID (in reverse order due to fromHexRev)
      expect(result.slice(9)).to.deep.equal(fromHex('efcdab8967452301'));
    });
  });

  describe('idBurn', () => {
    it('should create correct burn data', () => {
      const handleId = '0123456789abcdef';
      const result = idBurn(handleId);

      // Check LOKAD ID
      expect(result.slice(0, 4)).to.deep.equal(new Uint8Array([68, 78, 73, 68])); // 'DNID' in ASCII

      // Check BURN
      expect(result.slice(4, 9)).to.deep.equal(new Uint8Array([4, 66, 85, 82, 78]));

      // Check handle ID (in reverse order due to fromHexRev)
      expect(result.slice(9)).to.deep.equal(fromHex('efcdab8967452301'));
    });
  });
});
