# Forum Generic

This repository contains a simple front-end application for viewing and creating forum posts. The project is entirely client-side and must be served from a local web server.

## Prerequisites

- A local web server. You can use `http-server` from Node.js or Python's built-in `http.server` module.
- Optionally, Node.js if you want to use `http-server`.

## Environment variables

Configuration values are stored in `scripts/variables.js`. Update the following variables with your own details before running the application:

- `awsParam` – Base64 encoded string used when requesting an S3 upload URL.
- `awsParamUrl` – Endpoint that returns the pre-signed upload URL.
- `API_KEY` – API key for GraphQL requests.
- `WS_ENDPOINT` – WebSocket GraphQL endpoint.
- `HTTP_ENDPOINT` – HTTP GraphQL endpoint.

Edit `scripts/variables.js` to set the values that match your environment. These are required for the application to communicate with your backend services.

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
