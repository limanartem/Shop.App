import { expressMiddleware, id } from 'cls-rtracer';
import { Request } from 'express';
import { Express } from 'express';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp } = format;

export const useTracing = (app: Express) => {
  app.use(
    expressMiddleware({
      echoHeader: true,
    }),
  );
};

export const useLogging = (app: Express) => {
  const logger = createLogger({
    level: 'http',
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
      }),
      format.json(),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: './logs/error.log', level: 'error' }),
      new transports.File({ filename: './logs/combined.log' }),
    ],
  });

  morgan.token('body', (req: Request) => JSON.stringify(req.body));

  app.use(
    morgan(
      function (tokens: any, req, res) {
        return JSON.stringify({
          request_id: id(),
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: Number.parseFloat(tokens.status(req, res)),
          content_length: tokens.res(req, res, 'content-length'),
          response_time: Number.parseFloat(tokens['response-time'](req, res)),
          body: tokens.body(req, res),
        });
      },
      {
        stream: {
          // Configure Morgan to use our custom logger with the http severity
          write: (message) => {
            const data = JSON.parse(message);
            logger.http('incoming-request', data);
          },
        },
      },
    ),
  );
};
