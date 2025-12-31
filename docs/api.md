# API usage

## Auth
```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"password123","organizationName":"Demo Org"}'
```

```bash
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"password123"}'
```

## Flags
```bash
curl -X POST http://localhost:4000/flags \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'x-org-id: <orgId>' \
  -d '{"projectId":"<projectId>","key":"new-ui","name":"New UI","type":"BOOLEAN","defaultValue":false}'
```

## SDK evaluation
```bash
curl "http://localhost:4000/sdk/flags?userId=123&email=user@example.com&country=US" \
  -H 'x-sdk-key: <sdkKey>'
```
