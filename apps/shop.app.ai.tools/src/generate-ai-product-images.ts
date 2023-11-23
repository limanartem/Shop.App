import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { get } from 'https';
import { IncomingMessage } from 'http';
import { generateImages } from './novita-api-wrapepr';

const { CATALOG_API_URL = 'http://localhost:5002' } = process.env;
const OUT_DIRECTORY = './shop-assets/products';

const getProducts = async () => {
  const productsResponse = await fetch(`${CATALOG_API_URL}/products`);

  if (!productsResponse.ok) {
    throw new Error(`Not able to fetch products from ${CATALOG_API_URL}`);
  }

  return (await productsResponse.json()) as {
    id: string;
    title: string;
    description: string;
  }[];
};

const run = async () => {
  if (!existsSync(OUT_DIRECTORY)) {
    mkdirSync(OUT_DIRECTORY, { recursive: true });
  }

  const products = await getProducts();

  console.log(`Fetched ${products.length} products`);

  await Promise.allSettled(
    products.slice(1, 5).map(async (product, index) => {
      return new Promise(async (resolve) => {
        const images = await generateImages(`${product.title}. ${product.description}`);
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
};

(async () => {
  await run();
})();
