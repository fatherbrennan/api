import type { ImdbData, TitleType } from '../imdb/constants';
import type { ImdbEpisode, ImdbMap, ImdbMapIndexUtil } from '../imdb/types';
import type { Type } from './constants';

export type { ApiRequestProps } from './api';
export type { UrlBuilderQueryParams, UrlBuilderQueryParamsValue } from './url';

/**
 * Make `T` nullable.
 */
export type Nullable<T> = T | null;

/**
 * Make all properties in `T` nullable.
 */
export type PartialNullable<T> = { [K in keyof T]: Nullable<T[K]> };

/**
 * Make all properties in `T` non-nullable.
 */
export type RequiredNonNullable<T> = { [K in keyof T]: NonNullable<T[K]> };

/**
 * Where `T` is the type.
 * Where `R` is if type is required (not nullable).
 */
export type SetNullable<T, R extends boolean> = R extends true ? T : Nullable<T>;

/**
 * Get the type from provided `Type` value.
 */
export type GetTypeFromString<T extends (typeof Type)[keyof typeof Type]> = T extends typeof Type.Bit
  ? 0 | 1
  : T extends typeof Type.Boolean
    ? boolean
    : T extends typeof Type.ImdbEpisodeArray
      ? ImdbEpisode[]
      : T extends typeof Type.ImdbMap
        ? ImdbMap
        : T extends typeof Type.ImdbMapIndex
          ? ImdbMapIndexUtil<typeof ImdbData.ImdbTitleEpisode.seasonNumber | typeof ImdbData.ImdbTitleEpisode.episodeNumber>
          : T extends typeof Type.ImdbTitleType
            ? (typeof TitleType)[keyof typeof TitleType]
            : T extends typeof Type.Number
              ? number
              : T extends typeof Type.String
                ? string
                : T extends typeof Type.StringArray
                  ? string[]
                  : never;
