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
import { splitIntoBatches } from '../activityUtils';
import Bottleneck from 'bottleneck';

class ActivityController extends BaseController<IActivity> {
  constructor() {
    super(ActivityModel);
  }
  async getMatchingActivities(request: Request, response: Response) {
    const { location, description } = request.query;
    let activities: Activity[] = [];
    try {
      const [{ latitude, longitude }] = await getPlaces(location as string);
      console.time('fetch activities');
      const limiter = new Bottleneck({
        minTime: 100
      });

      const limitedGetActivities = limiter.wrap(getActivities);
      const limitedGetGeminiResponse = limiter.wrap(getGeminiResponse);

      console.timeEnd('fetch activities');
      const promises: Promise<Activity[]>[] = [];
      promises.push(limitedGetActivities(latitude, longitude));
      activities = (await Promise.allSettled(promises))
        .filter((p) => p.status === 'fulfilled')
        .map(({ value }) => value)
        .flat();
      console.log(activities.length);
      const ratedActivities = activities.slice(0, 200);
      const batches = splitIntoBatches(ratedActivities, 50);
      console.log('batches length', batches.length);

      console.time('filter');
      const results = await Promise.allSettled(
        batches.map(async (batch) => {
          const aiFilter = await limitedGetGeminiResponse(`
          This is an api for activities around the world.
          Return a list of ids of all activities that match the description best.
          **Return only the perfectly suitable activities for the description!**
          Do not pick any activity that does not relate to the description in any way 
          The response must only contain the ids separated by a comma.
          ${JSON.stringify({
            description,
            activities: batch.map(
              ({ description, minimumDuration, price, rating, id, name }) => ({
                id,
                name,
                description,
                minimumDuration,
                price,
                rating
              })
            )
          })}`);

          console.log(aiFilter);

          const filteredIds = aiFilter.split('\n').join().split(',');
          const filteredActivities = batch.filter(({ id }) =>
            id ? filteredIds.includes(id) : false
          );
          return filteredActivities;
        })
      );

      console.timeEnd('filter');
      response.status(StatusCodes.OK).send(
        results
          .filter((p) => p.status === 'fulfilled')
          .map((p) => p.value)
          .flat()
      );
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
      const placeNames = ((await getPlaces(name!.toString())) ?? [])
        .filter((place) =>
          ['country', 'city'].includes(place?.linkedPlace ?? '')
        )
        .map(({ country, city }) => `${country}${city ? `, ${city}` : ''}`);
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
