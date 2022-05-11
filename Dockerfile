FROM node:latest

RUN apt update && apt upgrade -y && npm i -g npm

WORKDIR /app

COPY . /app

RUN npm i -g postcss-cli && \
    npm i -g postcss && \
    npm i -g typescript && \
    cp .env-sample .env && \
    npm i -D && \
    cd client && \
    npm i -D && \
    cd ..

ENV NODE_ENV "production"
ENV PORT 80

RUN npm run build && \
    cd client && \
    npm run build-css && \
    npm run build && \
    cd .. && \
    npm i --only=prod && \
    cd client && \
    npm i --only=prod && \
    cd ..

HEALTHCHECK --interval=30s --timeout=30s --start-period=45s --retries=3 CMD curl --fail http://localhost/api/v1/health || exit 1

ENTRYPOINT [ "node", "dist/app.js" ]

EXPOSE 80 443
