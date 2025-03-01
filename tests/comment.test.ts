import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { initApp } from '../src/app';
import { CommentModel, IComment } from '../src/models/comment_model';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../src/models/user_model';
import { createUser, loginUser } from './utils';

const baseUrl = '/comments';

type TestComment = Omit<IComment, 'userId'> & { userId?: string };

let app: Express;
const testCommentJson: TestComment[] = [];
const testComments: TestComment[] = testCommentJson;

let userId: string | undefined;
void userId;
const userCredentials = {
  email: 'sdfds@dsf.sdf',
  password: 'sdfsdfsd'
};
let accessToken: string | undefined;

beforeAll(async () => {
  console.log('Before all tests');
  app = await initApp();
  await CommentModel.deleteMany();
  await UserModel.deleteMany();
  userId = await createUser(app, {
    ...userCredentials,
    username: 'sdfsdfd',
    _id: new mongoose.Types.ObjectId().toString()
  });
});

beforeEach(async () => {
  const responseBody = await loginUser(
    app,
    userCredentials.email,
    userCredentials.password
  );
  accessToken = responseBody.accessToken;
});

afterAll(async () => {
  console.log('After all tests');
  await CommentModel.deleteMany();
  await UserModel.deleteMany();
  await mongoose.connection.close();
});

describe('Comments API Tests', () => {
  test('Get all comments when empty', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBe(0);
  });

  test('Create new comments', async () => {
    for (const comment of testComments) {
      const response = await request(app)
        .post(baseUrl)
        .set('Authorization', `JWT ${accessToken}`)
        .send(comment);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body.newId).toBeDefined();

      comment._id = response.body.newId;
    }
  });

  test('Get all comments', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBe(testComments.length);
  });

  test('Get comment by ID', async () => {
    const response = await request(app)
      .get(`${baseUrl}/${testComments[0]._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.content).toBe(testComments[0].content);
  });

  test('Get comment by non existent ID', async () => {
    const nonExistentId = '673924d57453a2741caf84e1';
    const response = await request(app)
      .put(`${baseUrl}/${nonExistentId}`)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('Get comments by post ID', async () => {
    const postId = testComments[0].postId;
    const response = await request(app)
      .get(`${baseUrl}?postId=${postId}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].postId).toBe(postId);
  });

  test('Update a comment', async () => {
    const updatedComment = { content: 'Updated content' };
    const response = await request(app)
      .put(`${baseUrl}/${testComments[0]._id}`)
      .set('Authorization', `JWT ${accessToken}`)
      .send(updatedComment);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const getResponse = await request(app)
      .get(`${baseUrl}/${testComments[0]._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(getResponse.body.content).toBe(updatedComment.content);
    expect(getResponse.body.postId).toBe(testComments[0].postId);
  });

  test('Update comment by non existent ID', async () => {
    const nonExistentId = '673924d57453a2741caf84e1';
    const response = await request(app)
      .put(`${baseUrl}/${nonExistentId}`)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('Delete a comment', async () => {
    const response = await request(app)
      .delete(`${baseUrl}/${testComments[0]._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseGet = await request(app)
      .get(`${baseUrl}/${testComments[0]._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(responseGet.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('Delete comment by non existent ID', async () => {
    const nonExistentId = '673924d57453a2741caf84e1';
    const response = await request(app)
      .delete(`${baseUrl}/${nonExistentId}`)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('Try to create invalid comment', async () => {
    const invalidComment = { senderId: 3 };
    const response = await request(app)
      .post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(invalidComment);

    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
