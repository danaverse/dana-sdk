'use strict';

export const opReturn = {
  opReturnPrefix: '6a',
  opReturnAppPrefixLength: '04',
  opPushDataOne: '4c',
  opReserved: '50',
  knownApps: {
    alp: { prefix: '534c5032', app: 'ALP' },
    danaId: {
      prefix: '444e4944', app: 'DanaId', subTypes: {
        genesis: 'genesis',
        send: 'send',
        burn: 'burn'
      }
    },
    danaVote: { prefix: '444e5654', app: 'DanaVote' }
  }
};
