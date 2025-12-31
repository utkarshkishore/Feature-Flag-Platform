# Architecture

```
                        +----------------------+
                        |    GitHub Actions    |
                        |  CI/CD + Terraform   |
                        +----------+-----------+
                                   |
                                   v
+-------------+     +-------------------------+      +------------------+
|   Clients   | --> |  Next.js Frontend (ECS) | ---> | NestJS API (ECS) |
+-------------+     +-------------------------+      +------------------+
                                   |                          |
                                   v                          v
                           +---------------+         +------------------+
                           |   CloudWatch  |         | RDS Postgres      |
                           +---------------+         +------------------+
                                                          |
                                                          v
                                                   +------------------+
                                                   | ElastiCache Redis|
                                                   +------------------+
```

## Key decisions
- ECS Fargate for stateless services and zero server management.
- RDS Postgres + Prisma for consistent schema and migrations.
- Redis for SDK caching and rate limiting.
- ALB with ACM for HTTPS termination.
- Terraform manages VPC, ECS, ALB, RDS, Redis, and IAM roles.

## Security basics
- JWT auth with refresh tokens.
- RBAC enforced via organization membership.
- SDK endpoint rate-limited and protected by SDK key.
- Secrets stored in SSM Parameter Store.
