"""
03_end_to_end.py

Submits a build, polls until status === 'complete', then downloads
the HNSW file, loads it, and runs a search.
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

api_url     = os.getenv('TT_API_URL')
api_key     = os.getenv('TT_API_KEY')
vectors_url = os.getenv('TT_VECTORS_URL')
dimensions  = int(os.getenv('TT_DIMENSIONS', '0'))
email       = os.getenv('TT_EMAIL')

# Polling interval. Builds typically take minutes-to-hours depending on
# vector count. 60 minutes is a sensible default; for small test sets,
# drop this to 60 (1 minute) or 30.
POLL_INTERVAL_S = 10
MAX_POLLS       = 360

headers = {'X-TensorTensor-API-Key': api_key}


def submit():
    res = requests.post(
        f'{api_url}/api/v1/build',
        json={
            'email': email,
            'vectorsUrl': vectors_url,
            'dimensions': dimensions,
        },
        headers={**headers, 'Content-Type': 'application/json'},
    )
    res.raise_for_status()
    return res.json()['data']


def fetch_status(job_id):
    res = requests.get(f'{api_url}/api/v1/build/{job_id}', headers=headers)
    res.raise_for_status()
    data = res.json().get('data')
    return data[0] if data else None


def download_to_tmp(url):
    fd, tmp_path = tempfile.mkstemp(suffix='.hnsw', prefix=f'tt_{int(time.time())}_')
    os.close(fd)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(tmp_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
    return tmp_path


def main():
    print('Submitting build...')
    submitted = submit()
    job_id = submitted['jobId']
    print('jobId:', job_id)

    job = None
    for i in range(MAX_POLLS):
        job = fetch_status(job_id)
        print(f'[poll {i + 1}/{MAX_POLLS}] status={job and job.get("status")}')
        if job and job.get('status') in ('complete', 'failed'):
            break
        time.sleep(POLL_INTERVAL_S)

    if not job or job.get('status') != 'complete':
        print('Build did not complete. Final status:', job and job.get('status'), job and job.get('error'), file=sys.stderr)
        sys.exit(1)

    print('Build complete. downloadUrl:', job['downloadUrl'])
    file_path = download_to_tmp(job['downloadUrl'])

    # set to 'l2' for default; for now only 'l2' is supported. future will add support for 'cosine'.
    index = hnswlib.Index(space='l2', dim=dimensions)
    index.load_index(file_path)
    print('Loaded. Element count:', index.get_current_count())

    query = np.random.rand(dimensions).astype('float32')
    k = 5
    labels, distances = index.knn_query(query, k=k)
    print(f'Top {k} nearest neighbors:')
    for i, (lid, dist) in enumerate(zip(labels[0], distances[0]), start=1):
        print(f'  {i}. id={int(lid)}  distance={float(dist):.6f}')


if __name__ == '__main__':
    main()
