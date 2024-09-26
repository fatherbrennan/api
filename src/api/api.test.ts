import { describe, expect, test } from 'bun:test';

import { Api } from './api';

describe('api utility', async () => {
  test('imdb/tv/details: bad request', async () => {
    const request = Api.get().imdb().tv().details({ id: 'no-data' });
    const response = await request.fetch();

    expect(request.url).toBe('https://raw.githubusercontent.com/fatherbrennan/api/refs/heads/get/imdb/tv/no-data.json');
    expect(response.data).toBeNull();
    expect(response.hasException).toBeTrue();
    expect(response.isAborted).toBeFalse();
    expect(response.isSuccess).toBeFalse();
  });

  test('imdb/tv/details: good request', async () => {
    // We are in major trouble if The Office US is not accessible via API.
    const request = Api.get().imdb().tv().details({ id: 'tt0386676' });
    const response = await request.fetch();

    expect(request.url).toBe('https://raw.githubusercontent.com/fatherbrennan/api/refs/heads/get/imdb/tv/tt0386676.json');
    expect(response.data).toBeObject();
    expect(response.hasException).toBeFalse();
    expect(response.isAborted).toBeFalse();
    expect(response.isSuccess).toBeTrue();
  });

  test('imdb/tv/search: good request', async () => {
    const request = Api.get().imdb().tv().search();
    const response = await request.fetch();

    expect(request.url).toBe('https://raw.githubusercontent.com/fatherbrennan/api/refs/heads/get/imdb/tv/search.json');
    expect(response.data).toBeArray();
    expect(response.hasException).toBeFalse();
    expect(response.isAborted).toBeFalse();
    expect(response.isSuccess).toBeTrue();
  });
});
