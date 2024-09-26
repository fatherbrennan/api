import { describe, expect, test } from 'bun:test';

import { FileSystem } from './file-system';

describe('file-system utility', async () => {
  test('constants', async () => {
    expect(FileSystem.dir).toBe('tmp');
  });

  test('directories', async () => {
    const dir1 = FileSystem.directory('dir1');
    const dir2 = FileSystem.directory('dir2', dir1);

    expect(dir1.dir).toBe('dir1');
    expect(dir2.dir).toBe('dir2');
  });

  test('files', async () => {
    const dir1 = FileSystem.directory('dir1');
    const dir2 = FileSystem.directory('dir2');
    const file1 = FileSystem.file('file1', dir1);
    const file2 = FileSystem.file('file2', dir2);

    expect(file1.file).toBe('file1');
    expect(file2.file).toBe('file2');
    expect(dir1.dir).toBe('dir1');
    expect(file1.dir.dir).toBe('dir1');
    expect(file2.dir.dir).toBe('dir2');
  });
});
