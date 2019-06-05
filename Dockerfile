FROM node:alpine as BUILD
WORKDIR /opt
COPY .npmrc package.json package-lock.json ./
RUN npm i
COPY tslint.json tsconfig.json ./
COPY src/ ./src
RUN npm run build:docker

FROM node:alpine as TEST
WORKDIR /opt
COPY package.json jest.config.js tsconfig.json ./
COPY src/ ./src
COPY --from=BUILD /opt/node_modules ./node_modules
ENTRYPOINT [ "npm", "run", "test" ]

FROM node:alpine as FINAL
WORKDIR /dist
COPY --from=BUILD /opt/dist .
WORKDIR /
COPY --from=BUILD /opt/package.json ./
COPY --from=BUILD /opt/package-lock.json ./
COPY --from=BUILD /opt/.npmrc ./
ENV NODE_ENV=production
RUN npm i
ENTRYPOINT [ "node", "dist/main" ]