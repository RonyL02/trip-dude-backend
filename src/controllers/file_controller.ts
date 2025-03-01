import { Request, Response } from 'express';
import { Env } from '../env';
import { HttpStatusCode } from 'axios';

const base = `${Env.DOMAIN_BASE}/`;

export const upload = (request: Request, response: Response) => {
  const newFileUrl = `${base}${request.file?.path}`;
  response.status(HttpStatusCode.Created).send({ newFileUrl });
};
