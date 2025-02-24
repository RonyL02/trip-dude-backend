import { BaseController } from './base_controller';
import { IPost, PostModel } from '../models/post_model';
import { Response } from 'express';
import { RequestWithUser } from '../types';
export class PostController extends BaseController<IPost> {
  constructor() {
    super(PostModel);
  }

  async create(request: RequestWithUser, response: Response) {
    const newPost = {
      ...request.body,
      senderId: request.user!._id
    };

    request.body = newPost;

    await super.create(request, response);
  }
}
