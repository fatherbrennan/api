export type UrlQueryParamsValue = string | number | boolean | undefined;

export type UrlQueryParams = Record<string, UrlQueryParamsValue>;

/**
 * URL encode value.
 * @param value Value to encode.
 * @returns Encoded string.
 */
export const encodeSubstring = (value: NonNullable<UrlQueryParamsValue>): string => {
  return encodeURIComponent(value);
};

/**
 * Generate a URL query string from an object where the key is the query parameter and the value is the query value.
 * @param params Query object.
 * @returns URL query string.
 */
export const query = (params: UrlQueryParams) => {
  const keys = Object.keys(params);

  if (keys.length === 0) {
    return '';
  }

  let q = '?';

  for (let i = 0; i < keys.length; i++) {
    const key: keyof UrlQueryParams = keys[i];
    const value = params[key];

    if (value !== undefined) {
      q += `${key}=${encodeSubstring(value)}&`;
    }
  }

  return q.slice(0, -1);
};
