import { writeFileSync, existsSync, readFileSync, mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';

const green = chalk.hex('#73C030');

export interface WriteOptions {
  executable?: boolean;
  askOverwrite?: boolean;
}

export async function writeFile(
  filePath: string,
  content: string,
  opts: WriteOptions = {}
): Promise<boolean> {
  const { executable = false, askOverwrite = true } = opts;

  // Ensure parent directory exists
  mkdirSync(dirname(filePath), { recursive: true });

  if (existsSync(filePath) && askOverwrite) {
    const overwrite = await confirm({
      message: `${filePath} already exists. Overwrite?`,
      default: false,
    });
    if (!overwrite) {
      console.log(chalk.yellow(`  Skipped ${filePath}`));
      return false;
    }
  }

  writeFileSync(filePath, content, 'utf-8');

  if (executable) {
    chmodSync(filePath, '755');
  }

  return true;
}

export function readFileIfExists(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}
