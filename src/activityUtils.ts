import { Activity } from './external_apis/amadeus';

export const splitIntoBatches = (array: Activity[], batchSize: number = 50) => {
  const batches: Activity[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};
