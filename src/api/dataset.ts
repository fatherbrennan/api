import type { Type } from './constants';

import type { GetTypeFromString, SetNullable } from './types';

export type DatasetFieldConfig = {
  key: string;
  _required: boolean;
  _type: (typeof Type)[keyof typeof Type];
};

export type DatasetConfig = Record<string, DatasetFieldConfig>;

export type InferDataset<T extends DatasetConfig> = {
  [K in keyof T]: T[K]['key'];
} & {
  $type: { [K in keyof T as T[K]['key']]: SetNullable<GetTypeFromString<T[K]['_type']>, T[K]['_required']> };
};

/**
 * Define a new dataset with specified properties.
 * @returns Simple object with strong typing attached to `dataset.$type`.
 */
export const createDataset = <T extends DatasetConfig>(dataset: T): InferDataset<T> => {
  const data: any = {};
  for (const key in dataset) {
    data[key] = dataset[key].key;
    delete dataset[key];
  }
  return data;
};
