'use client';

import { useState } from 'react';
import { apiFetch } from '../../components/api';
import { useAuth } from '../../components/auth';
import { Shell } from '../../components/shell';

export default function LoginPage() {
  const { setAuth } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, organizationName: orgName || 'My Org' }),
        });
      }
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const orgs = await apiFetch('/orgs', { method: 'GET' }, result.accessToken);
      const orgId = orgs[0]?.organizationId;
      if (!orgId) {
        throw new Error('No organization found');
      }
      setAuth(result.accessToken, orgId);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <section className="mx-auto max-w-xl p-8">
        <h1 className="font-display text-3xl font-semibold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-ink-700">
          {isRegister ? 'Spin up an org in seconds.' : 'Sign in to manage your flags.'}
        </p>
        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-ink-700/10 px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="w-full rounded-xl border border-ink-700/10 px-4 py-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegister ? (
            <input
              className="w-full rounded-xl border border-ink-700/10 px-4 py-3"
              placeholder="Organization name"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
            />
          ) : null}
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          className="mt-6 w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
          disabled={loading}
          onClick={submit}
        >
          {loading ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <button
          className="mt-4 w-full text-sm text-ink-700"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </Shell>
  );
}
