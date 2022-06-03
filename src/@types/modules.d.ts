declare namespace NodeJS {
    export interface ProcessEnv {
        TZ?: string;
        BASE_URL: string;
        API_URL: string;
        MAIL_HOST: string;
        MAIL_PORT: string;
        MAIL_POSTMASTER: string;
        MAIL_POSTMASTER_PASSWORD: string;
        MAIL_FROM_EMAIL: string;
        MAIL_CONTACT_EMAIL: string;
        GOOGLE_PLACE_API: string;
        GOOGLE_MAP_API: string;
        PROVIDER_TYPE: string;
        DB_USERNAME: string;
        DB_PASSWORD: string;
        DB_AUTHSOURCE: string;
        DB_IP: string;
        DB_PORT: string;
        DB_NAME: string;
        S3_ACCESS_KEY: string;
        S3_SECRET_KEY: string;
        S3_ENDPOINT: string;
        S3_BUCKET: string;
        SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        ACCESS_TOKEN_SECRET: string;
        PORT: string;
        CI: string;
    }
}
