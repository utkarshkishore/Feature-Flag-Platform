# Feature Flag Platform

## Architecture overview
```
Clients -> Next.js Frontend (ECS) -> NestJS API (ECS) -> RDS Postgres
                                     |-> Redis (ElastiCache)
                                     |-> CloudWatch Logs
```

## Repository structure
```
apps/
  backend/        NestJS + Prisma API
  frontend/       Next.js App Router UI
packages/
  sdk/            Node.js SDK
infra/
  terraform/      AWS infrastructure
docs/             Architecture, runbook, API usage
```

## Local development
1) Start containers
```bash
make dev
```

2) Run migrations + seed inside the backend container
```bash
docker exec -it \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/featureflag \
  featureflag-backend-1 \
  npx prisma migrate deploy

docker exec -it \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/featureflag \
  featureflag-backend-1 \
  npm run seed
```

3) Visit apps
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/docs

## Troubleshooting
- If you have local Postgres running, it can conflict with Docker on port 5432. Stop it or run migrations inside the container as shown above.

## Environment variables
Backend (`apps/backend/.env.example`)
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SDK_RATE_LIMIT_PER_MINUTE`

Frontend (`apps/frontend/.env.example`)
- `NEXT_PUBLIC_API_BASE_URL`

## Deployment (AWS)
1) Create ACM certificate and validate it.
2) Configure GitHub secrets:
- `AWS_ROLE_ARN`
- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ACM_CERT_ARN`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

3) Push to `main` to trigger the deployment workflow.

## CI/CD
- PRs: lint, test, build, docker build.
- Main: build + push to ECR, Terraform apply, ECS rolling deploy, smoke test.

## SDK usage
```ts
import { init } from 'feature-flag-sdk';

const client = init({
  sdkKey: process.env.SDK_KEY!,
  baseUrl: 'https://api.example.com',
});

const flags = await client.getFlags({
  userId: 'user-1',
  email: 'user@example.com',
  country: 'US',
  appVersion: '1.2.0',
});
```

## API examples
See `docs/api.md`.

## Seed credentials
- Email: `owner@example.com`
- Password: `password123`
