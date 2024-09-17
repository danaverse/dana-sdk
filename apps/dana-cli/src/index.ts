#!/usr/bin/env node

import { Command } from 'commander';
import { createIdentity } from './commands/createIdentity';
import { createVote } from './commands/createVote';
import { createWallet } from './commands/createWallet';

const program = new Command();

program
  .name('dana-cli')
  .description('CLI for Dana identity and voting operations')
  .version('1.0.0');

program
  .command('create-identity')
  .description('Create a new Dana identity')
  .requiredOption('-n, --name <name>', 'Name for the identity')
  .requiredOption('-ns, --namespace <namespace>', 'Namespace for the identity')
  .option('-t, --type <type>', 'Type of identity (profile or page)', 'profile')
  .option('-k, --key <key>', 'Private key for transaction signing')
  .action(createIdentity);

program
  .command('create-vote')
  .description('Create a new Dana vote')
  .requiredOption('-d, --direction <direction>', 'Vote direction (up or down)')
  .requiredOption('-t, --type <type>', 'Vote type (id or hash)')
  .requiredOption('-v, --vote-for <voteFor>', 'ID or hash to vote for')
  .requiredOption(
    '-a, --amount <amount>',
    'Amount of tokens to burn for the vote'
  )
  .option('-b, --vote-by-id <voteById>', 'ID of the voter (optional)')
  .option('-k, --key <key>', 'Private key for transaction signing')
  .action(createVote);

program
  .command('create-wallet')
  .description('Create a new Dana wallet')
  .action(createWallet);


program.parse(process.argv);
