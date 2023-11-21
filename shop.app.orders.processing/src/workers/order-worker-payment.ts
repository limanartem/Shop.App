import { updateOrderStatusAsync } from '../services/order-service';
import { workerData, parentPort } from 'worker_threads';

const workerName = __filename.replace(`${__dirname}/`, '');

console.log(`"${workerName}}" worker started. Processing message`, workerData);

setTimeout(async () => {
  if (parentPort == null) {
    console.log('No parentPort opened');
    return;
  }

  try {
    const { orderId } = workerData.data;

    // Mimicking payment process
    await updateOrderStatusAsync(orderId, 'paid');

    parentPort.postMessage({ status: 'success' });

    console.log(`"${workerName}" worker successfully finished processing message`, workerData);
  } catch (error) {
    console.error(error);

    parentPort.postMessage({ status: 'error', errorMessage: error?.toString() });

    console.log(`"${workerName}" worker  finished processing message with error`, workerData);
  } finally {
    parentPort.close();
  }
}, 15000);
