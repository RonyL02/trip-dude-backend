import request from "supertest";
import mongoose from "mongoose";
import { Express } from "express";
import { initApp } from "../src/app";
import { StatusCodes } from "http-status-codes";
import { IUser, UserModel } from "../src/models/user_model";
import { createUser, loginUser } from "./utils";

let app: Express;
const baseUrl = "/users";

const userCredentials = {
    email: "testuser@example.com",
    password: "TestPass123",
    username: "TestUser"
};

let accessToken: string;
let loggedUserId: string;

beforeAll(async () => {
    console.log("Before all tests");
    app = await initApp();
    await UserModel.deleteMany();

    // יצירת משתמש חדש
    loggedUserId = await createUser(app, userCredentials);

    // התחברות למשתמש לקבלת טוקן
    const loginResponse = await loginUser(app, userCredentials.email, userCredentials.password);
    accessToken = loginResponse.accessToken;
});

afterAll(async () => {
    console.log("After all tests");
    await mongoose.connection.close();
});

describe("Users API Tests", () => {

    test("Get user by ID", async () => {
        const response = await request(app)
            .get(`${baseUrl}/${loggedUserId}`)
            .set('Authorization', `JWT ${accessToken}`);

        console.log("User API Response:", response.body);
        
        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body._id).toBe(loggedUserId);
        expect(response.body.email).toBe(userCredentials.email);
    });

    test("Get logged-in user's profile", async () => {
        const response = await request(app)
            .get(`${baseUrl}/profile`)
            .set('Authorization', `JWT ${accessToken}`);

        console.log("Profile API Response:", response.body);

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body._id).toBe(loggedUserId);
        expect(response.body.email).toBe(userCredentials.email);
    });

    test("Update a user (username and image)", async () => {
        const updatedData = {
            username: "UpdatedUser",
            image: "https://example.com/new-image.jpg"
        };

        const response = await request(app)
            .patch(`${baseUrl}`)
            .set('Authorization', `JWT ${accessToken}`)
            .send(updatedData);

        expect(response.statusCode).toBe(StatusCodes.OK);

        const updatedResponse = await request(app)
            .get(`${baseUrl}/profile`)
            .set('Authorization', `JWT ${accessToken}`);

        expect(updatedResponse.body.username).toBe(updatedData.username);
        expect(updatedResponse.body.image).toBe(updatedData.image);
    });

    test("Delete a user", async () => {
        const response = await request(app)
            .delete(`${baseUrl}`)
            .set('Authorization', `JWT ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);

        const responseGet = await request(app)
            .get(`${baseUrl}/${loggedUserId}`)
            .set('Authorization', `JWT ${accessToken}`);

        expect(responseGet.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    test("Try to create invalid user", async () => {
        const invalidUser = { author: "UserWithoutEmail" };
        const response = await request(app)
            .post(baseUrl)
            .send(invalidUser);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
});
