# GPU Accelerated HNSWLib Indexes

Working examples of integrating with the TensorTensor build API.

Each example folder is a self-contained mini-project with its own dependencies.

## Folders

- `nodejs/`     - JavaScript (Node.js)
- `python/`     - Python 3
- `typescript/` - TypeScript

Each folder contains three examples:

| File                                  | What it shows |
|---------------------------------------|---------------|
| `01-generate-index`                   | Submit a build job, print the returned `jobId`. |
| `02-use-index`                        | Download an existing HNSW index, load it, run a search. |
| `03-end-to-end`                       | Submit, poll until complete, then download + load + search. |

## Common environment variables

All examples read configuration from a `.env` file in their respective folder. Copy the local `.env.example` to `.env` and fill in:

```
TT_API_URL=https://api.tensortensor.com
TT_API_KEY=key-xxxxxxxxxxxx
TT_VECTORS_URL=https://your.cdn/sample_vectors.bin
# Quick test option: a 1k x 768d sample file is available at
# https://raw.githubusercontent.com/TensorTensorCom/examples/main/data/sample-1k-768d.bin
# (Set TT_DIMENSIONS=768 if you use it.)
TT_DIMENSIONS=768
TT_EMAIL=you@example.com
```

`TT_VECTORS_URL` must be a publicly reachable HTTPS URL pointing at a raw `float32` vector file.

## Authentication

Send your API key in the `X-TensorTensor-API-Key: <TT_API_KEY>` header.

If you do not have an API key yet, request one at https://app.tensortensor.com.
