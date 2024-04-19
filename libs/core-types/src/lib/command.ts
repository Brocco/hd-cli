import { CommandModule } from 'yargs';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Command<T = {}> extends CommandModule<T, T> {
  group?: string;
}
