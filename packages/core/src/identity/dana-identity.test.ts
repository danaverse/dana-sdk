import { fromHexRev } from 'ecash-lib';
import { describe, expect, test } from 'vitest';
import {
  DANA_ID_LOKAD_ID,
  DANA_ID_TYPE_PROFILE,
  GenesisInfo,
  idBurn,
  idGenesis,
  idSend
} from './dana-identity';

describe('Dana Identity', () => {
  describe('idGenesis', () => {
    test('should create correct genesis profile data', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi',
        authPubkey: '03040506'
      };
      const result = idGenesis(0, genesisInfo);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result[4]).to.equal(0); // version
      expect(result.slice(5, 13)).to.deep.equal(
        new Uint8Array([7, 71, 69, 78, 69, 83, 73, 83])
      ); // GENESIS
      expect(result[13]).to.equal(DANA_ID_TYPE_PROFILE);
      expect(result.slice(14, 19)).to.deep.equal(
        new Uint8Array([4, 108, 105, 120, 105])
      ); // 'lixi'
      expect(result.slice(19, 27)).to.deep.equal(
        new Uint8Array([7, 116, 101, 115, 116, 45, 105, 100])
      ); // 'test-id'
      expect(result.slice(27)).to.deep.equal(new Uint8Array([4, 3, 4, 5, 6])); // authPubkey
    });

    test('should throw error for invalid version', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi'
      };
      expect(() => idGenesis(-1, genesisInfo)).to.throw(
        'Unsupported version -1'
      );
    });

    test('should throw error for invalid type', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: 2 as any, // Invalid type
        namespace: 'lixi'
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw('Unsupported type 2');
    });

    test('should throw error for invalid namespace', () => {
      const genesisInfo: GenesisInfo = {
        name: 'test-id',
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'a'.repeat(33) // 33 characters, which is too long
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw(
        'Namespace invalid or too long'
      );
    });

    test('should throw error for invalid name', () => {
      const genesisInfo: GenesisInfo = {
        name: 'a'.repeat(33), // 33 characters, which is too long
        type: DANA_ID_TYPE_PROFILE,
        namespace: 'lixi'
      };
      expect(() => idGenesis(1, genesisInfo)).to.throw(
        'Name invalid or too long'
      );
    });
  });

  describe('idSend', () => {
    test('should create correct send data', () => {
      const id =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const result = idSend(id, 0, 1);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result[4]).to.equal(0); // version
      expect(result.slice(5, 10)).to.deep.equal(
        new Uint8Array([4, 83, 69, 78, 68])
      ); // SEND
      expect(result.slice(10, 42)).to.deep.equal(fromHexRev(id));
      expect(result[42]).to.equal(1); // version
    });

    test('should throw error for invalid id', () => {
      const invalidId = '0123456789abcdef'; // Too short
      expect(() => idSend(invalidId, 0, 1)).to.throw('Hash invalid');
    });
  });

  describe('idBurn', () => {
    test('should create correct burn data', () => {
      const handleId =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const result = idBurn(handleId, 0);

      expect(result.slice(0, 4)).to.deep.equal(DANA_ID_LOKAD_ID);
      expect(result[4]).to.equal(0); // version
      expect(result.slice(5, 10)).to.deep.equal(
        new Uint8Array([4, 66, 85, 82, 78])
      ); // BURN
      expect(result.slice(10)).to.deep.equal(fromHexRev(handleId));
    });

    test('should throw error for invalid handleId', () => {
      const invalidHandleId = '0123456789abcdef'; // Too short
      expect(() => idBurn(invalidHandleId, 0)).to.throw('Hash invalid');
    });
  });
});
