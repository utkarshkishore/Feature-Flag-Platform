import request from 'supertest';
import { createApp } from './test-utils';

const email = 'flags@example.com';

describe('flags', () => {
  it('creates flag', async () => {
    const app = await createApp();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', organizationName: 'Flags Org' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(201);

    const token = login.body.accessToken;
    const orgs = await request(app.getHttpServer())
      .get('/orgs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const orgId = orgs.body[0].organizationId;

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .set('x-org-id', orgId)
      .send({ name: 'App', key: 'app' })
      .expect(201);

    const envId = project.body.environments[0].id;

    await request(app.getHttpServer())
      .post('/flags')
      .set('Authorization', `Bearer ${token}`)
      .set('x-org-id', orgId)
      .send({
        projectId: project.body.id,
        key: 'flag-a',
        name: 'Flag A',
        type: 'BOOLEAN',
        defaultValue: false,
        envValues: { [envId]: true },
      })
      .expect(201);

    await app.close();
  });
});
