import mongoose from 'mongoose';

export type IUser = {
  username: string;
  password: string;
  email: string;
  _id: string;
  tokens: string[];
};

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  tokens: {
    type: [String],
    default: []
  }
});

export const UserModel = mongoose.model<IUser>('Users', userSchema);
