/*
 * 01-generate-index.ts
 *
 * Submits a build job to TensorTensor and prints the jobId.
 */

import axios from 'axios';
import 'dotenv/config';

interface BuildResponse {
  data: {
    jobId: string;
    status: string;
  };
}

const apiUrl     = process.env.TT_API_URL;
const apiKey     = process.env.TT_API_KEY;
const vectorsUrl = process.env.TT_VECTORS_URL;
const dimensions = Number(process.env.TT_DIMENSIONS);
const email      = process.env.TT_EMAIL;

function assertEnv(): void {

  const missing: string[] = [];
  if (!apiUrl)     missing.push('TT_API_URL');
  if (!apiKey)     missing.push('TT_API_KEY');
  if (!vectorsUrl) missing.push('TT_VECTORS_URL');
  if (!dimensions) missing.push('TT_DIMENSIONS');
  if (!email)      missing.push('TT_EMAIL');
  if (missing.length){
    console.error('Missing env vars:', missing.join(', '));
    process.exit(1);
  }

}

async function main(): Promise<void> {

  assertEnv();

  const res = await axios.post<BuildResponse>(`${apiUrl}/api/v1/build`,
    { email, vectorsUrl, dimensions },
    { headers: { 'X-TensorTensor-API-Key': apiKey, 'Content-Type': 'application/json' } },
  );

  const { jobId, status } = res.data.data;
  console.log('jobId :', jobId);
  console.log('status:', status);
  console.log('');
  console.log('Save the jobId. You will receive an email when the build completes,');
  console.log('or run 03-end-to-end.ts for an automated submit-and-wait flow.');

}

main().catch((err: any) => {
  console.error('error:', err.response?.data || err.message);
  process.exit(1);
});
