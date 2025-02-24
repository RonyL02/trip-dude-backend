/*import request from "supertest";
import mongoose from "mongoose";
import express, { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { initApp } from "../src/app";
import { PostModel } from "../src/models/post_model";
import { UserModel } from "../src/models/user_model";
import { createUser, loginUser } from "./utils";



let app: Express;

const baseUrl = "/posts";

const userCredentials = {
  email: "user@test.com",
  password: "password123"
};

let accessToken: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  userId = await createUser(app, { ...userCredentials, username: "testuser", _id: new mongoose.Types.ObjectId().toString() });
});

beforeEach(async () => {
  const responseBody = await loginUser(app, userCredentials.email, userCredentials.password);
  accessToken = responseBody.accessToken;
});

afterAll(async () => {
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  await mongoose.connection.close();
});

describe("Posts API Tests", () => {
  test("Get all posts when empty", async () => {
    const response = await request(app).get(baseUrl)
      .set('Authorization', `JWT ${accessToken}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.length).toBe(0);
  });

  test("Create a new post", async () => {
    const newPost = {
      userId,
      imageUrl: "https://example.com/image.jpg",
      description: "This is a new post",
      likes: 0,
      activityId: "activity123"
    };

    const response = await request(app).post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(newPost);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body.newId).toBeDefined();
  });

  test("Get post by ID", async () => {
    const createdPost = await PostModel.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      imageUrl: "https://example.com/image.jpg",
      description: "A nice view",
      likes: 10,
      activityId: "activity123"
    });

    const response = await request(app).get(`${baseUrl}/${createdPost._id}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.description).toBe(createdPost.description);
    expect(response.body.likes).toBe(createdPost.likes);
  });

  test("Get post by non-existent ID", async () => {
    const fakeId = "605c39f9393e2b1df8f0a123";
    const response = await request(app).get(`${baseUrl}/${fakeId}`)
      .set('Authorization', `JWT ${accessToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test("Update post", async () => {
    const createdPost = await PostModel.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      imageUrl: "https://example.com/old-image.jpg",
      description: "Old description",
      likes: 5,
      activityId: "activityOld"
    });

    const updatedData = {
      imageUrl: "https://example.com/new-image.jpg",
      description: "Updated description",
      likes: 20,
      activityId: "activityNew"
    };

    const response = await request(app).put(`${baseUrl}/${createdPost._id}`)
      .set('Authorization', `JWT ${accessToken}`)
      .send(updatedData);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const updatedPost = await PostModel.findById(createdPost._id);
    expect(updatedPost).not.toBeNull();
    if (updatedPost) {
      expect(updatedPost.description).toBe(updatedData.description);
      expect(updatedPost.likes).toBe(updatedData.likes);
    }
  });

  test("Attempt to create invalid post", async () => {
    const invalidPost = { likes: "many" };

    const response = await request(app).post(baseUrl)
      .set('Authorization', `JWT ${accessToken}`)
      .send(invalidPost);

    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
*/
