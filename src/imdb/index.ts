import { Api, ApiRequest } from '../api/api';
import { Branch, MIME } from '../api/constants';
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
        baseUrl: `/${imdbDir.dir}/${Branch.Default}`,
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
            request = new ApiRequest({ baseUrl: imdbTvSearchFile.file }, request);

            return Api.fetch<ImdbTvSeriesDetails, TResponse>(request);
          },
          details: ({ id }: ImdbTvDetailsParams) => {
            request = new ApiRequest({ baseUrl: `/${id}.json` }, request);

            console.log(request.baseUrl);

            return Api.fetch<ImdbTvSeriesDetails, TResponse>(request);
          },
        };
      },
    };
  },
});
