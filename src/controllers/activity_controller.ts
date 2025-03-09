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
      const activities = await getActivities(latitude, longitude);

      const aiFilter = await getGeminiResponse(`
        This is an api for activities around the world.
        Here is a description of a desired activity: ${description}.
        Please return a list of ids of all activities that would match the description.
        The response must only contain the ids separated by a comma.
        Do not end the message with an empty new line.
        ${JSON.stringify(activities)}
        `);

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
        ({ city, country, name }) => `${country}, ${city ?? name}`
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

    await UserModel.findByIdAndUpdate(request.user!._id, {
      $push: { activities: savedActivity.id }
    });

    super.create(request, response);
  }
}

export default new ActivityController();
