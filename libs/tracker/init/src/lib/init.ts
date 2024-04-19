import { Command } from '@herodevs/core-types';
import { getRootDir } from '@herodevs/utility';
import { ArgumentsCamelCase, CommandBuilder } from 'yargs';
import { defaultConfig } from './default-config';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options {}

export const trackerInitCommand: Command<Options> = {
  command: 'init',
  group: 'tracker',
  describe: 'Initialize the tracker configuration',
  aliases: [],
  builder: {} as CommandBuilder<unknown, Options>,
  handler: run,
};

function run(args: ArgumentsCamelCase<Options>): void {
  const rootDir = getRootDir(global.process.cwd());
  const output = JSON.stringify(defaultConfig, null, 2);
  const dir = join(rootDir, 'hd-tracker');
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  writeFileSync(join(dir, 'config.json'), output);
}
