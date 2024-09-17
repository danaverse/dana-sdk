# Dana Vote

## Overview

Dana Vote is a decentralized voting system for the Danaverse that allows users to express their opinions on various entities by burning native tokens.

## Background

In the Danaverse system, users can build their digital reputation based on tokens burned. The Dana Vote mechanism extends this concept by allowing users to vote on different entities (such as identities, content or proposals) by burning native tokens. This voting system is designed to be:

- Decentralized and serverless
- Easily verifiable
- Spam-resistant (due to the cost of burning tokens)
- Flexible in supporting different types of votable entities

## Specification

- Dana Vote uses the [eMPP](https://ecashbuilders.notion.site/eCash-Multi-Pushdata-Protocol-11e1b991071c4a77a3e948ba604859ac) (eCash Multi-Pushdata Protocol) to store voting data in the OP_RETURN output of a transaction.
- Each vote requires burning a specific amount of native tokens.
- The vote can be casted in both direction.
- The eMPP section for a vote contains the following fields, in order:
  1. LOKAD_ID: "DNVT" (4 bytes)
  2. Version number (1 byte, currently only version 0 is supported)
  3. Vote direction (1 byte, 1 for up-vote, 0 for down-vote)
  4. Vote type (1 byte, 1 for voting on an [Identity](dana-identity) 2 for voting on a hash)
  5. VoteById (variable length, optional): The ID of the voter (transaction ID)
  6. VoteFor (32 bytes): The ID or hash of the entity being voted on
  7. Amount (6 bytes): The amount of native tokens burned for this vote

### Table for Dana Vote section

| Field       | Size      | Type    | Description                                    |
|-------------|-----------|---------|------------------------------------------------|
| LOKAD_ID    | 4 bytes   | Bytes   | "DNVT"                                         |
| Version     | 1 byte    | Integer | 0                                              |
| Direction   | 1 byte    | Integer | 1 for up-vote, 0 for down-vote                 |
| Type        | 1 byte    | Integer | 1 for voting on an ID, 2 for voting on a hash  |
| VoteById    | Variable  | Bytes   | The ID of the voter (optional)                 |
| VoteFor     | 32 bytes  | Bytes   | The ID or hash of the entity being voted on    |
| Amount      | 6 bytes   | Integer | The amount of native tokens burned for the vote|

## Usage

To cast a vote, users need to create a transaction that includes:
1. An OP_RETURN output with the Dana Vote eMPP section
2. A mechanism to burn the specified amount of native tokens (e.g., sending to a provably unspendable address)

The weight of the vote is determined by the amount of tokens burned. This creates a natural economic incentive against spam voting while allowing users with stronger convictions (or more resources) to have a
greater impact on the voting outcome.

## Verification

Verifiers can parse the OP_RETURN output of transactions to identify Dana Votes. They should:
1. Check for the correct LOKAD_ID ("DNVT")
2. Verify the version number
3. Extract the vote direction, type, and target (VoteFor)
4. Confirm that the specified amount of tokens was indeed burned in the transaction
5. Optionally, check the VoteById to track votes by specific identities
