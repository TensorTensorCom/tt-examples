/*
 * 02-use-index.ts
 *
 * Downloads a built HNSW index, loads it, runs a k-NN search with a random
 * query vector, prints the top-5 nearest neighbors.
 *
 * Provide either TT_DOWNLOAD_URL (direct) or TT_JOB_ID (we'll resolve it).
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { HierarchicalNSW } from 'hnswlib-node';
import 'dotenv/config';

interface JobItem {
  jobId: string;
  status: string;
  downloadUrl?: string;
  error?: string;
}

interface JobResponse {
  data: JobItem[];
}

const apiUrl      = process.env.TT_API_URL!;
const apiKey      = process.env.TT_API_KEY!;
const dimensions  = Number(process.env.TT_DIMENSIONS);
const jobId       = process.env.TT_JOB_ID;
let   downloadUrl = process.env.TT_DOWNLOAD_URL;

async function main(): Promise<void> {

  if (!downloadUrl){

    if (!jobId){
      console.error('Set TT_DOWNLOAD_URL or TT_JOB_ID in .env');
      process.exit(1);
    }

    const res = await axios.get<JobResponse>(`${apiUrl}/api/v1/build/${jobId}`, {
      headers: { Authorization: `Basic ${apiKey}` },
    });

    const result = res.data.data?.[0];
    if (!result || result.status !== 'complete'){
      console.error('Job not complete yet. Status:', result?.status);
      process.exit(1);
    }

    downloadUrl = result.downloadUrl;
    console.log('Resolved downloadUrl from jobId:', downloadUrl);

  }

  // download HNSW file
  const tmpFile = path.join(os.tmpdir(), `tt_${Date.now()}.hnsw`);
  console.log('Downloading to', tmpFile);
  const writer = fs.createWriteStream(tmpFile);
  const res = await axios.get(downloadUrl!, { responseType: 'stream' });
  await new Promise<void>((resolve, reject) => {
    res.data.pipe(writer);
    writer.on('finish', () => resolve());
    writer.on('error', reject);
  });

  // load
  // set to 'l2' for default; for now only 'l2' is supported. future will add support for 'cosine'.
  const index = new HierarchicalNSW('l2', dimensions);
  index.readIndexSync(tmpFile);
  console.log('Loaded index. Element count:', index.getCurrentCount());

  // generate a random query vector
  const query: number[] = Array.from({ length: dimensions }, () => Math.random());

  // search
  const k = 5;
  const result = index.searchKnn(query, k);
  console.log(`Top ${k} nearest neighbors:`);
  result.neighbors.forEach((id: number, i: number) => {
    console.log(`  ${i + 1}. id=${id}  distance=${result.distances[i].toFixed(6)}`);
  });

}

main().catch((err: any) => {
  console.error('error:', err.response?.data || err.message);
  process.exit(1);
});
