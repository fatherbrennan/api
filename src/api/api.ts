import { apiImdbGet } from '../imdb';
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
  controller: AbortController;
  /**
   * The expected response on `isSuccess = true`.
   */
  data: T | null;
  /**
   * Exception.
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
   * If the request was successful, inclusive of response status code.
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
  public static async fetch<TDefaultResponse, TResponse = undefined>(request: ApiRequest) {
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
      const r = await fetch(`${request.baseUrl}${UrlBuilder.query(request.params)}`, { signal: controller.signal, ...request.requestInit });
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

  /**
   * @example
   * ```ts
   * const { data, hasException, isAborted, isSuccess } = await Api.get()
   *   .imdb()
   *   .tv();
   * ```
   */
  public static get<TResponse = undefined>() {
    const request = new ApiRequest({ baseUrl: 'https://raw.githubusercontent.com/fatherbrennan/api', requestInit: { method: 'GET' } });

    return {
      ...apiImdbGet<TResponse>(request),
    };
  }
}
