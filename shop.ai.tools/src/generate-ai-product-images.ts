import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { NovitaSDK } from 'novita-sdk';
import { get } from 'https';
import { IncomingMessage } from 'http';

const NOVITA_API_KEY = '2f13aa59-8807-4aef-a9e2-7ad896215c39';
const CATALOG_API_URL = 'http://localhost:5002';
const OUT_DIRECTORY = './shop-assets/products';

const generateImages = async (prompt: string, novitaClient: NovitaSDK): Promise<string[]> => {
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

const run = async () => {
  const novitaClient = new NovitaSDK(NOVITA_API_KEY);

  if (!existsSync(OUT_DIRECTORY)) {
    mkdirSync(OUT_DIRECTORY, {recursive: true });
  }

  const productsResponse = await fetch(`${CATALOG_API_URL}/products`);

  if (productsResponse.ok) {
    const products = (await productsResponse.json()) as {
      id: string;
      title: string;
      description: string;
    }[];

    await Promise.allSettled(
      products.slice(1, 5).map(async (product, index) => {
        return new Promise(async (resolve) => {
          const images = await generateImages(
            `${product.title}. ${product.description}`,
            novitaClient,
          );
          console.log({
            message: `For product "${index}. ${product.id} - ${product.title}" got images. Downloading...`,
            images,
          });
          const imageData = await Promise.all(
            images.map((imgUrl) => {
              return new Promise<IncomingMessage>((resolve) => {
                get(imgUrl, (img) => {
                  resolve(img);
                });
              });
            }),
          );

          imageData.forEach((message, index) => {
            message.pipe(createWriteStream(`${OUT_DIRECTORY}/${product.id}-${index}.png`));
          });

          resolve(null);
        });
      }),
    );
  }
};

(async () => {
  await run();
})();
