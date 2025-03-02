import { Request, Response } from 'express';
import { BaseController } from './base_controller';
import { IUser, UserModel } from '../models/user_model';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils';
import { RequestWithUser } from '../types';
class UserController extends BaseController<IUser> {
  constructor() {
    super(UserModel);
  }

  async find(request: Request, response: Response) {
    const { query } = request;
    try {
      const users = await this.model
        .find(query as object, { tokens: 0, password: 0 })
        .lean();

      response.send(users);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async findById(request: RequestWithUser, response: Response) {
    const id = request.params.id;

    try {
      const user = await this.model
        .findById(id, { tokens: 0, password: 0 })
        .lean();
      if (user) {
        response.send(user);
      } else {
        response.status(StatusCodes.NOT_FOUND).send();
      }
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async update(request: RequestWithUser, response: Response) {
    request.params.id = request.user!._id;

    await super.update(request, response);
  }

  async getProfile(request: RequestWithUser, response: Response) {
    request.params.id = request.user!._id;

    await this.findById(request, response);
  }
}
export default new UserController();
