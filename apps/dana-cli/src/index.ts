#!/usr/bin/env node

import { Command } from 'commander';
import { createIdentity } from './commands/createIdentity';

const program = new Command();

program
  .name('dana-cli')
  .description('CLI for Dana identity operations')
  .version('1.0.0');

program
  .command('create-identity')
  .description('Create a new Dana identity')
  .requiredOption('-n, --name <name>', 'Name for the identity')
  .requiredOption('-ns, --namespace <namespace>', 'Namespace for the identity')
  .option('-t, --type <type>', 'Type of identity (profile or page)', 'profile')
  .option('-k, --key <key>', 'Private key for transaction signing')
  .action(createIdentity);

program.parse(process.argv);
