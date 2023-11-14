import { workerData, parentPort } from 'worker_threads';

setTimeout(() => parentPort.postMessage(workerData), 500);
