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

const amadeusClient = new Amadeus({
  clientId: Env.AMADEUS_API_KEY,
  clientSecret: Env.AMADEUS_SECRET
});

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
