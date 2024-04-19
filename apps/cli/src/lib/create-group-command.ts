import { Command } from '@herodevs/core-types';

export function createGroupCommand(
  group: string,
  description: string,
  subCommand: string,
  subCommandDescription: string,
  aliases: string | string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commands: Command<any>[],
  errorMessage: string
) {
  const cmd = {
    command: `${group} <${subCommand}>`,
    describe: description,
    aliases: aliases,
    positional: {
      type: {
        type: 'string',
        demandOption: true,
        describe: subCommandDescription,
      },
    },
    builder: (yargs) => {
      return yargs.command(commands);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (args: any) => {
      console.log(`${errorMessage} (${args[subCommand]})`);
    },
  } as Command;
  return cmd;
}
