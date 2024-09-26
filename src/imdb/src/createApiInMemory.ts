import { gunzipSync, write } from 'bun';
import { parse } from 'papaparse';

import { Data, imdbTvDir, imdbTvSearchFile, TitleType } from '../constants';
import { sortAsc } from './utils';

import type {
  ImdbMap,
  ImdbMapEpisodeIndex,
  ImdbMapSeasonIndex,
  ImdbSearchItem,
  ImdbTitleBasics,
  ImdbTitleEpisode,
  ImdbTitleEpisodeRaw,
  ImdbTitleRatings,
  ImdbTvSeriesDetails,
  RequiredNonNullable,
} from '../types';

type Basics = Pick<
  ImdbTitleBasics,
  | typeof Data.ImdbTitleBasics.primaryTitle.map
  | typeof Data.ImdbTitleBasics.startYear.map
  | typeof Data.ImdbTitleBasics.endYear.map
  | typeof Data.ImdbTitleBasics.runtimeMinutes.map
  | typeof Data.ImdbTitleBasics.isAdult.map
  | typeof Data.ImdbTitleBasics.genres.map
>;

type Ratings = Pick<ImdbTitleRatings, typeof Data.ImdbTitleRatings.averageRating.map | typeof Data.ImdbTitleRatings.numVotes.map>;

type SeriesDictionary = Record<
  ImdbTitleEpisodeRaw[typeof Data.ImdbTitleEpisode.parentTconst.col],
  | {
      /**
       * Basics.
       */
      b?: Basics;
      /**
       * Ratings.
       */
      r?: Ratings;
      /**
       * Episodes.
       */
      e: ImdbTitleEpisode[typeof Data.ImdbTitleEpisode.tconst.map][];
    }
  | undefined
>;

// type Episode = Pick<ImdbTitleEpisodeRaw[typeof Data.ImdbTitleEpisode.]>

type EpisodeDictionary = Record<
  ImdbTitleEpisode[typeof Data.ImdbTitleEpisode.tconst.map],
  | (RequiredNonNullable<Pick<ImdbTitleEpisode, typeof Data.ImdbTitleEpisode.seasonNumber.map | typeof Data.ImdbTitleEpisode.episodeNumber.map>> &
      Partial<Basics> &
      Partial<Ratings>)
  | undefined
>;

interface ImdbDatasetConfig<T extends keyof typeof Data> {
  source: string;
  handler: (data: (typeof Data)[T]['$col']) => void;
}

(async () => {
  const seriesDictionary: SeriesDictionary = {};
  const episodeDictionary: EpisodeDictionary = {};

  async function imdbDataset<T extends keyof typeof Data>(dataset: T, { source, handler }: ImdbDatasetConfig<T>) {
    // Decoder.
    const decoder = new TextDecoder();

    // Fetch the gzip file.
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(JSON.stringify({ source, status: response.statusText }));
    }

    // Extract.
    // Logging
    console.log(`[GZIP]: ${dataset}->Extract->Start`);
    const gzipBuffer = await response.arrayBuffer();
    const tsvBuffer = gunzipSync(gzipBuffer);
    const tsvString = decoder.decode(tsvBuffer);
    // Logging
    console.log(`[GZIP]: ${dataset}->Extract->Done`);

    // Verbose.
    const loggerSize = 100000;
    let logger = 0;

    // Write to JSON file.
    async function handleStep(data: (typeof Data)[T]['$col']) {
      try {
        logger++;

        // Add to relevant dictionary.
        handler(data);

        // Logging
        logger % loggerSize === 0 && console.log(`[PARSE]: ${dataset}->${logger}->rows`);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    // Parse TSV.
    parse<(typeof Data)[T]['$col']>(tsvString, {
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

    await imdbDataset('ImdbTitleEpisode', {
      source: 'https://datasets.imdbws.com/title.episode.tsv.gz',
      handler: (data) => {
        const { seasonNumber, episodeNumber } = data;

        // Do not include any unknown episodes.
        if (seasonNumber === null || episodeNumber === null) {
          return;
        }

        const { parentTconst: seriesTconst, tconst: episodeTconst } = data;

        // Ensure series exists.
        !seriesDictionary[seriesTconst] && (seriesDictionary[seriesTconst] = { e: [] });

        // Map and store wanted values.
        seriesDictionary[seriesTconst].e.push(episodeTconst);
        episodeDictionary[episodeTconst] = {
          [Data.ImdbTitleEpisode.seasonNumber.map]: seasonNumber,
          [Data.ImdbTitleEpisode.episodeNumber.map]: episodeNumber,
        };
      },
    });

    await imdbDataset('ImdbTitleRatings', {
      source: 'https://datasets.imdbws.com/title.ratings.tsv.gz',
      handler: (data) => {
        const { averageRating, numVotes, tconst } = data;
        const rating = {
          [Data.ImdbTitleRatings.averageRating.map]: averageRating,
          [Data.ImdbTitleRatings.numVotes.map]: numVotes,
        };

        // Add rating to series if series.
        if (seriesDictionary[tconst]) {
          // Map and store wanted values.
          seriesDictionary[tconst].r = rating;
          return;
        }

        // Add rating to episode if episode.
        if (episodeDictionary[tconst]) {
          // Map and store wanted values.
          episodeDictionary[tconst] = {
            ...episodeDictionary[tconst],
            ...rating,
          };
          return;
        }
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
        const basics = {
          [Data.ImdbTitleBasics.primaryTitle.map]: primaryTitle,
          [Data.ImdbTitleBasics.startYear.map]: startYear,
          [Data.ImdbTitleBasics.endYear.map]: endYear,
          [Data.ImdbTitleBasics.runtimeMinutes.map]: runtimeMinutes,
          [Data.ImdbTitleBasics.isAdult.map]: isAdult,
          [Data.ImdbTitleBasics.genres.map]: genres,
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

    // Logging
    console.log('[API]: Generate->Start');

    for (const seriesTconst in seriesDictionary) {
      const series = seriesDictionary[seriesTconst]!;

      // Guard should prevent unrated episodes.
      if (!series.b || !series.r || series.e.length === 0) {
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
        const episode = episodeDictionary[episodeTconst]!;

        const {
          [Data.ImdbTitleBasics.primaryTitle.map]: primaryTitle,
          [Data.ImdbTitleEpisode.seasonNumber.map]: seasonNumber,
          [Data.ImdbTitleEpisode.episodeNumber.map]: episodeNumber,
          [Data.ImdbTitleRatings.averageRating.map]: averageRating,
          [Data.ImdbTitleRatings.numVotes.map]: numVotes,
        } = episode;

        // Add indexes.
        seasonIndexSet.add(seasonNumber);
        episodeIndexSet.add(episodeNumber);

        // Create the season object path if it does not exist.
        !tvSeriesMap[seasonNumber] && (tvSeriesMap[seasonNumber] = {});

        // Guard should never be reached, but used to ensure expected data.
        if (!primaryTitle || averageRating === undefined || numVotes === undefined) {
          // Remove used episode.
          delete episodeDictionary[episodeTconst];
          continue;
        }

        // Create episode path in map.
        tvSeriesMap[seasonNumber][episodeNumber] = {
          [Data.ImdbTitleEpisode.tconst.map]: episodeTconst,
          [Data.ImdbTitleBasics.primaryTitle.map]: primaryTitle,
          [Data.ImdbTitleRatings.averageRating.map]: averageRating,
          [Data.ImdbTitleRatings.numVotes.map]: numVotes,
        };

        // Remove used episode.
        delete episodeDictionary[episodeTconst];
      }

      // Create search item to be indexed by search engine.
      const searchItem: ImdbSearchItem = {
        [Data.ImdbTitleBasics.tconst.map]: seriesTconst,
        [Data.ImdbTitleBasics.primaryTitle.map]: series.b[Data.ImdbTitleBasics.primaryTitle.map],
        [Data.ImdbTitleBasics.startYear.map]: series.b[Data.ImdbTitleBasics.startYear.map],
      };

      // Write search item to JSON file.
      imdbTvSearchFile.writer().write(`${doesSearchHaveFirstJsonItem ? ',' : ''}${JSON.stringify(searchItem)}`);
      doesSearchHaveFirstJsonItem = true;

      // Create API result.
      const imdbTvSeriesDetails: ImdbTvSeriesDetails = {
        ...searchItem,
        [Data.ImdbTitleBasics.runtimeMinutes.map]: series.b[Data.ImdbTitleBasics.runtimeMinutes.map],
        [Data.ImdbTitleBasics.endYear.map]: series.b[Data.ImdbTitleBasics.endYear.map],
        [Data.ImdbTitleBasics.isAdult.map]: series.b[Data.ImdbTitleBasics.isAdult.map],
        [Data.ImdbTitleRatings.averageRating.map]: series.r[Data.ImdbTitleRatings.averageRating.map],
        [Data.ImdbTitleRatings.numVotes.map]: series.r[Data.ImdbTitleRatings.numVotes.map],
        [Data.Generated.genres.map]: series.b[Data.ImdbTitleBasics.genres.map] ? series.b[Data.ImdbTitleBasics.genres.map]!.split(',') : [],
        [Data.Generated.seasonsIndex.map]: [...seasonIndexSet].sort(sortAsc),
        [Data.Generated.episodeIndex.map]: [...episodeIndexSet].sort(sortAsc),
        [Data.Generated.episodeMap.map]: tvSeriesMap,
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

    // Logging
    console.log('[API]: Generate->End');
    console.log(`[API]: Generate->${seriesCounter}->items`);

    const te = performance.now();
    // Logging
    console.log(`[TIME]: ${te - ts}ms`);
  } catch (error) {
    console.error('[ERROR]: Fetching, extracting and inserting data into database', error);
    throw error;
  }
})();
