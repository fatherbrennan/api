import type { Data, DatasetConfig, TitleType } from './constants';

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
 * Valid types.
 */
export type TypeAsString = 'boolean' | 'number' | 'string' | 'map' | 'mapIndex' | 'stringArray' | 'episodeArray' | 'titleType';

/**
 * Get the type from given `TypeAsString`.
 */
export type GetTypeFromString<T extends TypeAsString> = T extends 'boolean'
  ? boolean
  : T extends 'number'
    ? number
    : T extends 'string'
      ? string
      : T extends 'titleType'
        ? (typeof TitleType)[keyof typeof TitleType]
        : T extends 'map'
          ? ImdbMap
          : T extends 'mapIndex'
            ? ImdbMapIndexUtil<typeof Data.ImdbTitleEpisode.seasonNumber.map | typeof Data.ImdbTitleEpisode.episodeNumber.map>
            : T extends 'stringArray'
              ? string[]
              : T extends 'episodeArray'
                ? ImdbEpisode[]
                : never;

export type InferDataset<T extends DatasetConfig> = {
  [K in keyof T]: {
    col: T[K]['col'];
    map: T[K]['map'];
  };
} & {
  $col: { [K in keyof T as T[K]['col']]: SetNullable<GetTypeFromString<T[K]['_type']>, T[K]['_required']> };
  $map: { [K in keyof T as T[K]['map']]: SetNullable<GetTypeFromString<T[K]['_type']>, T[K]['_required']> };
};

export type ImdbGenerated = typeof Data.Generated.$map;

export type ImdbTitleBasics = typeof Data.ImdbTitleBasics.$map;
export type ImdbTitleEpisode = typeof Data.ImdbTitleEpisode.$map;
export type ImdbTitleRatings = typeof Data.ImdbTitleRatings.$map;

export type ImdbTitleBasicsRaw = typeof Data.ImdbTitleBasics.$col;
export type ImdbTitleEpisodeRaw = typeof Data.ImdbTitleEpisode.$col;
export type ImdbTitleRatingsRaw = typeof Data.ImdbTitleRatings.$col;

export type ImdbEpisode = PartialNullable<
  Pick<ImdbTitleEpisode, typeof Data.ImdbTitleEpisode.tconst.map> &
    Pick<ImdbTitleBasics, typeof Data.ImdbTitleBasics.primaryTitle.map> &
    Pick<ImdbTitleRatings, typeof Data.ImdbTitleRatings.averageRating.map | typeof Data.ImdbTitleRatings.numVotes.map>
>;

export type ImdbMapUtil<T extends keyof ImdbTitleEpisode, V> =
  | {
      [K in NonNullable<ImdbTitleEpisode[T]>]: V;
    }
  | undefined;

export type ImdbMap = ImdbMapUtil<typeof Data.ImdbTitleEpisode.seasonNumber.map, ImdbMapUtil<typeof Data.ImdbTitleEpisode.episodeNumber.map, ImdbEpisode>>;

export type ImdbMapIndexUtil<T extends keyof ImdbTitleEpisode> = NonNullable<ImdbTitleEpisode[T]>[];

export type ImdbMapSeasonIndex = ImdbMapIndexUtil<typeof Data.ImdbTitleEpisode.seasonNumber.map>;

export type ImdbMapEpisodeIndex = ImdbMapIndexUtil<typeof Data.ImdbTitleEpisode.episodeNumber.map>;

export type ImdbSearchItem = Pick<ImdbTitleRatings, typeof Data.ImdbTitleRatings.numVotes.map> &
  Pick<
    ImdbTitleBasics,
    typeof Data.ImdbTitleEpisode.tconst.map | typeof Data.ImdbTitleEpisode.tconst.map | typeof Data.ImdbTitleBasics.primaryTitle.map | typeof Data.ImdbTitleBasics.startYear.map
  >;

export type ImdbTvSeriesDetails = ImdbGenerated &
  Pick<
    ImdbTitleBasics,
    | typeof Data.ImdbTitleBasics.endYear.map
    | typeof Data.ImdbTitleBasics.isAdult.map
    | typeof Data.ImdbTitleBasics.primaryTitle.map
    | typeof Data.ImdbTitleBasics.runtimeMinutes.map
    | typeof Data.ImdbTitleBasics.startYear.map
    | typeof Data.ImdbTitleBasics.tconst.map
  > &
  Pick<ImdbTitleRatings, typeof Data.ImdbTitleRatings.averageRating.map | typeof Data.ImdbTitleRatings.numVotes.map>;
