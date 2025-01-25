import axios from 'axios';
import { Env } from '../env';

export const getCoordinates = async (locationQuery: string) => {
  const response = await axios.get(Env.OSM_URL, {
    params: { q: locationQuery, format: 'json' }
  });
  return {
    latitude: response.data[0].lat,
    longitude: response.data[0].lon
  };
};
