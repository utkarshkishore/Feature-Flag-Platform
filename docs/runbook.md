# Runbook

## Deploy
1. Push to `main`.
2. GitHub Actions builds Docker images and pushes to ECR.
3. Terraform applies infrastructure changes and updates ECS services.

## Rollback
- In ECS, select the previous task definition revision and redeploy.
- Terraform state keeps track of infra history.

## Incident response
- Check CloudWatch logs for frontend and backend services.
- Inspect ALB target health in AWS console.
- Verify RDS and Redis status.

## Common issues
- 500 errors: check database connectivity and migrations.
- 429 errors: check SDK rate limit configuration.
- Auth failures: ensure JWT secrets match between services.
