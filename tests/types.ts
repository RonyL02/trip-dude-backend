import { IComment } from '../src/models/comment_model';
import { IPost } from '../src/models/post_model';
import { IUser } from '../src/models/user_model';

export type TestUser = Omit<
  IUser,
  'tokens' | '_id' | 'imageUrl' | 'likedPosts' | 'activities'
> & {
  tokens?: string[];
  _id?: string;
};
export type TestPost = Omit<IPost, 'userId' | '_id' | 'likes'> & {
  _id?: string;
  likes?: number;
};
export type TestComment = Omit<IComment, 'userId'> & { userId?: string };
