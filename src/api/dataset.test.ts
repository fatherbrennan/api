import { describe, expect, test } from 'bun:test';

import { Type } from './constants';
import { createDataset } from './dataset';

describe('dataset utility', async () => {
  // Database response type.
  const DatabaseData = createDataset({
    id: { key: 'id', _type: Type.Number, _required: true },
    title: { key: 'primary_title', _type: Type.String, _required: false },
    isActive: { key: 'is_active', _type: Type.Bit, _required: true },
    unusedField: { key: 'unused_field', _type: Type.String, _required: false },
  } as const);
  // Transformed data type.
  const ApiData = createDataset({
    id: { key: 'id', _type: Type.Number, _required: true },
    title: { key: 't', _type: Type.String, _required: true },
    isActive: { key: 'iA', _type: Type.Boolean, _required: true },
  } as const);

  test('expected property values', async () => {
    expect(DatabaseData.id).toBe('id');
    expect(DatabaseData.title).toBe('primary_title');
    expect(DatabaseData.isActive).toBe('is_active');
    expect(DatabaseData.id).toBe('id');

    expect(ApiData.id).toBe('id');
    expect(ApiData.title).toBe('t');
    expect(ApiData.isActive).toBe('iA');
    expect(Object.keys(ApiData).length).toBe(3);
  });

  test('no extra properties', async () => {
    expect(Object.keys(DatabaseData).length).toBe(4);
    expect(Object.keys(ApiData).length).toBe(3);
  });

  test('$type stays a ghost type property', async () => {
    expect(DatabaseData.$type).toBeUndefined();
    expect(ApiData.$type).toBeUndefined();
  });

  /**
   * There should be no type errors here.
   */
  test('strong typing', async () => {
    type DatabaseDataType = typeof DatabaseData.$type;
    type ApiDataType = typeof ApiData.$type;

    // Mimic database response.
    const databaseResponse: DatabaseDataType[] = [
      { id: 1, is_active: 0, primary_title: null, unused_field: null },
      { id: 2, is_active: 1, primary_title: 'My Title!', unused_field: null },
      { id: 3, is_active: 0, primary_title: null, unused_field: '_' },
    ];

    // Mimic transforming database response to create an API response.
    const apiResponse: ApiDataType[] = databaseResponse.map((r) => ({
      [ApiData.id]: r[DatabaseData.id],
      [ApiData.title]: r[DatabaseData.title] ?? '',
      [ApiData.isActive]: r[DatabaseData.isActive] === 1,
    }));

    const firstDatabaseResponseRow = databaseResponse[0];

    // Indexing using database dataset.
    expect(firstDatabaseResponseRow[DatabaseData.id]).toBe(1);
    expect(firstDatabaseResponseRow[DatabaseData.title]).toBeNull();
    expect(firstDatabaseResponseRow[DatabaseData.isActive]).toBe(0);
    expect(firstDatabaseResponseRow[DatabaseData.unusedField]).toBeNull();

    const firstApiResponseRow = apiResponse[0];

    // Indexing using database dataset.
    expect(firstApiResponseRow[ApiData.id]).toBe(1);
    expect(firstApiResponseRow[ApiData.title]).toBe('');
    expect(firstApiResponseRow[ApiData.isActive]).toBe(false);
  });
});
