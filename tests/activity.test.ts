import { Express } from 'express';
import { TestUser } from './types';
import { ActivityModel, IActivity } from '../src/models/activity_model';
import { UserModel } from '../src/models/user_model';
import { createUser, loginUser } from './utils';
import mongoose from 'mongoose';
import request from 'supertest';
import { initApp } from '../src/app';
import { StatusCodes } from 'http-status-codes';
import testActivityJson from './test_data/test_activity.json';
import { Activity } from '../src/external_apis/amadeus';
const baseUrl = '/activities';

let app: Express;

const testUser: TestUser = {
  email: 'user@test.com',
  password: 'password123',
  username: 'testuser'
};

let accessToken: string | undefined;

const testActivity: Activity & { _id?: string } = testActivityJson;

beforeAll(async () => {
  console.log('Before all tests');
  app = await initApp();
  await ActivityModel.deleteMany();
  await UserModel.deleteMany();
  const userId = await createUser(app, testUser);
  testUser._id = userId;
});

beforeEach(async () => {
  const responseBody = await loginUser(app, testUser.email, testUser.password);
  accessToken = responseBody.accessToken;
});

afterAll(async () => {
  console.log('After all tests');
  await ActivityModel.deleteMany();
  await UserModel.deleteMany();
  await mongoose.connection.close();
});

describe('Activities API Tests', () => {
  test('Create new activity', async () => {
    const response = await request(app)
      .post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(testActivity);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body.newId).toBeDefined();

    testActivity._id = response.body.newId;
  });
  test('Get saved activity', async () => {
    const userResponse = await request(app)
      .get('/users/profile')
      .set('Authorization', `JWT ${accessToken}`);

    testUser.activities = userResponse.body.activities;
    expect(testUser.activities).toBeDefined();

    const response = await request(app)
      .get(`${baseUrl}/saved`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body).toBeDefined();

    const activities: IActivity[] = response.body;
    expect(activities[0]._id).toBe(testUser.activities?.[0]);
  });

  test('Get comment by ID', async () => {
    const response = await request(app)
      .get(`${baseUrl}/${testActivity._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.id).toBe(testActivity.id);
  });

  test('Get comment by non existent ID', async () => {
    const nonExistentId = '673924d57453a2741caf84e1';
    const response = await request(app)
      .put(`${baseUrl}/${nonExistentId}`)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
