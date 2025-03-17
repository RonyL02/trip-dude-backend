import { Request, Response } from 'express';
import { getPlaces } from '../external_apis/osm';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils';
import { Activity, getActivities } from '../external_apis/amadeus';
import { getGeminiResponse } from '../external_apis/gemini';
import { BaseController } from './base_controller';
import { ActivityModel, IActivity } from '../models/activity_model';
import { RequestWithUser } from '../types';
import { UserModel } from '../models/user_model';

class ActivityController extends BaseController<IActivity> {
  constructor() {
    super(ActivityModel);
  }
  async getMatchingActivities(request: Request, response: Response) {
    const { location, description } = request.query;

    try {
      const [{ latitude, longitude }] = await getPlaces(location as string);
      console.time('fetch activities');
      const activities = await getActivities(latitude, longitude);
      console.timeEnd('fetch activities');

      console.time('filter');
      const aiFilter = await getGeminiResponse(`
        This is an api for activities around the world.
        Here is a description of a desired activity: ${description}.
        Please return a list of ids of all activities that would match the description.
        The response must only contain the ids separated by a comma.
        Do not end the message with an empty new line.
        ${activities.map(
          ({
            description,
            minimumDuration,
            price,
            rating,
            shortDescription,
            id
          }) =>
            ` id:${id},
          description:${description},
          minimumDuration:${minimumDuration},
          price:${price?.amount} ${price?.currencyCode},
          rating:${rating},
          shortDescription:${shortDescription}`
        )}
          ----------------------------------------
          `);
      console.timeEnd('filter');

      const filteredIds = aiFilter.split('\n').join().split(',');
      const filteredActivities = activities.filter(({ id }) =>
        id ? filteredIds.includes(id) : false
      );

      response.status(StatusCodes.OK).send(filteredActivities);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to generate activities: ${JSON.stringify(error)}`
      );
    }
  }

  async getPlaceNames(request: Request, response: Response) {
    const { name } = request.query;
    try {
      const placeNames = ((await getPlaces(name!.toString())) ?? []).map(
        ({ city, country }) => `${country}${city ? `, ${city}` : ''}`
      );
      response.status(StatusCodes.OK).send(Array.from(new Set(placeNames)));
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed fetching place names: ${error}`
      );
    }
  }

  async create(request: RequestWithUser, response: Response): Promise<void> {
    const savedActivity: Activity = request.body;
    try {
      const existingActivity = await this.model.findOne({
        id: savedActivity.id
      });
      let newId: string;
      if (!existingActivity) {
        newId = (await this.model.create(savedActivity))._id;
      } else {
        newId = existingActivity._id;
      }

      await UserModel.findByIdAndUpdate(request.user!._id, {
        $push: { activities: newId }
      });
      response.status(StatusCodes.CREATED).send({ newId });
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        JSON.stringify(error)
      );
    }
  }

  async find(request: RequestWithUser, response: Response) {
    try {
      const user = await UserModel.findById(request.user!._id);

      const activities = await this.model.find({
        _id: { $in: user?.activities ?? [] }
      });

      response.send(activities ?? []);
    } catch (error) {
      sendError(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to get saved activities: ${JSON.stringify(error)}`
      );
    }
  }

  async delete(request: RequestWithUser, response: Response) {
    await UserModel.findByIdAndUpdate(request.user!._id, {
      $pull: { activities: request.params.id }
    });
    super.delete(request, response);
  }
}

export default new ActivityController();
