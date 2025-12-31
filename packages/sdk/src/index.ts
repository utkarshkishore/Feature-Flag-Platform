import fetch from 'node-fetch';

export interface SdkConfig {
  sdkKey: string;
  baseUrl: string;
}

export interface UserContext {
  userId?: string;
  email?: string;
  country?: string;
  appVersion?: string;
}

export class FeatureFlagClient {
  private sdkKey: string;
  private baseUrl: string;

  constructor(config: SdkConfig) {
    this.sdkKey = config.sdkKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  async getFlags(user: UserContext) {
    const query = new URLSearchParams({
      userId: user.userId || '',
      email: user.email || '',
      country: user.country || '',
      appVersion: user.appVersion || '',
    });
    const response = await fetch(`${this.baseUrl}/sdk/flags?${query.toString()}`, {
      headers: { 'x-sdk-key': this.sdkKey },
    });
    if (!response.ok) {
      throw new Error(`SDK request failed with ${response.status}`);
    }
    return response.json();
  }

  async isEnabled(flagKey: string, user: UserContext, defaultValue: boolean) {
    const result = await this.getFlags(user);
    return Boolean(result.flags?.[flagKey] ?? defaultValue);
  }
}

export function init(config: SdkConfig) {
  return new FeatureFlagClient(config);
}
