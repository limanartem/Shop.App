import { workerData, parentPort } from 'worker_threads';

const workerName = __filename.replace(`${__dirname}/`, '');

console.log(`"${workerName}}" worker started. Processing message`, workerData);

setTimeout(() => {
  parentPort.postMessage({ status: 'success' });
  parentPort.close();
  console.log(`"${workerName}}" worker finished. Processing message`, workerData);
}, 500);
