# TensorTensor — Python Examples

## Setup

```bash
cd examples/python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with your API key, vectors URL, etc.
```

## Run

```bash
python 01_generate_index.py
python 02_use_index.py
python 03_end_to_end.py
```

## Files

- `01_generate_index.py` — POSTs to `/api/v1/build` with your API key, prints the returned `jobId` and `status`.
- `02_use_index.py` — downloads an HNSW file from `TT_DOWNLOAD_URL` (or fetches via `TT_JOB_ID`), loads it with `hnswlib`, generates a random query vector matching `TT_DIMENSIONS`, runs k-NN top-5, prints results.
- `03_end_to_end.py` — submits a job, polls `GET /api/v1/build/:jobId` every 60 minutes (configurable in code) until `status: complete`, then downloads + loads + searches.

## Notes

- The 60-minute polling interval matches typical build durations; for testing with small vector sets you may want to drop this to 60 seconds (see top of `03_end_to_end.py`).
- `hnswlib` is the standard Python binding for the HNSW algorithm.
