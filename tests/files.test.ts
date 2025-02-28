import request from 'supertest';
import { initApp } from '../src/app';
import mongoose from 'mongoose';
import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';

let app: Express;
beforeAll(async () => {
  console.log('Before all tests');
  app = await initApp();
});

afterAll(() => {
  console.log('After all tests');
  mongoose.connection.close();
});

describe('File Tests', () => {
  test('upload file', async () => {
    const filePath = `${__dirname}/test_data/file.txt`;

    const response = await request(app).post('/files').attach('file', filePath);
    expect(response.statusCode).toEqual(StatusCodes.CREATED);
    let url = response.body.newFileUrl;
    url = url.replace(/^.*\/\/[^/]+/, '');

    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(StatusCodes.OK);
  });
});
