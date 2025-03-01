import { Response } from 'express';

export const sendError = (
  response: Response,
  statusCode: number,
  logMessage?: string
) => {
  if (logMessage) {
    console.error(logMessage);
  }

  response.status(statusCode).send();
};
