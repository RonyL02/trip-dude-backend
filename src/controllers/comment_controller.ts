import { BaseController } from './base_controller';
import { IComment, CommentModel } from '../models/comment_model';
import { Request, Response } from 'express';
import { RequestWithUser } from '../types';
import { PostModel } from '../models/post_model';
import { sendError } from '../utils';
import { StatusCodes } from 'http-status-codes';
import { isValidObjectId } from 'mongoose';
import { UserModel } from '../models/user_model';
export class CommentController extends BaseController<IComment> {
  constructor() {
    super(CommentModel);
  }

  async find(request: Request, response: Response) {
    const { query } = request;

    if (query.postId) {
      if (
        !(
          isValidObjectId(query.postId) &&
          (await PostModel.findById(query.postId))
        )
      ) {
        return sendError(
          response,
          StatusCodes.NOT_FOUND,
          `post ${query.postId} not found`
        );
      }
    }

    super.find(request, response);
  }

  async create(request: RequestWithUser, response: Response) {
    const user = (await UserModel.findById(request.user!._id))!;

    const newComment = {
      ...request.body,
      userId: user._id,
      username: user.username,
      imageUrl: user.imageUrl
    };

    request.body = newComment;

    await super.create(request, response);
  }
}
