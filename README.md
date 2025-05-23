# Forum Generic

This repository contains a simple front-end application for viewing and creating forum posts. The project is entirely client-side and must be served from a local web server.

This project is licensed under the [MIT License](LICENSE).

## Prerequisites

- A local web server. You can use `http-server` from Node.js or Python's built in `http.server` module.
- Optionally, Node.js if you want to use `http-server`.

## Running locally

1. Start a local web server in the project directory. Examples:

   ```bash
   # Using Node.js (http-server)
   npm install -g http-server
   http-server .

   # Using Python
   python3 -m http.server
   ```

   By default the server runs on port 8080. Adjust the command if you want a different port.

2. Open your browser at `http://localhost:8080/index.html` (or the port you chose) to use the application.

No build step is needed—serving the static files is enough to run the forum locally.

## Configuration

Create a `src/config.js` file or provide the values as environment variables when bundling. A template is available at `src/config.example.js`.

### Fields

- **API_KEY** – GraphQL API key used for both HTTP and WebSocket requests. Obtain this from your Ontraport account or whichever backend you use.
- **AWS_PARAM** – Base64 encoded `awsParam` string required to request a pre-signed S3 upload URL. On an Ontraport page you can read this value from `window.awsParam`. The helper functions `decodeAwsParam()` and `encodeAwsParam()` in `src/utils/handleFile.js` illustrate how to work with it.
- **AWS_PARAM_URL** – Endpoint that receives the `awsParam` and returns S3 upload parameters. This is usually `https://<your-domain>/s/aws` when using Ontraport.
- **HTTP_ENDPOINT** – URL of the GraphQL HTTP endpoint.
- **WS_ENDPOINT** – GraphQL WebSocket endpoint for real-time updates. Typically the same host as `HTTP_ENDPOINT` using `wss://` and appending `?apiKey=YOUR_API_KEY`.

When running in the browser without a bundler, copy `src/config.example.js` to `src/config.js` and fill in your actual values. Consider adding `src/config.js` to `.gitignore` if you wish to keep these secrets out of version control.
