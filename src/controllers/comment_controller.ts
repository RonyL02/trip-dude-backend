import { BaseController } from './base_controller';
import { IComment, CommentModel } from '../models/comment_model';
import { Response } from 'express';
import { RequestWithUser } from '../types';
export class CommentController extends BaseController<IComment> {
  constructor() {
    super(CommentModel);
  }

  async create(request: RequestWithUser, response: Response) {
    const newComment = {
      ...request.body,
      senderId: request.user!._id
    };

    request.body = newComment;

    await super.create(request, response);
  }
}
