import { file, write } from 'bun';
import { rm } from 'fs/promises';
import { join, resolve } from 'path';

import type { FileSink } from 'bun';

export class FileSystem {
  public static dir = 'tmp' as const;
  public static dirPath = resolve(__dirname, '..', '..', this.dir);

  public static directory<TDirName extends string, TFileSystemDirectory extends FileSystemDirectory<string, any>>(name: TDirName, baseDirectory?: TFileSystemDirectory) {
    return new FileSystemDirectory(name, baseDirectory);
  }

  public static file<TFileName extends string, TFileSystemDirectory extends FileSystemDirectory<string, any>>(name: TFileName, baseDirectory: TFileSystemDirectory) {
    return new FileSystemFile(name, baseDirectory);
  }
}

export class FileSystemDirectory<TDirName extends string, TFileSystemDirectory extends FileSystemDirectory<string, any>> {
  public dir: TDirName;
  public dirPath: string;

  public async clear() {
    await rm(this.dirPath, { force: true, recursive: true });
  }

  constructor(name: TDirName, baseDirectory?: TFileSystemDirectory) {
    this.dir = name;
    this.dirPath = join(baseDirectory ? baseDirectory.dirPath : FileSystem.dirPath, this.dir);
  }
}

export class FileSystemFile<TFileName extends string, TFileSystemDirectory extends FileSystemDirectory<string, any>> {
  public dir: TFileSystemDirectory;
  public file: TFileName;
  public filePath: string;
  public fileSink: FileSink | null = null;

  public async touch() {
    // Hacky way to create a new empty file and path if needed (not sure why cannot write an empty string)
    await write(this.filePath, ' ', { createPath: true });
  }

  public writer() {
    if (!this.fileSink) {
      this.fileSink = file(this.filePath).writer();
    }
    return this.fileSink;
  }

  constructor(name: TFileName, baseDirectory: TFileSystemDirectory) {
    this.file = name;
    this.dir = baseDirectory;
    this.filePath = join(this.dir.dirPath, this.file);
  }
}
