import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const sendError = (
  response: Response,
  statusCode: StatusCodes,
  logMessage?: string
) => {
  if (logMessage) {
    console.error(logMessage);
  }

  response.status(statusCode).send();
};
