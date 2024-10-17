export const MIME = {
  JSON: 'application/json',
} as const;

export const Branch = {
  Default: 'get',
} as const;

/**
 * Valid types.
 */
export const Type = {
  Bit: 'bit',
  Boolean: 'boolean',
  ImdbEpisodeArray: 'imdbEpisodeArray',
  ImdbMap: 'imdbMap',
  ImdbMapIndex: 'imdbMapIndex',
  ImdbTitleType: 'imdbTitleType',
  Number: 'number',
  String: 'string',
  StringArray: 'stringArray',
} as const;
