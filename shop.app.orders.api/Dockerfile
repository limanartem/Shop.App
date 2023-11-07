
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run tsc

EXPOSE 3001

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]