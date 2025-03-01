import axios from 'axios';
import { Env } from '../env';

type OsmResult = {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  displayName: string;
  type: string;
  placeId: number;
};

export const getPlaces = async (locationQuery: string) => {
  try {
    const response = await axios.get(Env.OSM_URL, {
      params: { q: locationQuery, format: 'json', addressdetails: 1, limit: 20 }
    });

    return response.data.map(
      (place) =>
        ({
          latitude: place.lat,
          longitude: place.lon,
          name: place.name,
          country: place.address.country,
          displayName: place.display_name,
          type: place.type,
          placeId: place.place_id
        }) as OsmResult
    ) as OsmResult[];
  } catch (error) {
    throw new Error(`Failed calling osm api ${error}`);
  }
};
