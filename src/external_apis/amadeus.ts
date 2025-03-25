import Amadeus from 'amadeus';
import { Env } from '../env';

export type Activity = {
  id?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  geoCode?: {
    latitude?: number;
    longitude?: number;
  };
  rating?: string;
  price?: {
    amount?: string;
    currencyCode?: string;
  };
  pictures?: string[];
  bookingLink?: string;
  minimumDuration?: string;
};

const amadeusClient = Env.AMADEUS_API_KEY
  ? new Amadeus({
      clientId: Env.AMADEUS_API_KEY,
      clientSecret: Env.AMADEUS_SECRET,
      ...(Env.NODE_ENV === 'production' ? { hostname: 'production' } : {})
    })
  : undefined;

export const getActivities = async (
  latitude: number,
  longitude: number,
  radius: number = 1
) => {
  const response = await amadeusClient.shopping.activities.get({
    latitude,
    longitude,
    radius
  });

  return (response.data as Activity[]) ?? [];
};

export const getActivitiesByBox = async (boundingBox: number[]) => {
  const response = await amadeusClient.shopping.activities.bySquare.get({
    south: boundingBox[0],
    north: boundingBox[1],
    west: boundingBox[2],
    east: boundingBox[3]
  });

  return (response.data as Activity[]) ?? [];
};
