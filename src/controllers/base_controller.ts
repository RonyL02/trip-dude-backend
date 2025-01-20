import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Model } from 'mongoose';
import { sendError } from '../utils';

export abstract class BaseController<T> {
  constructor(protected readonly model: Model<T>) {}

  async find(request: Request, response: Response) {
    const { query } = request;
    try {
      const items = await this.model.find(query as object);
      response.send(items);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async findById(request: Request, response: Response) {
    const {
      params: { id }
    } = request;
    try {
      const item = await this.model.findById(id);
      if (item) {
        response.send(item);
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

  async create(request: Request, response: Response) {
    const { body: newItem } = request;
    try {
      const { _id: newId } = await this.model.create(newItem);
      response.status(StatusCodes.CREATED).send({ newId });
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async update(request: Request, response: Response) {
    const {
      body: updatedItemData,
      params: { id }
    } = request;
    try {
      const updatedItem = await this.model.findByIdAndUpdate(
        id,
        updatedItemData
      );

      if (updatedItem) {
        response.send();
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

  async delete(request: Request, response: Response) {
    const {
      params: { id }
    } = request;
    try {
      const deletedItem = await this.model.findByIdAndDelete(id);

      if (deletedItem) {
        response.send();
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
