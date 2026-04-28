/*
 * 01-generate-index.js
 *
 * Submits a build job to TensorTensor and prints the jobId.
 * Use the printed jobId with 02-use-index.js once the build completes
 * (you'll receive an email with the download link).
 */

require('dotenv').config();
const axios = require('axios');

const apiUrl     = process.env.TT_API_URL;
const apiKey     = process.env.TT_API_KEY;
const vectorsUrl = process.env.TT_VECTORS_URL;
const dimensions = Number(process.env.TT_DIMENSIONS);
const email      = process.env.TT_EMAIL;

function assertEnv(){

  const missing = [];
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

(async () => {

  assertEnv();

  const res = await axios.post(`${apiUrl}/api/v1/build`,
    { email, vectorsUrl, dimensions },
    { headers: { Authorization: `Basic ${apiKey}`, 'Content-Type': 'application/json' } },
  );

  const { jobId, status } = res.data.data;
  console.log('jobId :', jobId);
  console.log('status:', status);
  console.log('');
  console.log('Save the jobId. You will receive an email when the build completes,');
  console.log('or run 03-end-to-end.js for an automated submit-and-wait flow.');

})().catch(err => {

  console.error('error:', err.response?.data || err.message);
  process.exit(1);

});
