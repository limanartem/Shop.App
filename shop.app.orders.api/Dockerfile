FROM node:21.1.0-slim
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run tsc

EXPOSE 3001

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]