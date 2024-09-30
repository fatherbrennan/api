import { Api, ApiRequest } from '../api/api';
import { MIME } from '../api/constants';
import { imdbDirName, imdbTvDirName, imdbTvSearchFileName } from './constants';

import type { Data } from './constants';
import type { ImdbSearchItem, ImdbTitleBasics, ImdbTvSeriesDetails } from './types';

export type ImdbTvSearchParams = {
  query: string;
};

export type ImdbTvDetailsParams = {
  id: ImdbTitleBasics[typeof Data.ImdbTitleBasics.tconst.map];
};

export const apiImdbGet = <TResponse>(request: ApiRequest) => ({
  [imdbDirName]: () => {
    request = new ApiRequest(
      {
        baseUrl: `/${imdbDirName}`,
        requestInit: {
          headers: { accept: MIME.JSON },
        },
      },
      request,
    );

    return {
      tv: () => {
        request = new ApiRequest({ baseUrl: `/${imdbTvDirName}` }, request);

        return {
          search: () => {
            request = new ApiRequest({ baseUrl: `/${imdbTvSearchFileName}` }, request);

            return Api.prepareRequest<ImdbSearchItem[], TResponse>(request);
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
