import { Request, Response } from 'express';
import { getPlaces } from '../external_apis/osm';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils';
import { getActivities } from '../external_apis/amadeus';
import { getGeminiResponse } from '../external_apis/gemini';

const getMatchingActivities = async (request: Request, response: Response) => {
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
};

const getPlaceNames = async (request: Request, response: Response) => {
  const { query } = request.body;
  try {
    const placeNames = ((await getPlaces(query)) ?? []).map(
      ({ name, country }) => `${name}, ${country}`
    );
    response.status(StatusCodes.OK).send(placeNames);
  } catch (error) {
    sendError(
      response,
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed fetching place names: ${error}`
    );
  }
};

export { getPlaceNames, getMatchingActivities };
