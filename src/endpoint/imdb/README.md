# IMDb

> _**Important**: This is a personal project aimed for personal development and usage. Use of this API is to align with [licensing](#license)._

# Data

## `Data` structure

The use of `*Data` structures allow for mapping and type safety. Mapping is used to reduce payload overhead.

**Recommended**

Unless `tconst` is no longer supported, for the foreseeable future, the following will work as long as the package is up to date.

```typescript
import { TvData } from '@fatherbrennan/api/dist/imdb';

apiImdbResponse[TvData.tconst];
```

**Not Recommended**

If the mapping for `tconst` changes, the following will break and updating the package will not fix it.

```typescript
apiImdbResponse.id;
```

## `/tv`

Contains all TV series and mini series which contain rating information.

### Conditions for data inclusion:

- Series must contain rating information.
- There must be at least one episode in the rated series which contains rating information.

### Usage

```typescript
import { Api } from '@fatherbrennan/api/dist/api';
import { TvData } from '@fatherbrennan/api/dist/imdb';

// Create a request to API endpoint.
const searchResponse = await Api.get().imdb().tv().search().fetch();

// Handling successful response.
if (searchResponse.isSuccess && searchResponse.data !== null) {
  // Recommended to feed into some sort of search engine.
  // Below is just an example demonstrating logic, using a simple inefficient search.

  const searchTerm = 'the office';

  // Get the top result from the search
  const searchTopHit = searchResponse.data
    .filter((item) => item[TvData.primaryTitle].toLowerCase() === searchTerm)
    // Sort all filtered results by their vote count, and return the top result.
    .sort((a, b) => b[TvData.numVotes] - a[TvData.numVotes]);

  // Get the details of the top result.
  const seriesResponse = await Api.get().imdb().tv().details({ id: searchTopHit[0][TvData.tconst] }).fetch();

  if (seriesResponse.isSuccess && seriesResponse.data !== null) {
    const series = seriesResponse.data;
    console.log(`
      The top hit for '${searchTerm}' is ${series[TvData.tconst]}.
      Information about the top hit:
      - Identifier:       ${series[TvData.tconst]}
      - Title:            ${series[TvData.primaryTitle]}
      - Start year:       ${series[TvData.startYear]}
      - Runtime minutes:  ${series[TvData.runtimeMinutes]}
      - Average rating:   ${series[TvData.averageRating]}
      - Number of votes:  ${series[TvData.numVotes]}
      - Is adult content: ${series[TvData.isAdult]}
      - Genres:           ${series[TvData.genres]}
    `);
  }
}
```

## Source

- [IMDb Datasets](https://datasets.imdbws.com/)

## License

Use of this API is to align with information on [IMDb Dataset Usage](https://developer.imdb.com/non-commercial-datasets/) and [IMDb Conditions of Use](https://www.imdb.com/conditions).
