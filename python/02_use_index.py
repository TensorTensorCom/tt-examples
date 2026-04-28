"""
02_use_index.py

Downloads a built HNSW index, loads it, runs a k-NN search with a random
query vector, prints the top-5 nearest neighbors.

Provide either TT_DOWNLOAD_URL or TT_JOB_ID.
"""

import os
import sys
import tempfile
import time
import numpy as np
import requests
import hnswlib
from dotenv import load_dotenv

load_dotenv()

api_url      = os.getenv('TT_API_URL')
api_key      = os.getenv('TT_API_KEY')
dimensions   = int(os.getenv('TT_DIMENSIONS', '0'))
job_id       = os.getenv('TT_JOB_ID')
download_url = os.getenv('TT_DOWNLOAD_URL')


def main():
    global download_url

    if not download_url:
        if not job_id:
            print('Set TT_DOWNLOAD_URL or TT_JOB_ID in .env', file=sys.stderr)
            sys.exit(1)

        res = requests.get(
            f'{api_url}/api/v1/build/{job_id}',
            headers={'Authorization': f'Basic {api_key}'},
        )
        res.raise_for_status()
        data = res.json().get('data')
        item = data[0] if data else None
        if not item or item.get('status') != 'complete':
            print('Job not complete. Status:', item.get('status') if item else None, file=sys.stderr)
            sys.exit(1)
        download_url = item['downloadUrl']
        print('Resolved downloadUrl from jobId:', download_url)

    # download HNSW file
    fd, tmp_path = tempfile.mkstemp(suffix='.hnsw', prefix=f'tt_{int(time.time())}_')
    os.close(fd)
    print('Downloading to', tmp_path)
    with requests.get(download_url, stream=True) as r:
        r.raise_for_status()
        with open(tmp_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)

    # load
    # set to 'l2' for default; for now only 'l2' is supported. future will add support for 'cosine'.
    index = hnswlib.Index(space='l2', dim=dimensions)
    index.load_index(tmp_path)
    print('Loaded index. Element count:', index.get_current_count())

    # generate a random query vector
    query = np.random.rand(dimensions).astype('float32')

    # search
    k = 5
    labels, distances = index.knn_query(query, k=k)
    print(f'Top {k} nearest neighbors:')
    for i, (lid, dist) in enumerate(zip(labels[0], distances[0]), start=1):
        print(f'  {i}. id={int(lid)}  distance={float(dist):.6f}')


if __name__ == '__main__':
    main()
