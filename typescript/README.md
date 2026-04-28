# TensorTensor - TypeScript Examples

## Setup

```bash
cd examples/typescript
npm install
cp .env.example .env
# edit .env with your API key, vectors URL, etc.
```

## Run

```bash
npm run 01    # 01-generate-index.ts - submit a build, print jobId
npm run 02    # 02-use-index.ts     - download + load + search an existing index
npm run 03    # 03-end-to-end.ts    - submit, poll, search
```

## Files

- `01-generate-index.ts` - POSTs to `/api/v1/build` with your API key, prints the returned `jobId` and `status`.
- `02-use-index.ts` - downloads an HNSW file from `TT_DOWNLOAD_URL` (or fetches via `TT_JOB_ID`), loads it with `hnswlib-node`, generates a random query vector matching `TT_DIMENSIONS`, runs k-NN top-5, prints results.
- `03-end-to-end.ts` - submits a job, polls `GET /api/v1/build/:jobId` every 60 minutes (configurable in code) until `status: complete`, then downloads + loads + searches.
