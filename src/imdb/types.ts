import type { ImdbData, TvData } from './constants';

export type ImdbTitleBasics = typeof ImdbData.ImdbTitleBasics.$type;
export type ImdbTitleEpisode = typeof ImdbData.ImdbTitleEpisode.$type;
export type ImdbTitleRatings = typeof ImdbData.ImdbTitleRatings.$type;

/**
 * IMDb tv series details.
 */
export type ImdbTvSeriesDetails = typeof TvData.$type;

/**
 * IMDb tv series search item.
 */
export type ImdbSearchItem = Pick<ImdbTvSeriesDetails, typeof TvData.tconst | typeof TvData.primaryTitle | typeof TvData.startYear | typeof TvData.numVotes>;

export type ImdbEpisode = Pick<ImdbTvSeriesDetails, typeof TvData.tconst | typeof TvData.primaryTitle | typeof TvData.averageRating | typeof TvData.numVotes>;

export type ImdbMapUtil<T extends keyof ImdbTitleEpisode, V> =
  | {
      [K in NonNullable<ImdbTitleEpisode[T]>]: V;
    }
  | undefined;

export type ImdbMap = ImdbMapUtil<typeof ImdbData.ImdbTitleEpisode.seasonNumber, ImdbMapUtil<typeof ImdbData.ImdbTitleEpisode.episodeNumber, ImdbEpisode>>;

export type ImdbMapIndexUtil<T extends keyof ImdbTitleEpisode> = NonNullable<ImdbTitleEpisode[T]>[];

export type ImdbMapSeasonIndex = ImdbMapIndexUtil<typeof ImdbData.ImdbTitleEpisode.seasonNumber>;

export type ImdbMapEpisodeIndex = ImdbMapIndexUtil<typeof ImdbData.ImdbTitleEpisode.episodeNumber>;
