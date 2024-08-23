import { existsSync } from 'fs';
import { ProjectType } from '@herodevs/core-types';
import path = require('path');

export function getProjectTypes(): ProjectType[] {
  const types = [] as ProjectType[];

  if (isNpmProject()) {
    types.push('npm');
  }

  if (isJavaProject()) {
    types.push('java');
  }

  return types;
}

function isJavaProject(): boolean {
  // JAVA-TODO: Implement logic to determine if the project is a Java project
  return false;
}

function isNpmProject(): boolean {
  return existsSync(path.join(process.cwd(), 'package.json'));
}
