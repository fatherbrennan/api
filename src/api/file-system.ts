import { file as bunFile, write as bunWrite } from 'bun';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { FileSink } from 'bun';

import type { Type$ } from './types';

export type Directory<TName extends string> = {
  name: TName;
  dirPath: string;
  clear: () => Promise<void>;
};

export type File<TFileName extends string, TDirectory> = {
  name: TFileName;
  dir: TDirectory;
  filePath: string;
  fileSink: FileSink | null;
  touch: () => Promise<void>;
  writer: () => FileSink;
};

export const tempDir = 'tmp' as const;
export const tempDirPath = resolve(__dirname, '..', '..', tempDir);

export const directory = <TDirName extends string, TDirectory extends Directory<string> | undefined>(
  name: TDirName,
  baseDirectory?: TDirectory,
) => {
  const dirPath = join(baseDirectory ? baseDirectory.dirPath : tempDirPath, name);

  return {
    name,
    dirPath,
    clear: async () => {
      await rm(dirPath, { force: true, recursive: true });
    },
  } as undefined extends TDirectory
    ? Directory<TDirName> & Type$<{ rootDir: typeof tempDir }>
    : Directory<TDirName> & Type$<{ rootDir: TDirectory }>;
};

export const file = <TFileName extends string, TDirectory extends Directory<string>>(
  name: TFileName,
  baseDirectory: TDirectory,
): File<TFileName, TDirectory> => {
  const dir = baseDirectory;
  let fileSink: FileSink | null = null;
  const filePath = join(dir.dirPath, name);

  return {
    name,
    dir,
    fileSink,
    filePath,
    touch: async () => {
      // Hacky way to create a new empty file and path if needed (not sure why cannot write an empty string)
      await bunWrite(filePath, ' ', { createPath: true });
    },
    writer: () => {
      if (!fileSink) {
        fileSink = bunFile(filePath).writer();
      }
      return fileSink;
    },
  };
};
