"""
01_generate_index.py

Submits a build job to TensorTensor and prints the jobId.
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

api_url     = os.getenv('TT_API_URL')
api_key     = os.getenv('TT_API_KEY')
vectors_url = os.getenv('TT_VECTORS_URL')
dimensions  = int(os.getenv('TT_DIMENSIONS', '0'))
email       = os.getenv('TT_EMAIL')


def assert_env():
    missing = [k for k, v in {
        'TT_API_URL': api_url,
        'TT_API_KEY': api_key,
        'TT_VECTORS_URL': vectors_url,
        'TT_DIMENSIONS': dimensions,
        'TT_EMAIL': email,
    }.items() if not v]
    if missing:
        print('Missing env vars:', ', '.join(missing), file=sys.stderr)
        sys.exit(1)


def main():
    assert_env()

    headers = {
        'Authorization': f'Basic {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'email': email,
        'vectorsUrl': vectors_url,
        'dimensions': dimensions,
    }

    res = requests.post(f'{api_url}/api/v1/build', json=payload, headers=headers)
    res.raise_for_status()
    data = res.json()['data']
    print('jobId :', data['jobId'])
    print('status:', data['status'])
    print('')
    print('Save the jobId. You will receive an email when the build completes,')
    print('or run 03_end_to_end.py for an automated submit-and-wait flow.')


if __name__ == '__main__':
    main()
