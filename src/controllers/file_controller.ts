import { Request, Response } from 'express';
import { Env } from '../env';
import { StatusCodes } from 'http-status-codes';

const base = `${Env.DOMAIN_BASE}/`;

export const upload = (request: Request, response: Response) => {
  const newFileUrl = `${base}${request.file?.path}`;
  response.status(StatusCodes.CREATED).send({ newFileUrl });
};
