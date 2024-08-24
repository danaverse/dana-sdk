'use strict';

export const opReturn = {
  opReturnPrefix: '6a',
  opReturnAppPrefixLength: '04',
  opPushDataOne: '4c',
  opReserved: '50',
  knownApps: {
    swap: { prefix: '53575000', app: 'SWaP' },
    alp: { prefix: '534c5032', app: 'ALP' },
    danaId: { prefix: '444e4944', app: 'DanaId' },
    danaVote: { prefix: '444e5654', app: 'DanaVote' },
  },
}
