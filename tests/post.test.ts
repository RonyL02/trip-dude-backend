import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { initApp } from '../src/app';
import { PostModel } from '../src/models/post_model';
import { UserModel } from '../src/models/user_model';
import { createUser, loginUser } from './utils';
import { TestPost, TestUser } from './types';

let app: Express;

const baseUrl = '/posts';

const testUser: TestUser = {
  email: 'user@test.com',
  password: 'password123',
  username: 'testuser'
};

const testPost: TestPost = {
  activityId: '23432433',
  description: 'decription',
  imageUrl: 'sdfsd/sdffds/sdfsfd.png'
};

let accessToken: string;

beforeAll(async () => {
  app = await initApp();
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  const userId = await createUser(app, testUser);
  testUser._id = userId;
});

beforeEach(async () => {
  const responseBody = await loginUser(app, testUser.email, testUser.password);

  accessToken = responseBody.accessToken;
});

afterAll(async () => {
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  await mongoose.connection.close();
});

describe('Posts API Tests', () => {
  test('Get all posts when empty', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBe(0);
  });

  test('Create a new post', async () => {
    const response = await request(app)
      .post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(testPost);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body.newId).toBeDefined();
    testPost._id = response.body.newId;
  });

  test('Get post by ID', async () => {
    const response = await request(app)
      .get(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.description).toBe(testPost.description);
  });

  test('Get post by non-existent ID', async () => {
    const fakeId = '605c39f9393e2b1df8f0a123';
    const response = await request(app)
      .get(`${baseUrl}/${fakeId}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('Update post', async () => {
    const updatedData = {
      imageUrl: 'https://example.com/new-image.jpg',
      description: 'Updated description',
      activityId: 'activityNew'
    };

    const response = await request(app)
      .patch(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`)
      .send(updatedData);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const updatedPost = await request(app)
      .get(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(updatedPost.body.description).toBe(updatedData.description);
  });

  test('Attempt to create invalid post', async () => {
    const invalidPost = { likes: 'many' };

    const response = await request(app)
      .post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(invalidPost);

    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('Like a post and dislike', async () => {
    const getPostResponse = await request(app)
      .get(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    const likes = getPostResponse.body.likes;

    const likeResponse = await request(app)
      .post(`${baseUrl}/${testPost._id}/like`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(likeResponse.statusCode).toBe(StatusCodes.OK);
    const updatedPostAfterLikeResponse = await request(app)
      .get(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(updatedPostAfterLikeResponse.body.likes).toBe(likes + 1);

    const updatesLikes = likes + 1;

    const dislikeResponse = await request(app)
      .post(`${baseUrl}/${testPost._id}/like`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(dislikeResponse.statusCode).toBe(StatusCodes.OK);

    const updatedPostAfterDisikeResponse = await request(app)
      .get(`${baseUrl}/${testPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(updatedPostAfterDisikeResponse.body.likes).toBe(updatesLikes - 1);
  });

  test('Like a post that does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .post(`${baseUrl}/${fakeId}/like`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
