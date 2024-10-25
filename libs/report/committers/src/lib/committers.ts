import { addHours, addMinutes, addSeconds, format, formatISO, subMonths } from 'date-fns';
import { runCommand } from '@herodevs/utility';
import { parseDateFlags } from './parse-date-flags';
import { dateFormat, gitOutputFormat, monthsToSubtract } from './constants';
import { parseGitLogEntries } from './parse-git-log-entries';
import { getCommitterCounts } from './get-committer-counts';
import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs';
import { CommitterCount } from './types';
import { mkdtempSync, writeFileSync } from 'node:fs';

interface Options {
  beforeDate: string;
  afterDate: string;
  exclude: string[];
  json: boolean;
  // monthly: boolean;
  raw: boolean;
}

export const reportCommittersCommand: CommandModule<object, Options> = {
  command: 'committers',
  describe: 'show git committers',
  aliases: ['git'],
  builder: {
    beforeDate: {
      alias: 's',
      default: format(new Date(), dateFormat),
      describe: `Start Date (format: ${dateFormat})`,
      string: true,
    },
    afterDate: {
      alias: 'e',
      describe: `End Date (format: ${dateFormat})`,
      required: false,
      default: format(subMonths(new Date(), monthsToSubtract), dateFormat),
    },
    exclude: {
      alias: 'x',
      array: true,
      describe: 'Path Exclusions (eg -x="./src/bin" -x="./dist")',
      required: false,
    },
    json: {
      describe: 'Output to JSON format',
      required: false,
      default: false,
      boolean: true,
    },
    raw: {
      describe: 'Output raw git log entries',
      required: false,
      default: false,
      boolean: true,
    },
    // monthly: {
    //   alias: 'm',
    //   describe:
    //     'Break down by calendar month, rather than by committer.  (eg -m)',
    //   required: false,
    //   default: false,
    // },
  } as CommandBuilder<unknown, Options>,
  handler: run,
};

async function run(args: ArgumentsCamelCase<Options>): Promise<void> {
  const { beforeDate, afterDate } = parseDateFlags(dateFormat, args.beforeDate, args.afterDate);
  const beforeDateEndOfDay = formatISO(addHours(addMinutes(addSeconds(beforeDate, 59), 59), 23));

  const ignores = args.exclude && args.exclude.length ? `-- . "!(${args.exclude.join('|')})"` : '';

  const gitCommand = `git log --since "${afterDate}" --until "${beforeDateEndOfDay}" --pretty=format:${gitOutputFormat} ${ignores}`;

  const result = await runCommand(gitCommand);

  const rawEntries = (result as string).split('\n');
  const beforeDateStr = format(beforeDate, 'yyyy-MM-dd');
  const afterDateStr = format(afterDate, 'yyyy-MM-dd');

  if (rawEntries.length === 1 && rawEntries[0] === '') {
    console.log(`No commits found between ${afterDateStr} and ${beforeDateStr}`);
    return;
  }

  const entries = parseGitLogEntries(rawEntries);
  const committerCounts = getCommitterCounts(entries);
  const dates = {
    from: afterDateStr,
    to: beforeDateStr,
  };

  if (args.raw) {
    const tempDir = mkdtempSync('nes-git-committers-');
    const rawOutputFile = `${tempDir}/git-committers-raw.log`;
    console.log(`Raw output written to: ${rawOutputFile}`);
    console.log(`Raw output:\nCommitters between ${dates.from} and ${dates.to}\n${result}`);
    // writeFileSync(rawOutputFile, `Committers between ${dates.from} and ${dates.to}\n${rawEntries}`);
  }

  if (args.json) {
    outputCommittersJson(dates, committerCounts);
  } else {
    outputCommitters(dates, committerCounts);
  }
}

function outputCommitters(dates: { from: string; to: string }, committerCounts: CommitterCount[]) {
  console.log(`Committers between ${dates.from} and ${dates.to}\n`);

  const longestNameLength = committerCounts.reduce((acc, c) => {
    return c.name.length > acc ? c.name.length : acc;
  }, 'Committer'.length);

  const header = `Committer${' '.repeat(longestNameLength - 9)} | Commits`;
  console.log(header);
  console.log(
    header
      .split('')
      .map((c) => (c === '|' ? '|' : '-'))
      .join('')
  );

  console.log(
    committerCounts
      .map((c) => {
        const committer = `${c.name}${' '.repeat(longestNameLength - c.name.length)}`;
        const count = ' '.repeat(7 - c.count.toString().length) + c.count;
        return `${committer} | ${count}`;
      })
      .join('\n')
  );
}

function outputCommittersJson(
  dates: { from: string; to: string },
  committerCounts: CommitterCount[]
) {
  const output = {
    dates,
    committers: committerCounts,
  };
  console.log(JSON.stringify(output, null, 2));
}
