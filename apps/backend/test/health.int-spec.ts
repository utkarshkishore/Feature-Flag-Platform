import request from 'supertest';
import { createApp } from './test-utils';

describe('health', () => {
  it('returns ok', async () => {
    const app = await createApp();
    await request(app.getHttpServer()).get('/health').expect(200);
    await app.close();
  });
});
