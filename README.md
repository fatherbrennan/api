# API

API by yours truly :tada:.

## APIs

- ### [IMDb](./src/imdb/README.md)

## Usage

**IMDb API example**

```typescript
import { Api } from '@fatherbrennan/api/dist/api';
import { TvData } from '@fatherbrennan/api/dist/imdb';

// Create a request to an API endpoint.
const request = Api.get().imdb().tv().search();

// URL request string. Can be used to pass to custom HTTP handler.
request.url;

// Send the request and save the response.
const response = await request.fetch();

// Handling the response.
const { data, isSuccess } = response;

if (isSuccess && data !== null) {
  // Handle expected response.
  // Print the first search item title.
  console.log(data[0][TvData.primaryTitle]);
}
```

## Development

### Directory structure

- `/` Global configuration and license files.
  - `.github/workflows` GitHub Actions workflows.
  - `.vscode/` Visual Studio Code workspace settings and configuration files.
  - `src/` Source files.
  - `src/` Source files.
    - `api/` Shared TypeScript, Bun and Node code.
      - `common/` Files to be included in NPM package.
    - `*/` Source files for each individual API.
  - `dist/` Build files for NPM.
  - `tmp/` Build files from scripts.

## License

Code and documentation found in the `master` branch is subject to an MIT license.

Data files found in the `get` branch are subject to their own license, which can be found in their respective directory in the `master` branch.
