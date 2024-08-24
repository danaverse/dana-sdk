import { expect } from 'chai';
import { fromHexRev } from 'ecash-lib';
import { DANA_ID_LOKAD_ID, DANA_ID_TYPE_PROFILE, GenesisInfo, idBurn, idGenesis, idSend } from './dana-identity';

describe('Dana Identity', () => {
  describe('idGenesis', () => {
    it('should create correct genesis profile data', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi',
        authPubkey: '03040506'
      };
      const result = idGenesis(1, genesisInfo);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result[4]).to.equal(1); // version
      expect(result.slice(5, 12)).to.deep.equal(new Uint8Array([7, 71, 69, 78, 69, 83, 73, 83])); // GENESIS
      expect(result[12]).to.equal(DANA_ID_TYPE_PROFILE);
      expect(result.slice(13, 18)).to.deep.equal(new Uint8Array([4, 108, 105, 120, 105])); // 'lixi'
      expect(result.slice(18, 26)).to.deep.equal(new Uint8Array([7, 116, 101, 115, 116, 45, 105, 100])); // 'test-id'
      expect(result.slice(26)).to.deep.equal(new Uint8Array([2, 3, 4, 5, 6])); // authPubkey
    });

    it('should throw error for invalid version', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi'
      };
      expect(() => idGenesis(-1, genesisInfo)).to.throw('Unsupported version -1');
    });

    it('should throw error for invalid type', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: 2 as any, // Invalid type
        namespace: 'lixi'
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw('Unsupported type 2');
    });

    it('should throw error for invalid namespace', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'a'.repeat(33) // 33 characters, which is too long
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw('Namespace invalid or too long');
    });

    it('should throw error for invalid name', () => {
      const genesisInfo: GenesisInfo = {
        name: 'a'.repeat(33), // 33 characters, which is too long
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi'
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw('Name invalid or too long');
    });
  });

  describe('idSend', () => {
    it('should create correct send data', () => {
      const id = '0123456789abcdef0123456789abcdef';
      const result = idSend(id);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result.slice(4, 9)).to.deep.equal(new Uint8Array([4, 83, 69, 78, 68])); // SEND
      expect(result.slice(9)).to.deep.equal(fromHexRev(id));
    });

    it('should throw error for invalid id', () => {
      const invalidId = '0123456789abcdef'; // Too short
      expect(() => idSend(invalidId)).to.throw('Hash invalid');
    });
  });

  describe('idBurn', () => {
    it('should create correct burn data', () => {
      const handleId = '0123456789abcdef0123456789abcdef';
      const result = idBurn(handleId);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result.slice(4, 9)).to.deep.equal(new Uint8Array([4, 66, 85, 82, 78])); // BURN
      expect(result.slice(9)).to.deep.equal(fromHexRev(handleId));
    });

    it('should throw error for invalid handleId', () => {
      const invalidHandleId = '0123456789abcdef'; // Too short
      expect(() => idBurn(invalidHandleId)).to.throw('Hash invalid');
    });
  });
});
