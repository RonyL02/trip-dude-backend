import mongoose from 'mongoose';

export type IComment = {
  userId: string;
  postId: string;
  content: string;
  username: string;
  imageUrl: string;
  _id?: string;
};

const Schema = mongoose.Schema;

const commentSchema = new Schema<IComment>({
  userId: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  }
});

export const CommentModel = mongoose.model<IComment>('Comments', commentSchema);
