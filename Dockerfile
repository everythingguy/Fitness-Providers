FROM node:latest

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ="America/Detroit"

RUN apt update && apt upgrade -y && apt install -y tzdata && npm i -g npm

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

ARG API_URL=/api/v1
ARG MAIL_CONTACT_EMAIL "contact@yourdomain.com"
ARG GOOGLE_MAP_API
ARG DEMO "false"

ENV NODE_ENV "production"
ENV PORT 80
ENV MAIL_CONTACT_EMAIL $MAIL_CONTACT_EMAIL
ENV GOOGLE_MAP_API $GOOGLE_MAP_API

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
