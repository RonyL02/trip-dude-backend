import { Request, Response } from 'express';
import { BaseController } from './base_controller';
import { StatusCodes } from 'http-status-codes';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { genSalt, hash } from 'bcrypt';
import { sendError } from '../utils';
import { IUser, UserModel } from '../models/user_model';
import { Env } from '../env';

class AuthController extends BaseController<IUser> {
  constructor() {
    super(UserModel);
  }

  async register(request: Request, response: Response) {
    const user = request.body;
    const email = user.email;
    const password = user.password;

    if (!(email && password)) {
      return sendError(
        response,
        StatusCodes.BAD_REQUEST,
        'invalid credentials'
      );
    }

    try {
      const user = await this.model.findOne({
        email
      });

      if (user) {
        return sendError(response, StatusCodes.CONFLICT, 'user already exists');
      }
    } catch (error) {
      return sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }

    try {
      const password = await this.hashPassword(user.password);

      const newUser = {
        ...user,
        password
      };

      request.body = newUser;

      await super.create(request, response);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body;

    if (!(email && password)) {
      return sendError(
        response,
        StatusCodes.BAD_REQUEST,
        'invalid credentials'
      );
    }

    try {
      const user = await this.model.findOne({ email });

      if (!user) {
        return sendError(
          response,
          StatusCodes.BAD_REQUEST,
          'user does not exist'
        );
      }

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        return sendError(
          response,
          StatusCodes.BAD_REQUEST,
          'passwords are not matching'
        );
      }

      const payload: JwtPayload = { _id: user._id };
      const { accessToken, refreshToken } = this.generateTokens(payload);

      const updatedTokens =
        user.tokens.length === 0
          ? [refreshToken]
          : [...user.tokens, refreshToken];

      await this.model.findByIdAndUpdate(user._id, {
        tokens: updatedTokens
      });

      response.send({ accessToken, refreshToken, userId: user._id });
    } catch (error) {
      return sendError(response, StatusCodes.INTERNAL_SERVER_ERROR, `${error}`);
    }
  }

  async logout(request: Request, response: Response) {
    const authHeader = request.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      return sendError(
        response,
        StatusCodes.BAD_REQUEST,
        'missing refresh token'
      );
    }

    try {
      const { _id: userId } = <JwtPayload>(
        verify(refreshToken, Env.REFRESH_TOKEN_SECRET)
      );
      const user = await this.model.findById(userId);

      if (!user) {
        return sendError(response, StatusCodes.FORBIDDEN, 'invalid token');
      }

      if (!user.tokens || !user.tokens.includes(refreshToken)) {
        await this.model.findByIdAndUpdate(user._id, {
          tokens: []
        });

        return sendError(response, StatusCodes.FORBIDDEN, 'invalid token');
      }

      const tokensWithoutCurrentRefreshToken = user.tokens.filter(
        (token) => token !== refreshToken
      );

      await this.model.findByIdAndUpdate(user._id, {
        tokens: tokensWithoutCurrentRefreshToken
      });

      response.send();
    } catch (error) {
      return sendError(
        response,
        StatusCodes.FORBIDDEN,
        `logout error: ${JSON.stringify(error)}`
      );
    }
  }

  async refreshToken(request: Request, response: Response) {
    const authHeader = request.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      return sendError(
        response,
        StatusCodes.BAD_REQUEST,
        'missing refresh token'
      );
    }

    try {
      const { _id: userId } = <JwtPayload>(
        verify(refreshToken, Env.REFRESH_TOKEN_SECRET)
      );
      const user = await this.model.findById(userId);

      if (!user) {
        return sendError(response, StatusCodes.FORBIDDEN, 'invalid token');
      }

      if (!user.tokens.includes(refreshToken)) {
        await this.model.findByIdAndUpdate(user._id, {
          tokens: []
        });

        return sendError(response, StatusCodes.FORBIDDEN, 'invalid token');
      }

      const payload = { _id: user._id };
      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(payload);
      const tokensWithoutCurrentRefreshToken = user.tokens.filter(
        (token) => token !== refreshToken
      );

      await this.model.findByIdAndUpdate(user._id, {
        tokens: [...tokensWithoutCurrentRefreshToken, newRefreshToken]
      });

      response.send({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      return sendError(
        response,
        StatusCodes.FORBIDDEN,
        `refresh token error: ${JSON.stringify(error)}`
      );
    }
  }

  private generateTokens(payload: JwtPayload) {
    const random = Math.floor(Math.random() * 1000000);

    const accessToken = sign(
      {
        ...payload,
        random: random
      },
      Env.ACCESS_TOKEN_SECRET,
      { expiresIn: Env.JWT_TOKEN_EXPIRATION as any }
    );

    const refreshToken = sign(
      {
        ...payload,
        random: random
      },
      Env.REFRESH_TOKEN_SECRET,
      { expiresIn: Env.REFRESH_TOKEN_EXPIRATION as any }
    );

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string) {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  }
}

export default new AuthController();
