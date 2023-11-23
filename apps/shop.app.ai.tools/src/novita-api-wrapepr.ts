import { NovitaSDK } from 'novita-sdk';

const { NOVITA_API_KEY } = process.env;

export const generateImages = async (prompt: string): Promise<string[]> => {
  if (!NOVITA_API_KEY) {
    throw new Error('Please set NOVITA_API_KEY via environment variable!');
  }

  const novitaClient = new NovitaSDK(NOVITA_API_KEY);

  const params = {
    model_name: 'sd_xl_base_1.0.safetensors',
    prompt,
    negative_prompt:
      '3d render, smooth,plastic, blurry, grainy, low-resolution,anime, deep-fried, oversaturated',
    width: 1024,
    height: 1024,
    sampler_name: 'DPM++ 2M Karras',
    cfg_scale: 7,
    steps: 20,
    batch_size: 3,
    n_iter: 1,
    seed: -1,
  };
  console.log(`Generating images for "${prompt}"...`);
  const response = await novitaClient.txt2Img(params);
  if (response && response.task_id) {
    return await new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        novitaClient
          .progress({
            task_id: response.task_id,
          })
          .then((res) => {
            if (res.status === 2) {
              clearInterval(timer);
              resolve(res.imgs);
            }
            if (res.status === 3 || res.status === 4) {
              console.warn('failed!', res.failed_reason);
              clearInterval(timer);
              reject(res);
            }
            if (res.status === 1) {
              console.log('progress', res.progress);
            }
          })
          .catch((err) => {
            console.error('progress error:', err);
            reject(err);
          });
      }, 1000);
    });
  }
  return [];
};
