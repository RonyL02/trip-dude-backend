import dotenv from 'dotenv';

dotenv.config();

export const Env = {
    PORT: +process.env.PORT!,
    DB_CONNECTION_URL: process.env.DB_CONNECTION_URL!,
    NODE_ENV: process.env.NODE_ENV!
};

export const verifyEnvVariables = () => {
    Object.entries(Env).forEach(([key, value]) => {        
        if (value === "") {
            throw new Error(`Environment variable ${key} is undefined`);
        }
    });
}