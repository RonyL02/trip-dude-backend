import dotenv from 'dotenv';

dotenv.config();

export const Env = {
  PORT: +process.env.PORT!,
  DB_CONNECTION_URL: process.env.DB_CONNECTION_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY!,
  AMADEUS_SECRET: process.env.AMADEUS_SECRET!
};

type EnvKey = keyof typeof Env;

const nonTestEnvVars: EnvKey[] = [
  'GEMINI_API_KEY',
  'AMADEUS_API_KEY',
  'AMADEUS_SECRET'
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
