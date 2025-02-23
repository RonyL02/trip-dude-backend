import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import { JwtPayload, RequestWithUser } from '../types';
import { sendError } from '../utils';

export const authenticationMiddleware = (
  request: RequestWithUser,
  response: Response,
  next: NextFunction
) => {
  const token = request.headers['authorization']?.split(' ')[1];

  if (!token) {
    return sendError(response, StatusCodes.UNAUTHORIZED, 'missing token');
  } else {
    verify(token, process.env.ACCESS_TOKEN_SECRET!, (error, user) => {
      if (error) {
        return sendError(
          response,
          StatusCodes.FORBIDDEN,
          `invalid token: ${JSON.stringify(error)}`
        );
      } else {
        request.user = <JwtPayload>user;
        next();
      }
    });
  }
};
