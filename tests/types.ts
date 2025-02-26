import { IPost } from '../src/models/post_model';
import { IUser } from '../src/models/user_model';

export type TestUser = Omit<IUser, 'tokens' | '_id'> & {
  tokens?: string[];
  _id?: string;
};
export type TestPost = Omit<IPost, 'userId' | '_id' | 'likes'> & {
  _id?: string;
  likes?: number;
};
