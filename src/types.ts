import { Request } from 'express';

export type JwtPayload = {
  _id: string;
};

export type RequestWithUser = Request & {
  user?: JwtPayload;
};
