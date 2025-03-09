import mongoose from 'mongoose';

export type IActivity = {
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
  picture: string;
  bookingLink?: string;
  minimumDuration?: string;
};

const Schema = mongoose.Schema;

const activitySchema = new Schema({
  id: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  shortDescription: {
    type: String,
    required: false
  },
  geoCode: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  rating: {
    type: String,
    required: false
  },
  price: {
    amount: {
      type: String,
      required: false
    },
    currencyCode: {
      type: String,
      required: false
    }
  },
  picture: {
    type: String,
    required: false
  },
  bookingLink: {
    type: String,
    required: false
  },
  minimumDuration: {
    type: String,
    required: false
  }
});

export const ActivityModel = mongoose.model<IActivity>(
  'Activities',
  activitySchema
);
