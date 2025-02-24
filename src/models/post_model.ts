import mongoose from 'mongoose';

export type IPost = {
  _id: string;
  userId: string;
  imageUrl: string;
  description: string;
  likes: number;
  activityId: string;
};

const Schema = mongoose.Schema;

const postSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  activityId: {
    type: String,
    required: true
  }
});

export const PostModel = mongoose.model<IPost>('Posts', postSchema);
