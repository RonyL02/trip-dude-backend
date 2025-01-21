import dotenv from 'dotenv';

dotenv.config();

export const Env = {
  PORT: +process.env.PORT!,
  DB_CONNECTION_URL: process.env.DB_CONNECTION_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!
};

type EnvKey = keyof typeof Env;

const nonTestEnvVars: EnvKey[] = ['GEMINI_API_KEY'];

export const verifyEnvVariables = () => {
  Object.entries(Env).forEach(([key, value]) => {
    if (value === '' && !nonTestEnvVars.includes(key as EnvKey)) {
      throw new Error(`Environment variable ${key} is undefined`);
    }
  });
};
