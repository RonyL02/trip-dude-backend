import express from 'express';
import { BaseController } from './base_controller';
import { IPost, PostModel } from '../models/post_model';
import { Response } from 'express';
import { RequestWithUser } from '../types';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils';
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

  public async updatePost(
    request: express.Request,
    response: express.Response
  ): Promise<void> {
    try {
      const postId = request.params.id;
      const { image, description } = request.body;

      const post = await PostModel.findById(postId);
      if (!post) {
        response.status(404).json({ message: 'Post not found' });
        return;
      }

      if (image) post.imageUrl = image;
      if (description) post.description = description;

      await post.save();

      response.status(200).json({
        message: 'Post updated successfully',
        updatedPost: post
      });
    } catch (error) {
      console.error('Error updating post:', error);
      response.status(500).json({ message: 'Server error' });
    }
  }

  async like(request: RequestWithUser, response: Response) {
    const {
      params: { id }
    } = request;
    try {
      const item = await this.model.findById(id);
      if (item) {
        item.likes = (item.likes || 0) + 1;
        await item.save();
        response.send({ likes: item.likes });
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
}
