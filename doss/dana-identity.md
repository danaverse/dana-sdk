# Dana Identity

## Overview

The Dana Identity is a decentralized identity for the Danaverse system that allows users to create and manage their own digital identities.

## Background

Danaverse is the system that allows users to create and manage their own digital reputation based on token burned.
Because the addresses are user-unfriendly, we need a way to user to create their user-friendly identities/profiles and build up their reputation tied to the identities.
The identity must be:
- Human readable
- Able to transfer, trade, swap
- Serverless, decentralized, can easily verify
- Cost something to create, to prevent spam (by dana)

## Specification
- The dana identity copy and modify the mechanism of [ALP](https://ecashbuilders.notion.site/ALP-a862a4130877448387373b9e6a93dd97) (SLPV2)
- The identity data is created as an [eMPP](https://ecashbuilders.notion.site/eCash-Multi-Pushdata-Protocol-11e1b991071c4a77a3e948ba604859ac) pushdata (section) in OP_RETURN output of transaction.
- The transaction must burn an required amount of native token.
- In one eMPP sectionn, data is stored and need to be parse as following fields, in order:
  1. Each section must start with LOKAD_ID "DNID" (4 bytes).
  2. A push of version number (1 byte)(currently only version 0 is supported).
  3. A push of section type
    3.1 GENESIS (7 bytes): create new identity.
    3.2 SEND (4 bytes): move identity to different outputs.
    3.3 BURN (4 bytes): intentionally destroy the identity.
  4. Detail data of the section type  GENESIS:
    4.1 A push of identity type (number) (profile / page ...).
    4.2 A push of identity namespace (string).
    4.3 A push of identity name (string).
  5. Detail data of the section type SEND:
    5.1 A push of the identity id (creation transaction id)(string).
  6. Detail data of the section type BURN:
    6.1 A push of the identity id (creation transaction id)(string).
- There can be only one GENESIS section in the transaction and must be the first section.


### Table for GENESIS section

| Field | Size / range | Type | Description |
|---|---|---|---|
| LOKAD_ID | 4 bytes | Bytes | "DNID" |
| Version | 1 byte | Integer | 0 |
| Section type | 7 bytes | Bytes | "GENESIS" |
| Type | 1 byte | Integer | 0 for profile, 1 for page |
| Namespace | Variable | String | The namespace of the identity |
| Name | Variable | String | The name of the identity |
| AuthPubkey | Variable | String | The auth_pubkey of the token (only on ALP) |

### Table for SEND section

| Field | Size / range | Type | Description |
|---|---|---|---|
| LOKAD_ID | 4 bytes | Bytes | "DNID" |
| Version | 1 byte | Integer | 0 |
| Section type | 4 bytes | Bytes | "SEND" |
| Identity ID | Variable | String | The identity ID (creation transaction ID) |
| Output number | 1 byte | Integer | The output number to move the identity to |

### Table for BURN section

| Field | Size / range | Type | Description |
|---|---|---|---|
| LOKAD_ID | 4 bytes | Bytes | "DNID" |
| Version | 1 byte | Integer | 0 |
| Section type | 4 bytes | Bytes | "BURN" |
| Identity ID | Variable | String | The identity ID (creation transaction ID) |

