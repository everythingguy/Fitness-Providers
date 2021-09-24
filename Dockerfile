FROM node:latest

RUN apt update && apt upgrade -y && npm i -g npm

WORKDIR /app

COPY . /app

RUN npm i -g postcss-cli && npm i -g postcss && npm i -g typescript && npm i -D && cp ./config/config-sample.json ./config/config.json && cd client && cp ./src/config/config-sample.json ./src/config/config.json && npm i -D && cd ..

ENV NODE_ENV "production"
ENV PORT 80

RUN npm run build && cd client && npm run build-css && npm run build && cd .. && npm i --only=prod && cd client && npm i --only=prod && cd ..

VOLUME ["/app/config"]

ENTRYPOINT [ "node", "dist/app.js" ]

EXPOSE 80 443
