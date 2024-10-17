import { Type } from '../api/constants';
import { createDataset } from '../api/dataset';

export const imdbDirName = 'imdb';

export const imdbTvDirName = 'tv';

export const imdbTvSearchFileName = 'search.json';

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

export const ImdbData = {
  ImdbTitleBasics: createDataset({
    /**
     * Alphanumeric unique identifier of the title.
     */
    tconst: {
      key: 'tconst',
      _required: true,
      _type: Type.String,
    },
    /**
     * The type/format of the title.
     */
    titleType: {
      key: 'titleType',
      _required: true,
      _type: Type.ImdbTitleType,
    },
    /**
     * The more popular title / the title used by the filmmakers on promotional materials at the point of release.
     */
    primaryTitle: {
      key: 'primaryTitle',
      _required: true,
      _type: [Type.String, Type.Number],
    },
    /**
     * Original title, in the original language.
     */
    originalTitle: {
      key: 'originalTitle',
      _required: true,
      _type: Type.String,
    },
    /**
     * - `0`: non-adult title.
     * - `1`: adult title.
     */
    isAdult: {
      key: 'isAdult',
      _required: true,
      _type: Type.Bit,
    },
    /**
     * Represents the release year of a title. In the case of TV Series, it is the series start year.
     */
    startYear: {
      key: 'startYear',
      _required: false,
      _type: Type.Number,
    },
    /**
     * TV Series end year. `‘\N’` for all other title types.
     */
    endYear: {
      key: 'endYear',
      _required: false,
      _type: Type.Number,
    },
    /**
     * Primary runtime of the title, in minutes.
     */
    runtimeMinutes: {
      key: 'runtimeMinutes',
      _required: false,
      _type: Type.Number,
    },
    /**
     * Includes up to three genres associated with the title.
     * CSV format.
     */
    genres: {
      key: 'genres',
      _required: false,
      _type: Type.String,
    },
  } as const),
  ImdbTitleEpisode: createDataset({
    /**
     * Alphanumeric identifier of episode.
     */
    tconst: {
      key: 'tconst',
      _required: true,
      _type: Type.String,
    },
    /**
     * Alphanumeric identifier of the parent TV Series.
     */
    parentTconst: {
      key: 'parentTconst',
      _required: true,
      _type: Type.String,
    },
    /**
     * Season number the episode belongs to.
     */
    seasonNumber: {
      key: 'seasonNumber',
      _required: false,
      _type: Type.Number,
    },
    /**
     * Episode number of the tconst in the TV series.
     */
    episodeNumber: {
      key: 'episodeNumber',
      _required: false,
      _type: Type.Number,
    },
  } as const),
  ImdbTitleRatings: createDataset({
    /**
     * Alphanumeric unique identifier of the title.
     */
    tconst: {
      key: 'tconst',
      _required: true,
      _type: Type.String,
    },
    /**
     * Weighted average of all the individual user ratings.
     */
    averageRating: {
      key: 'averageRating',
      _required: true,
      _type: Type.Number,
    },
    /**
     * Number of votes the title has received.
     */
    numVotes: {
      key: 'numVotes',
      _required: true,
      _type: Type.Number,
    },
  } as const),
} as const;

/**
 * IMDb API data structure.
 */
export const TvData = createDataset({
  /**
   * Alphanumeric unique identifier of the title.
   */
  tconst: {
    key: 'id',
    _required: true,
    _type: Type.String,
  },
  /**
   * The more popular title / the title used by the filmmakers on promotional materials at the point of release.
   */
  primaryTitle: {
    key: 'pT',
    _required: true,
    _type: Type.String,
  },
  /**
   * Represents the release year of a title. In the case of TV Series, it is the series start year.
   */
  startYear: {
    key: 'sY',
    _required: false,
    _type: Type.Number,
  },
  /**
   * TV Series end year. `‘\N’` for all other title types.
   */
  endYear: {
    key: 'eY',
    _required: false,
    _type: Type.Number,
  },
  /**
   * Primary runtime of the title, in minutes.
   */
  runtimeMinutes: {
    key: 'rM',
    _required: false,
    _type: Type.Number,
  },
  /**
   * Weighted average of all the individual user ratings.
   */
  averageRating: {
    key: 'aR',
    _required: true,
    _type: Type.Number,
  },
  /**
   * Number of votes the title has received.
   */
  numVotes: {
    key: 'nV',
    _required: true,
    _type: Type.Number,
  },
  /**
   * Boolean representation if title is adult content.
   */
  isAdult: {
    key: 'iA',
    _required: true,
    _type: Type.Boolean,
  },
  /**
   * Genres in a string array.
   */
  genres: {
    key: 'g',
    _required: true,
    _type: Type.StringArray,
  },
  /**
   * Ordered index for episodes in the episode map.
   */
  episodeIndex: {
    key: 'eI',
    _required: true,
    _type: Type.ImdbMapIndex,
  },
  /**
   * Ordered index for seasons in the episode map.
   */
  seasonsIndex: {
    key: 'sI',
    _required: true,
    _type: Type.ImdbMapIndex,
  },
  /**
   * Map of all the episodes.
   */
  episodeMap: {
    key: 'eM',
    _required: true,
    _type: Type.ImdbMap,
  },
} as const);
