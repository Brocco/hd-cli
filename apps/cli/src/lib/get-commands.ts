import { Command } from '@herodevs/core-types';
import { reportCommittersCommand } from '@herodevs/report-committers';
import { reportDiagnosticsCommand } from '@herodevs/report-diagnostics';
import { trackerInitCommand } from '@herodevs/tracker-init';
import { trackerRunCommand } from '@herodevs/tracker-run';
import { createGroupCommand } from './create-group-command';
import { nesInitCommand } from '@herodevs/nes-init';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCommands(): Command<any>[] {
  const nesCommand = createGroupCommand(
    'nes',
    '',
    'command',
    'nes command',
    [],
    [nesInitCommand],
    'Invalid nes command'
  );

  const reportCommand = createGroupCommand(
    'report',
    '',
    'type',
    'type of report',
    'r',
    [reportCommittersCommand, reportDiagnosticsCommand],
    'Invalid report type'
  );

  const trackerCommand = createGroupCommand(
    'tracker',
    '',
    'command',
    'tracker command',
    [],
    [trackerInitCommand, trackerRunCommand],
    'Invalid tracker command'
  );

  return [nesCommand, reportCommand, trackerCommand];
}
