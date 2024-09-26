import { Api, ApiRequest } from '../api/api';
import { MIME } from '../api/constants';
import { imdbDir, imdbTvDir, imdbTvSearchFile } from './constants';

import type { Data } from './constants';
import type { ImdbTitleBasics, ImdbTvSeriesDetails } from './types';

export type ImdbTvSearchParams = {
  query: string;
};

export type ImdbTvDetailsParams = {
  id: ImdbTitleBasics[typeof Data.ImdbTitleBasics.tconst.map];
};

export const apiImdbGet = <TResponse>(request: ApiRequest) => ({
  [imdbDir.dir]: () => {
    request = new ApiRequest(
      {
        baseUrl: `/${imdbDir.dir}`,
        requestInit: {
          headers: { accept: MIME.JSON },
        },
      },
      request,
    );

    return {
      tv: () => {
        request = new ApiRequest({ baseUrl: `/${imdbTvDir.dir}` }, request);

        return {
          search: () => {
            request = new ApiRequest({ baseUrl: `/${imdbTvSearchFile.file}` }, request);

            return Api.prepareRequest<ImdbTvSeriesDetails, TResponse>(request);
          },
          details: ({ id }: ImdbTvDetailsParams) => {
            request = new ApiRequest({ baseUrl: `/${id}.json` }, request);

            return Api.prepareRequest<ImdbTvSeriesDetails, TResponse>(request);
          },
        };
      },
    };
  },
});
