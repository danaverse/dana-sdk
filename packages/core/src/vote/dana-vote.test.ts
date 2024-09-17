import { fromHexRev } from 'ecash-lib';
import { describe, expect, test } from 'vitest';
import {
  DANA_VOTE_DOWN,
  DANA_VOTE_LOKAD_ID,
  DANA_VOTE_TYPE_HASH,
  DANA_VOTE_TYPE_ID,
  DANA_VOTE_UP,
  danaVote
} from './dana-vote';

describe('Dana Vote', () => {
  describe('danaVote', () => {
    test('should create correct vote data for upvote with ID', () => {
      const version = 1;
      const direction = DANA_VOTE_UP;
      const type = DANA_VOTE_TYPE_ID;
      const voteFor =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const amount = 1000000n; // 1 XPI
      const voteById =
        'ccc4daf4557a2294efe233c95412f4dbf4dc1068cbc0477b634e4451b0cf6fc5';

      const result = danaVote(
        version,
        direction,
        type,
        voteFor,
        amount,
        voteById
      );

      expect(result.slice(0, 4)).to.deep.equal(DANA_VOTE_LOKAD_ID);
      expect(result[4]).to.equal(version);
      expect(result[5]).to.equal(direction);
      expect(result[6]).to.equal(type);
      expect(result[7]).to.equal(32);
      expect(result.slice(8, 40)).to.deep.equal(fromHexRev(voteById));
      expect(result.slice(40, 72)).to.deep.equal(fromHexRev(voteFor));
      expect(result.slice(72)).to.deep.equal(
        new Uint8Array([0x40, 0x42, 0x0f, 0x00, 0x00, 0x00])
      ); // 1000000 in little-endian
    });

    test('should create correct vote data for downvote with hash', () => {
      const version = 1;
      const direction = DANA_VOTE_DOWN;
      const type = DANA_VOTE_TYPE_HASH;
      const voteFor =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const amount = 500000n; // 0.005 BCH
      const voteById =
        'ccc4daf4557a2294efe233c95412f4dbf4dc1068cbc0477b634e4451b0cf6fc5';

      const result = danaVote(
        version,
        direction,
        type,
        voteFor,
        amount,
        voteById
      );

      expect(result.slice(0, 4)).to.deep.equal(DANA_VOTE_LOKAD_ID);
      expect(result[4]).to.equal(version);
      expect(result[5]).to.equal(direction);
      expect(result[6]).to.equal(type);
      expect(result[7]).to.equal(32);
      expect(result.slice(8, 40)).to.deep.equal(fromHexRev(voteById));
      expect(result.slice(40, 72)).to.deep.equal(fromHexRev(voteFor));
      expect(result.slice(72)).to.deep.equal(
        new Uint8Array([0x20, 0xa1, 0x07, 0x00, 0x00, 0x00])
      ); // 500000 in little-endian
    });

    test('should create correct vote data without voteById', () => {
      const version = 1;
      const direction = DANA_VOTE_UP;
      const type = DANA_VOTE_TYPE_ID;
      const voteFor =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const amount = 1000000n; // 0.01 BCH

      const result = danaVote(version, direction, type, voteFor, amount);

      expect(result.slice(0, 4)).to.deep.equal(DANA_VOTE_LOKAD_ID);
      expect(result[4]).to.equal(version);
      expect(result[5]).to.equal(direction);
      expect(result[6]).to.equal(type);
      expect(result[7]).to.equal(0); // length of voteById (empty)
      expect(result.slice(8, 40)).to.deep.equal(fromHexRev(voteFor));
      expect(result.slice(40)).to.deep.equal(
        new Uint8Array([0x40, 0x42, 0x0f, 0x00, 0x00, 0x00])
      ); // 1000000 in little-endian
    });

    test('should handle large amounts correctly', () => {
      const version = 1;
      const direction = DANA_VOTE_UP;
      const type = DANA_VOTE_TYPE_ID;
      const voteFor =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const amount = 281474976710655n; // Max uint64 value
      const voteById =
        'ccc4daf4557a2294efe233c95412f4dbf4dc1068cbc0477b634e4451b0cf6fc5';

      const result = danaVote(
        version,
        direction,
        type,
        voteFor,
        amount,
        voteById
      );

      expect(result.slice(72)).to.deep.equal(
        new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
      ); // Max value in little-endian
    });

    test('should throw error for invalid voteFor length', () => {
      const version = 1;
      const direction = DANA_VOTE_UP;
      const type = DANA_VOTE_TYPE_ID;
      const voteFor = '0123456789abcdef'; // Too short
      const amount = 1000000n;

      expect(() =>
        danaVote(version, direction, type, voteFor, amount)
      ).to.throw('Invalid voteFor length: 0123456789abcdef');
    });

    test('should throw error for invalid voteById length when provided', () => {
      const version = 1;
      const direction = DANA_VOTE_UP;
      const type = DANA_VOTE_TYPE_ID;
      const voteFor =
        'e6b3339123cfc3c96677a51ce7c17434f892cc5f137cac063f0e710770c4e915';
      const amount = 1000000n;
      const voteById = '123456789abcdef'; // Too short

      expect(() =>
        danaVote(version, direction, type, voteFor, amount, voteById)
      ).to.throw('Invalid voteById length: 123456789abcdef');
    });
  });
});
