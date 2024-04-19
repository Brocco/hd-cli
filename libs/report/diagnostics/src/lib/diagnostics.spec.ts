import { Command } from '@herodevs/core-types';
import { reportDiagnosticsCommand } from './diagnostics';

describe('reportDiagnosticsCommand', () => {
  let cmd: Command;

  beforeEach(() => {
    cmd = reportDiagnosticsCommand;
  });

  it('should define command', () => {
    expect(cmd.command).toEqual('diagnostics');
  });

  it('should define group', () => {
    expect(cmd.group).toEqual('report');
  });

  it('should define describe', () => {
    expect(cmd.describe).toEqual('show diagnostic information');
  });

  it('should define aliases', () => {
    expect(cmd.aliases).toEqual(['diag', 'd']);
  });
  // builder: {},
  // handler: run,
});
