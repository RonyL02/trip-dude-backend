import { BaseController } from './base_controller';
import { IPost, PostModel } from '../models/post_model';
import { Response } from 'express';
import { RequestWithUser } from '../types';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils';
import { UserModel } from '../models/user_model';
export class PostController extends BaseController<IPost> {
  constructor() {
    super(PostModel);
  }

  async create(request: RequestWithUser, response: Response) {
    const newPost = {
      ...request.body,
      userId: request.user!._id
    };

    request.body = newPost;

    await super.create(request, response);
  }

  async like(request: RequestWithUser, response: Response) {
    const {
      params: { id }
    } = request;

    try {
      const post = await this.model.findById(id);

      if (!post) {
        return sendError(response, StatusCodes.NOT_FOUND, 'Post not found');
      }

      const user = await UserModel.findById(request.user!._id);

      let updatedLikes: number = post.likes ?? 0;
      if (user?.likedPosts.find((postId) => postId === post._id.toString())) {
        updatedLikes -= 1;
        await UserModel.findByIdAndUpdate(request.user!._id, {
          $pull: { likedPosts: post._id }
        });
      } else {
        updatedLikes += 1;
        await UserModel.findByIdAndUpdate(request.user!._id, {
          $push: { likedPosts: post._id }
        });
      }

      request.body.likes = updatedLikes;

      await super.update(request, response);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }
}
