FROM node:8
WORKDIR /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm i

COPY src/lib ./lib
COPY src/logic ./logic
COPY public ./public
COPY src/services ./services
COPY src/tasks ./tasks
COPY src/util ./util
COPY src/validator-mongodb ./validator-mongodb
COPY database_volume ./database

COPY src/.env ./.env
COPY src/server.js ./server.js

ENTRYPOINT ["node", "server.js"]
