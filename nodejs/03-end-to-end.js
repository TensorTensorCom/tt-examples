/*
 * 03-end-to-end.js
 *
 * Submits a build, polls until status === 'complete', then downloads
 * the HNSW file, loads it, and runs a search.
 */

require('dotenv').config();
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');
const { HierarchicalNSW } = require('hnswlib-node');

const apiUrl     = process.env.TT_API_URL;
const apiKey     = process.env.TT_API_KEY;
const vectorsUrl = process.env.TT_VECTORS_URL;
const dimensions = Number(process.env.TT_DIMENSIONS);
const email      = process.env.TT_EMAIL;

// Polling interval. Builds typically take minutes-to-hours depending on
// vector count. 60 minutes is a sensible default; for small test sets,
// drop this to 60_000 (1 minute) or 30_000 (30s).
const POLL_INTERVAL_MS = 10 * 1000;
const MAX_POLLS        = 360;

const headers = { 'X-TensorTensor-API-Key': apiKey };

async function submit(){

  const res = await axios.post(`${apiUrl}/api/v1/build`,
    { email, vectorsUrl, dimensions },
    { headers: { ...headers, 'Content-Type': 'application/json' } },
  );
  return res.data.data;

}

async function fetchStatus(jobId){

  const res = await axios.get(`${apiUrl}/api/v1/build/${jobId}`, { headers });
  return res.data.data?.[0];

}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function downloadToTmp(url){

  const file = path.join(os.tmpdir(), `tt_${Date.now()}.hnsw`);
  const writer = fs.createWriteStream(file);
  const res = await axios.get(url, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return file;

}

(async () => {

  console.log('Submitting build...');
  const submitted = await submit();
  const jobId = submitted.jobId;
  console.log('jobId:', jobId);

  let job;
  for (let i = 0; i < MAX_POLLS; i++){
    job = await fetchStatus(jobId);
    console.log(`[poll ${i + 1}/${MAX_POLLS}] status=${job?.status}`);
    if (job?.status === 'complete' || job?.status === 'failed') break;
    await sleep(POLL_INTERVAL_MS);
  }

  if (job?.status !== 'complete'){
    console.error('Build did not complete. Final status:', job?.status, job?.error);
    process.exit(1);
  }

  console.log('Build complete. downloadUrl:', job.downloadUrl);
  const filePath = await downloadToTmp(job.downloadUrl);

  // set to 'l2' for default; for now only 'l2' is supported. future will add support for 'cosine'.
  const index = new HierarchicalNSW('l2', dimensions);
  index.readIndexSync(filePath);
  console.log('Loaded. Element count:', index.getCurrentCount());

  const query = Array.from({ length: dimensions }, () => Math.random());
  const k = 5;
  const result = index.searchKnn(query, k);
  console.log('Top', k, 'nearest neighbors:');
  result.neighbors.forEach((id, i) => {
    console.log(`  ${i + 1}. id=${id}  distance=${result.distances[i].toFixed(6)}`);
  });

})().catch(err => {

  console.error('error:', err.response?.data || err.message);
  process.exit(1);

});
