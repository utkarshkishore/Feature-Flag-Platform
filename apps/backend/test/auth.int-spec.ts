import request from 'supertest';
import { createApp } from './test-utils';

const email = 'integration@example.com';

describe('auth', () => {
  it('registers and logs in', async () => {
    const app = await createApp();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', organizationName: 'Integration Org' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(201);

    await app.close();
  });
});
