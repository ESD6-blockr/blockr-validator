FROM node:alpine as BUILD
WORKDIR /opt
COPY [ ".npmrc", "package.json", "package-lock.json",  "./" ]
RUN npm i
COPY [ "tslint.json", "tsconfig.json", "src", "./" ]
RUN npm run lint && npm run build

FROM node:alpine as TEST
COPY [ "jest.config.js", "src",  "./" ]
RUN npm i jest ts-jest jest-junit 
ENTRYPOINT [ "jest", "--collectCoverage" ]

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