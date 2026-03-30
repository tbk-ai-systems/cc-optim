export type RepomixFormat = 'xml' | 'markdown' | 'plain';

export function generateRepomixConfig(format: RepomixFormat): string {
  const config = {
    output: {
      filePath: `repomix-output.${format === 'xml' ? 'xml' : format === 'markdown' ? 'md' : 'txt'}`,
      style: format,
      fileSummary: true,
      directoryStructure: true,
    },
    ignore: {
      useGitignore: true,
      useDefaultPatterns: true,
    },
    security: {
      enableSecurityCheck: true,
    },
  };

  return JSON.stringify(config, null, 2) + '\n';
}
