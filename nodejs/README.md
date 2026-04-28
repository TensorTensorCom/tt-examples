# TensorTensor — Node.js Examples (pure JavaScript)

## Setup

```bash
cd examples/nodejs
npm install
cp .env.example .env
# edit .env with your API key, vectors URL, etc.
```

## Run

```bash
npm run 01    # 01-generate-index.js — submit a build, print jobId
npm run 02    # 02-use-index.js     — download + load + search an existing index
npm run 03    # 03-end-to-end.js    — submit, poll, search
```

## Files

- `01-generate-index.js` — POSTs to `/api/v1/build` with your API key, prints the returned `jobId` and `status`.
- `02-use-index.js` — downloads an HNSW file from `TT_DOWNLOAD_URL` (or fetches via `TT_JOB_ID`), loads it with `hnswlib-node`, generates a random query vector matching `TT_DIMENSIONS`, runs k-NN top-5, prints results.
- `03-end-to-end.js` — submits a job, polls `GET /api/v1/build/:jobId` every 60 minutes (configurable in code) until `status: complete`, then downloads + loads + searches.

## Notes

- The 60-minute polling interval matches typical build durations; for testing with small vector sets you may want to drop this to 60 seconds (see top of `03-end-to-end.js`).
- `hnswlib-node` is the standard Node binding for the HNSW algorithm; it's used here only to load and query the file the API produces.
