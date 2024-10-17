import { apiImdbGet } from '../imdb';
import { Branch } from './constants';
import { UrlBuilder } from './url';

import type { UrlBuilderQueryParams } from './url';

export interface ApiRequestProps {
  baseUrl: string;
  params: UrlBuilderQueryParams;
  /** @default 'json' */
  responseType: keyof Pick<Response, 'arrayBuffer' | 'blob' | 'json' | 'text'>;
  requestInit: RequestInit;
}

export interface ApiResponse<T> {
  /**
   * Fetch controller.
   */
  controller: AbortController;
  /**
   * The expected response on `isSuccess = true`.
   */
  data: T | null;
  /**
   * Exception caught, if any.
   */
  exception: null | unknown;
  /**
   * If the request failed due to an exception.
   */
  hasException: boolean;
  /**
   * Request was purposely aborted.
   */
  isAborted: boolean;
  /**
   * If the request was successful, respecting the response status code.
   */
  isSuccess: boolean;
}

export class ApiRequest {
  public baseUrl: ApiRequestProps['baseUrl'] = '';
  public params: ApiRequestProps['params'] = {};
  public requestInit: ApiRequestProps['requestInit'] = {};
  public responseType: ApiRequestProps['responseType'] = 'json';

  constructor(request: Partial<ApiRequestProps>, baseRequest?: ApiRequest) {
    if (baseRequest) {
      this.baseUrl = baseRequest.baseUrl;
      this.params = baseRequest.params;
      this.requestInit = baseRequest.requestInit;
      this.responseType = baseRequest.responseType;
    }

    request.baseUrl && (this.baseUrl += request.baseUrl);
    this.params = { ...this.params, ...request.params };
    this.requestInit = { ...this.requestInit, ...request.requestInit };
    this.responseType = request.responseType ?? this.responseType;
  }
}

export class Api {
  public static async fetch<TDefaultResponse, TResponse = undefined>(url: string, request: ApiRequestProps) {
    // Create controller to allow requests to be aborted
    const controller = new AbortController();
    // Initialize response object
    const response: ApiResponse<TResponse extends undefined ? TDefaultResponse : TResponse> = {
      controller,
      data: null,
      exception: null,
      hasException: true,
      isAborted: false,
      isSuccess: false,
    };

    try {
      const r = await fetch(url, { signal: controller.signal, ...request.requestInit });
      const rType = (await r[request.responseType]()) as TResponse extends undefined ? TDefaultResponse : TResponse;

      // Build and return response object
      response.isSuccess = r.ok;
      response.hasException = false;
      response.data = rType;
      return response;
    } catch (error: unknown) {
      // Build and return response object
      response.isSuccess = false;
      response.hasException = true;
      response.exception = error;
      // Expected error from aborting
      error instanceof Error && error.name === 'AbortError' && (response.isAborted = true);
      return response;
    }
  }

  public static prepareRequest<TDefaultResponse, TResponse = undefined>(request: ApiRequest) {
    const url = `${request.baseUrl}${UrlBuilder.query(request.params)}`;

    return {
      /**
       * Built URL request string.
       */
      url,
      /**
       * Request object.
       */
      request,
      /**
       * Send request and return response.
       */
      fetch: async () => {
        return this.fetch<TDefaultResponse, TResponse>(url, request);
      },
    };
  }

  /**
   * @example
   * ```ts
   * // Return URL.
   * const url = await Api.get().imdb().tv().search().url;
   * // Return response object from HTTP request.
   * const { data, hasException, isAborted, isSuccess } = await Api.get().imdb().tv().search().fetch();
   * ```
   */
  public static get<TResponse = undefined>() {
    const request = new ApiRequest({ baseUrl: `https://raw.githubusercontent.com/fatherbrennan/api/refs/heads/${Branch.Default}`, requestInit: { method: 'GET' } });

    return {
      ...apiImdbGet<TResponse>(request),
    };
  }
}
