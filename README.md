# Forum Generic

This project is a simple forum interface. Certain API values need to be provided at runtime.

## Configuration

Create a `scripts/config.js` file or provide environment variables when bundling. A sample configuration is provided in `scripts/config.example.js`.

The following values can be supplied:

- `API_KEY` – API key for GraphQL requests.
- `AWS_PARAM` – Base64 encoded awsParam string used for uploads.
- `AWS_PARAM_URL` – Endpoint to retrieve S3 upload parameters.
- `HTTP_ENDPOINT` – GraphQL HTTP endpoint (optional).
- `WS_ENDPOINT` – GraphQL WebSocket endpoint (optional).

When running in the browser without a bundler, copy `scripts/config.example.js` to `scripts/config.js` and replace the placeholder values with your own. The `.gitignore` file ignores `scripts/config.js` so secrets are not committed.
