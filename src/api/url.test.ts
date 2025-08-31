import { describe, expect, test } from 'bun:test';

import { query } from './url';

describe('url utility', async () => {
  test('query', async () => {
    const query1 = {};
    const query2 = {
      page: 1,
      limit: 10,
      sort: 'asc',
      custom_param: '&wow',
      q: 'Hello World!',
    };

    expect(query(query1)).toBe('');
    expect(query(query2)).toBe('?page=1&limit=10&sort=asc&custom_param=%26wow&q=Hello%20World!');
  });
});
