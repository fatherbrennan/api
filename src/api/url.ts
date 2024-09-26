export type UrlBuilderQueryParamsValue = string | number | boolean | undefined;

export type UrlBuilderQueryParams = Record<string, UrlBuilderQueryParamsValue>;

export class UrlBuilder {
  /**
   * URL encode value.
   * @param value Value to encode.
   * @returns Encoded string.
   */
  // public static encodeSubstring(value: Exclude<UrlBuilderQueryParamsValue, undefined>): string {
  public static encodeSubstring(value: NonNullable<UrlBuilderQueryParamsValue>): string {
    return encodeURIComponent(value);
  }

  /**
   * Generate a URL query string from an object where the key is the query parameter and the value is the query value.
   * @param params Query object.
   * @returns URL query string.
   */
  public static query(params: UrlBuilderQueryParams) {
    const keys = Object.keys(params);

    if (keys.length === 0) {
      return '';
    }

    let q = '?';

    for (let i = 0; i < keys.length; i++) {
      const key: keyof UrlBuilderQueryParams = keys[i];
      const value = params[key];
      value !== undefined && (q += `${key}=${this.encodeSubstring(value)}&`);
    }

    return q.slice(0, -1);
  }
}
