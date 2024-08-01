FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${TASK_SERVICE_PORT}

ENV NODE_ENV=production

CMD ["node", "index.js"]
