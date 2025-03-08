import dotenv from 'dotenv';

dotenv.config();

export const Env = {
  PORT: +process.env.PORT!,
  DB_CONNECTION_URL: process.env.DB_CONNECTION_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY!,
  AMADEUS_SECRET: process.env.AMADEUS_SECRET!,
  OSM_URL: process.env.OSM_URL!,
  JWT_TOKEN_EXPIRATION: process.env.JWT_TOKEN_EXPIRATION!,
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION!,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  DOMAIN_BASE: process.env.DOMAIN_BASE!,
  DOMAIN_FRONT: process.env.DOMAIN_FRONT!
};

type EnvKey = keyof typeof Env;

const nonTestEnvVars: EnvKey[] = [
  'GEMINI_API_KEY',
  'AMADEUS_API_KEY',
  'AMADEUS_SECRET',
  'OSM_URL',
  'GOOGLE_CLIENT_ID'
];

export const verifyEnvVariables = () => {
  Object.entries(Env).forEach(([key, value]) => {
    if (value === '') {
      if (Env.NODE_ENV === 'test' && nonTestEnvVars.includes(key as EnvKey)) {
        return;
      }

      throw new Error(`Environment variable ${key} is undefined`);
    }
  });
};
