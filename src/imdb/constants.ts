import { FileSystem } from '../api/file-system';
import type { InferDataset, TypeAsString } from './types';

export type DatasetFieldConfig = {
  col: string;
  map: string;
  _required: boolean;
  _type: TypeAsString;
};

export type DatasetConfig = Record<string, DatasetFieldConfig>;

export const imdbDir = FileSystem.directory('imdb');

export const imdbTvDir = FileSystem.directory('tv', imdbDir);

export const imdbTvSearchFile = FileSystem.file('search.json', imdbTvDir);

const createDataset = <T extends DatasetConfig>(dataset: T) => {
  return dataset as unknown as InferDataset<T>;
};

export const TitleType = {
  Movie: 'movie',
  Short: 'short',
  TvEpisode: 'tvEpisode',
  TvMiniSeries: 'tvMiniSeries',
  TvMovie: 'tvMovie',
  TvSeries: 'tvSeries',
  TvShort: 'tvShort',
  TvSpecial: 'tvSpecial',
  Video: 'video',
  VideoGame: 'videoGame',
} as const;

export const Data = {
  ImdbTitleBasics: createDataset({
    /**
     * Alphanumeric unique identifier of the title.
     */
    tconst: {
      col: 'tconst',
      map: 'id',
      _required: true,
      _type: 'string',
    },
    /**
     * The type/format of the title (e.g. movie, short, tvseries, tvepisode, video, etc).
     */
    titleType: {
      col: 'titleType',
      map: 'tT',
      _required: true,
      _type: 'titleType',
    },
    /**
     * The more popular title / the title used by the filmmakers on promotional materials at the point of release.
     */
    primaryTitle: {
      col: 'primaryTitle',
      map: 'pT',
      _required: true,
      _type: 'string',
    },
    /**
     * Original title, in the original language.
     */
    originalTitle: {
      col: 'originalTitle',
      map: 'oT',
      _required: true,
      _type: 'string',
    },
    /**
     * - `0`: non-adult title.
     * - `1`: adult title.
     */
    isAdult: {
      col: 'isAdult',
      map: 'iA',
      _required: true,
      _type: 'boolean',
    },
    /**
     * Represents the release year of a title. In the case of TV Series, it is the series start year.
     */
    startYear: {
      col: 'startYear',
      map: 'sY',
      _required: false,
      _type: 'number',
    },
    /**
     * TV Series end year. `‘\N’` for all other title types.
     */
    endYear: {
      col: 'endYear',
      map: 'eY',
      _required: false,
      _type: 'number',
    },
    /**
     * Primary runtime of the title, in minutes.
     */
    runtimeMinutes: {
      col: 'runtimeMinutes',
      map: 'rM',
      _required: false,
      _type: 'number',
    },
    /**
     * Includes up to three genres associated with the title.
     * CSV format.
     */
    genres: {
      col: 'genres',
      map: 'g',
      _required: false,
      _type: 'string',
    },
  } as const),
  ImdbTitleEpisode: createDataset({
    /**
     * Alphanumeric identifier of episode.
     */
    tconst: {
      col: 'tconst',
      map: 'id',
      _required: true,
      _type: 'string',
    },
    /**
     * Alphanumeric identifier of the parent TV Series.
     */
    parentTconst: {
      col: 'parentTconst',
      map: 'pId',
      _required: true,
      _type: 'string',
    },
    /**
     * Season number the episode belongs to.
     */
    seasonNumber: {
      col: 'seasonNumber',
      map: 'sN',
      _required: false,
      _type: 'number',
    },
    /**
     * Episode number of the tconst in the TV series.
     */
    episodeNumber: {
      col: 'episodeNumber',
      map: 'eN',
      _required: false,
      _type: 'number',
    },
  } as const),
  ImdbTitleRatings: createDataset({
    /**
     * Alphanumeric unique identifier of the title.
     */
    tconst: {
      col: 'tconst',
      map: 'id',
      _required: true,
      _type: 'string',
    },
    /**
     * Weighted average of all the individual user ratings.
     */
    averageRating: {
      col: 'averageRating',
      map: 'aR',
      _required: true,
      _type: 'number',
    },
    /**
     * Number of votes the title has received.
     */
    numVotes: {
      col: 'numVotes',
      map: 'nV',
      _required: true,
      _type: 'number',
    },
  } as const),
  Generated: createDataset({
    /**
     * Ordered index for episodes in the episode map.
     */
    episodeIndex: {
      col: 'episodeIndex',
      map: 'eI',
      _required: true,
      _type: 'mapIndex',
    },
    /**
     * Ordered index for seasons in the episode map.
     */
    seasonsIndex: {
      col: 'seasonsIndex',
      map: 'sI',
      _required: true,
      _type: 'mapIndex',
    },
    /**
     * Map of all the episodes.
     */
    episodeMap: {
      col: 'episodeMap',
      map: 'eM',
      _required: true,
      _type: 'map',
    },
    /**
     * Genres in a string array.
     */
    genres: {
      col: 'genres',
      map: 'g',
      _required: true,
      _type: 'stringArray',
    },
  } as const),
} as const;
