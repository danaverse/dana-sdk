import { Script } from 'ecash-lib';
import { DanaId } from './identity/dana-identity';
import { DanaVote } from './vote/dana-vote';

export interface EmppParseSectionResult {
  app: string;
  subType: string;
  data: string | DanaId | DanaVote;
}

export function parseEmppSections(script: Script) {}
