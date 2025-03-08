import request from 'supertest';
import { Express } from 'express';
import { initApp } from '../src/app';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../src/models/user_model';
import { extractFromCookie } from './utils';

let app: Express;

const user = {
  username: 'aaa',
  password: 'sdffssdf',
  email: 'aaa@dfg.fgd',
  refreshToken: '',
  accessToken: '',
  _id: ''
};

beforeAll(async () => {
  app = await initApp();
  await UserModel.deleteMany();
});

afterAll(async () => {
  console.log('After all tests');
  await mongoose.connection.close();
});

describe('Auth Tests', () => {
  test('Auth Registration', async () => {
    const response = await request(app).post('/auth/register').send({
      username: user.username,
      password: user.password,
      email: user.email
    });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
  });

  test('Auth Registration fail', async () => {
    const response = await request(app).post('/auth/register').send({
      username: user.username,
      password: user.password,
      email: user.email
    });
    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  test('Auth invalid credentials', async () => {
    const response = await request(app).post('/auth/login').send({
      password: user.password
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('Auth non existent mail', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'nono@sdfsd.com',
      password: 'password'
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('Auth not matching password', async () => {
    const response = await request(app).post('/auth/login').send({
      email: user.email,
      password: 'incorrect password'
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('Auth Login', async () => {
    const response = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password
    });
    expect(response.statusCode).toBe(StatusCodes.OK);
    const accessToken = extractFromCookie(response, 'access_token');
    const refreshToken = extractFromCookie(response, 'refresh_token');
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    user.accessToken = accessToken!;
    user.refreshToken = refreshToken!;
  });

  test('Make sure two access tokens are not the same', async () => {
    const response = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password
    });
    expect(extractFromCookie(response, 'access_token')).not.toBe(
      user.accessToken
    );
  });

  test('Get protected API', async () => {
    const unauthenticatedResponse = await request(app).post('/posts').send({
      description: 'This is my first post',
      activityId: 'aaaa',
      imageUrl: 'dssdfsd'
    });
    expect(unauthenticatedResponse.statusCode).not.toBe(StatusCodes.CREATED);
    const authenticatedResponse = await request(app)
      .post('/posts')
      .set('Authorization', `JWT ${user.accessToken}`)
      .send({
        description: 'This is my first post',
        activityId: 'aaaa',
        imageUrl: 'dssdfsd'
      });
    expect(authenticatedResponse.statusCode).toBe(StatusCodes.CREATED);
  });

  test('Get protected API invalid token', async () => {
    const response = await request(app)
      .post('/posts')
      .set({
        authorization: `jwt ${user.accessToken}1`
      })
      .send({
        title: 'My First post',
        content: 'This is my first post'
      });
    expect(response.statusCode).not.toBe(StatusCodes.CREATED);
  });

  test('Refresh Token without sending the token', async () => {
    const response = await request(app).post('/auth/refreshToken');
    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('Refresh Token invalid', async () => {
    const response = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `jwt invalid_token`);

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  test('Refresh Token', async () => {
    const response = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `jwt ${user.refreshToken}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    const accessToken = extractFromCookie(response, 'access_token');
    const refreshToken = extractFromCookie(response, 'refresh_token');

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
  });

  test('Refresh Token invalid on logout', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `jwt invalid_token`);

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });

  test('Logout without refresh token', async () => {
    const response = await request(app).post('/auth/logout');
    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('Logout - invalidate refresh token', async () => {
    console.log('pppppp', user.refreshToken);

    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `jwt ${user.refreshToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseForRefreshAfterLogout = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `jwt ${user.refreshToken}`);

    expect(responseForRefreshAfterLogout.statusCode).not.toBe(StatusCodes.OK);

    const responseForLogoutAfterLogout = await request(app)
      .post('/auth/logout')
      .set('Authorization', `jwt ${user.refreshToken}`);

    expect(responseForLogoutAfterLogout.statusCode).not.toBe(StatusCodes.OK);

    const loginResponse = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password
    });
    expect(loginResponse.statusCode).toBe(StatusCodes.OK);
  });

  test('Refresh token multiuple usage', async () => {
    const loginResponse = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password
    });
    expect(loginResponse.statusCode).toBe(StatusCodes.OK);
    const accessToken = extractFromCookie(loginResponse, 'access_token');
    const refreshToken = extractFromCookie(loginResponse, 'refresh_token');
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    const refreshWithValidTokenResponse = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `JWT ${user.refreshToken}`);

    expect(refreshWithValidTokenResponse.statusCode).toBe(StatusCodes.OK);
    const newRefreshToken = extractFromCookie(
      refreshWithValidTokenResponse,
      'refresh_token'
    );

    const refreshWithInvalidatedTokenResponse = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `JWT ${user.refreshToken}`);

    expect(refreshWithInvalidatedTokenResponse.statusCode).not.toBe(
      StatusCodes.OK
    );

    const refreshWithValidTokenAfterFailResponse = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `JWT ${newRefreshToken}`);

    expect(refreshWithValidTokenAfterFailResponse.statusCode).not.toBe(
      StatusCodes.OK
    );
  });

  jest.setTimeout(30000);
  test('timeout on refresh access token', async () => {
    const loginResponse = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password
    });
    expect(loginResponse.statusCode).toBe(StatusCodes.OK);
    const accessToken = extractFromCookie(loginResponse, 'access_token');
    const refreshToken = extractFromCookie(loginResponse, 'refresh_token');
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await new Promise((resolve) => setTimeout(resolve, 11000));

    const createPostResponse = await request(app)
      .post('/posts')
      .set({
        authorization: `jwt ${user.accessToken}`
      })
      .send({
        description: 'This is my first post',
        activityId: 'aaaa',
        imageUrl: 'dssdfsd'
      });
    expect(createPostResponse.statusCode).not.toBe(StatusCodes.CREATED);

    const refreshResponse = await request(app)
      .post('/auth/refreshToken')
      .set('Authorization', `JWT ${user.refreshToken}`);

    expect(refreshResponse.statusCode).toBe(StatusCodes.OK);
    user.accessToken = extractFromCookie(refreshResponse, 'access_token');
    user.refreshToken = extractFromCookie(refreshResponse, 'refresh_token');

    const createPostAfterRefreshResponse = await request(app)
      .post('/posts')
      .set({
        authorization: `jwt ${user.accessToken}`
      })
      .send({
        description: 'This is my first post',
        activityId: 'aaaa',
        imageUrl: 'dssdfsd'
      });
    expect(createPostAfterRefreshResponse.statusCode).toBe(StatusCodes.CREATED);
  });
});
