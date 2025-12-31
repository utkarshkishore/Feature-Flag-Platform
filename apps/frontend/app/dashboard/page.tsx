'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';
import { useAuth } from '../../components/auth';
import { Shell } from '../../components/shell';

interface Project {
  id: string;
  name: string;
  key: string;
  environments: { id: string; name: string; sdkKey: string }[];
}

export default function DashboardPage() {
  const { accessToken, orgId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !orgId) return;
    apiFetch<Project[]>('/projects', { method: 'GET' }, accessToken, orgId)
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, [accessToken, orgId]);

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="p-8">
          <h1 className="font-display text-3xl font-semibold">Command center</h1>
          <p className="mt-2 text-sm text-ink-700">
            Monitor projects, SDK keys, and rollout environments.
          </p>
        </section>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <section className="p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Projects</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-700/60">
              {projects.length} active
            </span>
          </div>
          <div className="mt-6 grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-ink-700/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{project.name}</p>
                    <p className="text-xs text-ink-700/70">key: {project.key}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {project.environments.map((env) => (
                    <div key={env.id} className="rounded-xl bg-ink-900 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{env.name}</p>
                      <p className="mt-2 text-sm font-semibold">{env.sdkKey}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
