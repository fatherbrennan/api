import { gunzipSync, write } from 'bun';
import { parse } from 'papaparse';

import { FileSystem } from '../../api/file-system';
import { ImdbData, imdbDirName, imdbTvDirName, imdbTvSearchFileName, TitleType, TvData } from '../constants';
import { sortAsc } from './utils';

import type { RequiredNonNullable } from '../../api/types';
import type { ImdbMap, ImdbMapEpisodeIndex, ImdbMapSeasonIndex, ImdbSearchItem, ImdbTitleBasics, ImdbTitleEpisode, ImdbTvSeriesDetails } from '../types';

type Basics = Pick<
  ImdbTvSeriesDetails,
  typeof TvData.primaryTitle | typeof TvData.startYear | typeof TvData.endYear | typeof TvData.runtimeMinutes | typeof TvData.isAdult | typeof TvData.genres
>;

type Ratings = Pick<ImdbTvSeriesDetails, typeof TvData.averageRating | typeof TvData.numVotes>;

type SeriesDictionary = Record<
  ImdbTitleEpisode[typeof ImdbData.ImdbTitleEpisode.parentTconst],
  | {
      /**
       * Basics.
       */
      b?: Basics;
      /**
       * Episodes.
       */
      e: ImdbTitleEpisode[typeof ImdbData.ImdbTitleEpisode.tconst][];
    }
  | undefined
>;

type EpisodeDictionary = Record<
  ImdbTitleEpisode[typeof ImdbData.ImdbTitleEpisode.tconst],
  (RequiredNonNullable<Pick<ImdbTitleEpisode, typeof ImdbData.ImdbTitleEpisode.seasonNumber | typeof ImdbData.ImdbTitleEpisode.episodeNumber>> & Partial<Basics>) | undefined
>;

type RatingDictionary = Record<ImdbTitleBasics[typeof ImdbData.ImdbTitleBasics.tconst], Ratings | undefined>;

interface ImdbDatasetConfig<T extends keyof typeof ImdbData> {
  source: string;
  handler: (data: (typeof ImdbData)[T]['$type']) => void;
}

(async () => {
  const imdbDir = FileSystem.directory(imdbDirName);
  const imdbTvDir = FileSystem.directory(imdbTvDirName, imdbDir);
  const imdbTvSearchFile = FileSystem.file(imdbTvSearchFileName, imdbTvDir);
  const ratingDictionary: RatingDictionary = {};
  const seriesDictionary: SeriesDictionary = {};
  const episodeDictionary: EpisodeDictionary = {};

  async function imdbDataset<T extends keyof typeof ImdbData>(dataset: T, { source, handler }: ImdbDatasetConfig<T>) {
    // Decoder.
    const decoder = new TextDecoder();

    // Fetch the gzip file.
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(JSON.stringify({ source, status: response.statusText }));
    }

    // Extract.
    // Logging.
    console.log(`[GZIP]: ${dataset}->Extract->Start`);
    const gzipBuffer = await response.arrayBuffer();
    const tsvBuffer = gunzipSync(gzipBuffer);
    const tsvString = decoder.decode(tsvBuffer);
    // Logging.
    console.log(`[GZIP]: ${dataset}->Extract->Done`);

    // Verbose.
    const loggerSize = 100000;
    let logger = 0;

    // Write to JSON file.
    async function handleStep(data: (typeof ImdbData)[T]['$type']) {
      try {
        logger++;

        // Add to relevant dictionary.
        handler(data);

        // Logging.
        logger % loggerSize === 0 && console.log(`[PARSE]: ${dataset}->${logger}->rows`);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    // Parse TSV.
    parse<(typeof ImdbData)[T]['$type']>(tsvString, {
      header: true,
      dynamicTyping: true,
      delimiter: '\t',
      fastMode: true,
      skipEmptyLines: true,
      transform: (value) => (value === '\\N' ? null : value),
      step: async (results) => await handleStep(results.data),
    });
  }

  try {
    const ts = performance.now();

    // Handle rating data first since it is a smaller dataset and the main filter.
    await imdbDataset('ImdbTitleRatings', {
      source: 'https://datasets.imdbws.com/title.ratings.tsv.gz',
      handler: (data) => {
        const { averageRating, numVotes, tconst } = data;

        const ratings: Ratings = {
          [TvData.averageRating]: averageRating,
          [TvData.numVotes]: numVotes,
        };

        // Add all ratings to the dictionary.
        ratingDictionary[tconst] = ratings;
      },
    });

    await imdbDataset('ImdbTitleEpisode', {
      source: 'https://datasets.imdbws.com/title.episode.tsv.gz',
      handler: (data) => {
        const { seasonNumber, episodeNumber } = data;

        // Do not include any unknown episodes.
        if (seasonNumber === null || episodeNumber === null) {
          return;
        }

        const { parentTconst: seriesTconst, tconst: episodeTconst } = data;

        // Do not include any series or episodes that have no rating information.
        if (ratingDictionary[seriesTconst] === undefined || ratingDictionary[episodeTconst] === undefined) {
          return;
        }

        // Ensure series exists.
        !seriesDictionary[seriesTconst] && (seriesDictionary[seriesTconst] = { e: [] });

        // Map and store wanted values.
        seriesDictionary[seriesTconst].e.push(episodeTconst);
        episodeDictionary[episodeTconst] = {
          [ImdbData.ImdbTitleEpisode.seasonNumber]: seasonNumber,
          [ImdbData.ImdbTitleEpisode.episodeNumber]: episodeNumber,
        };
      },
    });

    await imdbDataset('ImdbTitleBasics', {
      source: 'https://datasets.imdbws.com/title.basics.tsv.gz',
      handler: (data) => {
        const { tconst, titleType } = data;

        const isSeries = titleType === TitleType.TvSeries || titleType === TitleType.TvMiniSeries;
        const isEpisode = titleType === TitleType.TvEpisode;

        // Only handle tv series, tv mini series, and tv episodes.
        if ((!isSeries && !isEpisode) || (!seriesDictionary[tconst] && !episodeDictionary[tconst])) {
          return;
        }

        const { endYear, genres, isAdult, primaryTitle, runtimeMinutes, startYear } = data;
        const basics: Basics = {
          [TvData.primaryTitle]: primaryTitle.toString(),
          [TvData.startYear]: startYear,
          [TvData.endYear]: endYear,
          [TvData.runtimeMinutes]: runtimeMinutes,
          [TvData.isAdult]: isAdult === 1,
          [TvData.genres]: genres ? genres.split(',') : [],
        };

        // Handle series.
        if (isSeries) {
          // Map and store wanted values.
          seriesDictionary[tconst]!.b = basics;
          return;
        }

        // Handle episode.

        // Map and store wanted values.
        episodeDictionary[tconst] = {
          ...episodeDictionary[tconst]!,
          ...basics,
        };
      },
    });

    // Setup directory and files.
    await imdbTvDir.clear();
    await imdbTvSearchFile.touch();

    imdbTvSearchFile.writer().write('[');
    // Track if first item has been added to search JSON file - used as condition to add commas.
    let doesSearchHaveFirstJsonItem = false;
    let seriesCounter = 0;

    // Logging.
    console.log('[API]: Generate->Start');

    for (const seriesTconst in seriesDictionary) {
      const series = seriesDictionary[seriesTconst]!;
      const rating = ratingDictionary[seriesTconst];

      // Guard should prevent unrated series.
      if (!series.b || !rating || series.e.length === 0) {
        // Remove used tv, or tv mini series.
        delete seriesDictionary[seriesTconst];
        continue;
      }

      const episodes = series.e;
      const tvSeriesMap: ImdbMap = {};
      // Use sets to handle uniqueness.
      const seasonIndexSet = new Set<ImdbMapSeasonIndex[number]>();
      const episodeIndexSet = new Set<ImdbMapEpisodeIndex[number]>();

      for (let i = 0; i < episodes.length; i++) {
        const episodeTconst = series.e[i];
        const rating = ratingDictionary[episodeTconst]!;
        const episode = episodeDictionary[episodeTconst]!;

        const { [TvData.averageRating]: averageRating, [TvData.numVotes]: numVotes } = rating;
        const { [TvData.primaryTitle]: primaryTitle, [ImdbData.ImdbTitleEpisode.seasonNumber]: seasonNumber, [ImdbData.ImdbTitleEpisode.episodeNumber]: episodeNumber } = episode;

        // Add indexes.
        seasonIndexSet.add(seasonNumber);
        episodeIndexSet.add(episodeNumber);

        // Create the season object path if it does not exist.
        !tvSeriesMap[seasonNumber] && (tvSeriesMap[seasonNumber] = {});

        // Create episode path in map.
        tvSeriesMap[seasonNumber][episodeNumber] = {
          [TvData.tconst]: episodeTconst,
          [TvData.primaryTitle]: primaryTitle ?? '',
          [TvData.averageRating]: averageRating,
          [TvData.numVotes]: numVotes,
        };

        // Remove used episode data.
        delete episodeDictionary[episodeTconst];
        delete ratingDictionary[episodeTconst];
      }

      // Create search item to be indexed by search engine.
      const searchItem: ImdbSearchItem = {
        [TvData.tconst]: seriesTconst,
        [TvData.primaryTitle]: series.b[TvData.primaryTitle],
        [TvData.startYear]: series.b[TvData.startYear],
        [TvData.numVotes]: rating[TvData.numVotes],
      };

      // Write search item to JSON file.
      imdbTvSearchFile.writer().write(`${doesSearchHaveFirstJsonItem ? ',' : ''}${JSON.stringify(searchItem)}`);
      doesSearchHaveFirstJsonItem = true;

      // Create API result.
      const imdbTvSeriesDetails: ImdbTvSeriesDetails = {
        ...searchItem,
        [TvData.runtimeMinutes]: series.b[TvData.runtimeMinutes],
        [TvData.endYear]: series.b[TvData.endYear],
        [TvData.averageRating]: rating[TvData.averageRating],
        [TvData.numVotes]: rating[TvData.numVotes],
        [TvData.isAdult]: series.b[TvData.isAdult],
        [TvData.genres]: series.b[TvData.genres],
        [TvData.seasonsIndex]: [...seasonIndexSet].sort(sortAsc),
        [TvData.episodeIndex]: [...episodeIndexSet].sort(sortAsc),
        [TvData.episodeMap]: tvSeriesMap,
      };

      // Write API endpoint for tv, or mini series.
      await write(`${imdbTvDir.dirPath}/${seriesTconst}.json`, JSON.stringify(imdbTvSeriesDetails));

      // Increment counter for series added.
      seriesCounter++;

      // Remove used tv, or tv mini series.
      delete seriesDictionary[seriesTconst];
    }

    // Safely close search JSON file.
    imdbTvSearchFile.writer().write(']');
    await imdbTvSearchFile.writer().end();

    // Logging.
    console.log('[API]: Generate->End');
    console.log(`[API]: Generate->${seriesCounter}->items`);

    const te = performance.now();
    // Logging.
    console.log(`[TIME]: ${te - ts}ms`);
  } catch (error) {
    console.error('[ERROR]: Fetching, extracting and inserting data into database', error);
    throw error;
  }
})();
