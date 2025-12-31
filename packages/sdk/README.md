# Feature Flag SDK

## Install

```bash
npm install feature-flag-sdk
```

## Usage

```ts
import { init } from 'feature-flag-sdk';

const client = init({
  sdkKey: process.env.SDK_KEY!,
  baseUrl: 'https://api.example.com',
});

const flags = await client.getFlags({
  userId: 'user-123',
  email: 'user@example.com',
  country: 'US',
  appVersion: '1.4.2',
});

const enabled = await client.isEnabled('new-checkout', { userId: 'user-123' }, false);
```
