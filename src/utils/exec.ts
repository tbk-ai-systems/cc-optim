import { execa, type Options } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

const green = chalk.hex('#73C030');

export async function run(
  command: string,
  args: string[],
  opts?: { label?: string; silent?: boolean; inherit?: boolean } & Options
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { label, silent, inherit, ...execOpts } = opts ?? {};
  const spinner = !silent && label ? ora({ text: label, color: 'green' }).start() : null;

  try {
    const result = await execa(command, args, {
      ...(inherit ? { stdio: 'inherit' } : {}),
      ...execOpts,
    });
    if (spinner) spinner.succeed(green(label));
    return {
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
      exitCode: result.exitCode ?? 0,
    };
  } catch (err: any) {
    if (spinner) spinner.fail(label);
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', exitCode: err.exitCode ?? 1 };
  }
}

export async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execa('which', [cmd]);
    return true;
  } catch {
    // Windows fallback
    try {
      await execa('where', [cmd]);
      return true;
    } catch {
      return false;
    }
  }
}
