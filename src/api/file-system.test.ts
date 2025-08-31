import { describe, expect, test } from 'bun:test';

import { tempDir, directory, file } from './file-system';

describe('file-system utility', async () => {
  test('constants', async () => {
    expect(tempDir).toBe('tmp');
  });

  test('directories', async () => {
    const dir1 = directory('dir1');
    const dir2 = directory('dir2', dir1);

    expect(dir1.name).toBe('dir1');
    expect(dir2.name).toBe('dir2');
  });

  test('files', async () => {
    const dir1 = directory('dir1');
    const dir2 = directory('dir2');
    const file1 = file('file1', dir1);
    const file2 = file('file2', dir2);

    expect(file1.name).toBe('file1');
    expect(file2.name).toBe('file2');
    expect(dir1.name).toBe('dir1');
    expect(file1.dir.name).toBe('dir1');
    expect(file2.dir.name).toBe('dir2');
  });
});
