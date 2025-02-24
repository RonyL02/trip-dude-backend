import { IUser } from '../src/models/user_model';

export type TestUser = Omit<IUser, 'tokens'> & { tokens?: string[] };
