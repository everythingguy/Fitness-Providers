FROM node:latest

RUN apt update && apt upgrade -y

WORKDIR /app

COPY . /app

ENV NODE_ENV "production"
ENV PORT 80

RUN npm i -g postcss-cli && npm i -g postcss && npn i -D && npm run build && npm i --only=prod && cd client && npm i --only=prod && cp ./src/config/config-example.ts ./src/config/config.ts && npm run build && cd ..

VOLUME ["/app/client/src/config", "/app/config"]

CMD cd client && npm run build && cd .. && npm run start

EXPOSE 80 443
