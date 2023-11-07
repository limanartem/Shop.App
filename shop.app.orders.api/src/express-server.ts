import express from 'express';
import { fetchItem, updateItem } from './data-utils';
import { sendMessage } from './amqp-utils';

export const start = () => {
  const app = express();
  app.use(express.json());

  app.put('/item', async (req, res) => {
    const { id, value } = req.body;
    await updateItem(id, JSON.parse(value));
    res.sendStatus(202);
  });

  app.get('/item/:id', async (req, res) => {
    const { id } = req.params;
    const value = await fetchItem(id);
    res.json({ ...value });
  });

  app.post('/orders', async (req, res) => {
    await sendMessage('orders.new', 'orders.events', 'orders.new', {
      data: {
        userId: 1234,
      },
    });

    res.sendStatus(200);
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error occurred!');
    console.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }
    res.setHeader('Content-Type', 'application/json').status(500).send({ error: err });
  });

  app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
};
