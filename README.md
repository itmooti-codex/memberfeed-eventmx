# Forum Generic

This repository contains a simple client-side forum feed. The page uses CDN hosted libraries and communicates with a GraphQL backend.

## Setup

1. Copy `scripts/config.example.js` to `scripts/config.js`:
   ```bash
   cp scripts/config.example.js scripts/config.js
   ```
2. Edit `scripts/config.js` and replace the placeholder values with your API key and endpoint URLs.

## External Libraries

The application relies on several libraries loaded via CDN as referenced in `index.html`:

- [Tailwind CSS](https://cdn.tailwindcss.com)
- Plyr CSS/JS from `cdn.jsdelivr.net` and `cdn.plyr.io`
- FilePond and plugins (`filepond-plugin-file-validate-type`, `filepond-plugin-image-preview`, `filepond-plugin-media-preview`, `filepond-plugin-file-poster`, and `filepond` itself)
- [Tribute.js](https://cdn.jsdelivr.net/npm/tributejs)
- [jQuery 3.6.4](https://code.jquery.com)
- [jsrender](https://cdn.jsdelivr.net/npm/jsrender)
- [Mic Recorder to MP3](https://unpkg.com/mic-recorder-to-mp3)

## Usage

Open `index.html` in a web browser after configuring `config.js`. The page displays a forum feed where you can create posts, upload files, record audio, like, bookmark and filter posts. The script files under `scripts/` handle rendering, uploads and communication with the backend service.

