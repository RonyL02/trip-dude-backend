import mongoose from 'mongoose';

export type IComment = {
  userId: string;
  postId: string;
  content: string;
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
  }
});

export const CommentModel = mongoose.model<IComment>('Comments', commentSchema);
