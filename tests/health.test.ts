import request from 'supertest';
import { initApp } from '../src/app';
import mongoose from 'mongoose';

afterAll(async () => {
  await mongoose.connection.close();
});

test('health check', async () => {
  const app = await initApp();
  const healthResponse = await request(app).get('/health');

  expect(healthResponse.text).toBe('trip-dude backend is up and running!');
});
