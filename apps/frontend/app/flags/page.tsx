'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../components/api';
import { useAuth } from '../../components/auth';
import { Shell } from '../../components/shell';

interface Environment {
  id: string;
  name: string;
  sdkKey: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
  environments: Environment[];
}

interface Flag {
  id: string;
  key: string;
  name: string;
  type: string;
  defaultValue: any;
  values: { environmentId: string; value: any }[];
}

export default function FlagsPage() {
  const { accessToken, orgId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [flags, setFlags] = useState<Flag[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    key: '',
    name: '',
    type: 'BOOLEAN',
    defaultValue: 'false',
    envValues: {} as Record<string, string>,
    ruleValue: 'true',
    ruleField: 'emailDomain',
    ruleOp: 'equals',
    ruleTarget: 'example.com',
    rollout: '50',
  });
  const [tryUser, setTryUser] = useState({ userId: '', email: '', country: '', appVersion: '' });
  const [tryResult, setTryResult] = useState<any>(null);

  const selectedEnv = useMemo(() => {
    const project = projects.find((item) => item.id === selectedProject);
    return project?.environments[0];
  }, [projects, selectedProject]);

  useEffect(() => {
    if (!accessToken || !orgId) return;
    apiFetch<Project[]>('/projects', { method: 'GET' }, accessToken, orgId)
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, [accessToken, orgId]);

  useEffect(() => {
    if (!accessToken || !selectedProject) return;
    apiFetch<Flag[]>(`/flags?projectId=${selectedProject}`, { method: 'GET' }, accessToken)
      .then(setFlags)
      .catch((err) => setError(err.message));
  }, [accessToken, selectedProject]);

  const submitFlag = async () => {
    if (!accessToken || !orgId) return;
    const rules = [
      {
        name: 'Rule 1',
        conditions: [
          { field: form.ruleField, op: form.ruleOp, value: form.ruleTarget },
        ],
        rollout: { percentage: Number(form.rollout) },
        value: form.ruleValue,
      },
    ];

    const envValues: Record<string, any> = {};
    for (const env of projects.find((item) => item.id === selectedProject)?.environments || []) {
      const raw = form.envValues[env.id] ?? form.defaultValue;
      envValues[env.id] = form.type === 'BOOLEAN' ? raw === 'true' : raw;
    }

    await apiFetch(
      '/flags',
      {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProject,
          key: form.key,
          name: form.name,
          type: form.type,
          defaultValue: form.type === 'BOOLEAN' ? form.defaultValue === 'true' : form.defaultValue,
          envValues,
          rules,
        }),
      },
      accessToken,
      orgId,
    );
    const updated = await apiFetch<Flag[]>(`/flags?projectId=${selectedProject}`, { method: 'GET' }, accessToken);
    setFlags(updated);
  };

  const runTryIt = async () => {
    if (!selectedEnv) return;
    const query = new URLSearchParams({
      userId: tryUser.userId,
      email: tryUser.email,
      country: tryUser.country,
      appVersion: tryUser.appVersion,
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/sdk/flags?${query}`,
      { headers: { 'x-sdk-key': selectedEnv.sdkKey } },
    );
    const data = await response.json();
    setTryResult(data);
  };

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="p-8">
          <h1 className="font-display text-3xl font-semibold">Feature flags</h1>
          <p className="mt-2 text-sm text-ink-700">Create, update, and evaluate rollout rules.</p>
        </section>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <section className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-xl font-semibold">Create flag</h2>
            <div className="mt-4 grid gap-3">
              <select
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                placeholder="Key"
                value={form.key}
                onChange={(event) => setForm({ ...form, key: event.target.value })}
              />
              <input
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <select
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                <option value="BOOLEAN">Boolean</option>
                <option value="STRING">String</option>
                <option value="NUMBER">Number</option>
                <option value="JSON">JSON</option>
              </select>
              <input
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                placeholder="Default value"
                value={form.defaultValue}
                onChange={(event) => setForm({ ...form, defaultValue: event.target.value })}
              />
              <div className="rounded-xl border border-ink-700/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-700/60">Targeting rule</p>
                <div className="mt-2 grid gap-2">
                  <select
                    className="rounded-lg border border-ink-700/10 px-3 py-2"
                    value={form.ruleField}
                    onChange={(event) => setForm({ ...form, ruleField: event.target.value })}
                  >
                    <option value="emailDomain">Email domain</option>
                    <option value="country">Country</option>
                    <option value="appVersion">App version</option>
                    <option value="userId">User ID</option>
                  </select>
                  <select
                    className="rounded-lg border border-ink-700/10 px-3 py-2"
                    value={form.ruleOp}
                    onChange={(event) => setForm({ ...form, ruleOp: event.target.value })}
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts with</option>
                    <option value="endsWith">Ends with</option>
                  </select>
                  <input
                    className="rounded-lg border border-ink-700/10 px-3 py-2"
                    placeholder="Target value"
                    value={form.ruleTarget}
                    onChange={(event) => setForm({ ...form, ruleTarget: event.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-lg border border-ink-700/10 px-3 py-2"
                      placeholder="Rollout %"
                      value={form.rollout}
                      onChange={(event) => setForm({ ...form, rollout: event.target.value })}
                    />
                    <input
                      className="rounded-lg border border-ink-700/10 px-3 py-2"
                      placeholder="Rule value"
                      value={form.ruleValue}
                      onChange={(event) => setForm({ ...form, ruleValue: event.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              className="mt-4 rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
              onClick={submitFlag}
            >
              Create flag
            </button>
          </div>
          <div className="rounded-2xl border border-ink-700/10 bg-ink-900 p-6 text-white">
            <h3 className="font-display text-lg font-semibold">Try it</h3>
            <p className="mt-1 text-sm text-white/70">Evaluate flags for a user in seconds.</p>
            <div className="mt-4 grid gap-2">
              <input
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="User ID"
                value={tryUser.userId}
                onChange={(event) => setTryUser({ ...tryUser, userId: event.target.value })}
              />
              <input
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="Email"
                value={tryUser.email}
                onChange={(event) => setTryUser({ ...tryUser, email: event.target.value })}
              />
              <input
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="Country"
                value={tryUser.country}
                onChange={(event) => setTryUser({ ...tryUser, country: event.target.value })}
              />
              <input
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="App version"
                value={tryUser.appVersion}
                onChange={(event) => setTryUser({ ...tryUser, appVersion: event.target.value })}
              />
            </div>
            <button
              className="mt-4 w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900"
              onClick={runTryIt}
            >
              Evaluate
            </button>
            {tryResult ? (
              <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-black/30 p-3 text-xs">
                {JSON.stringify(tryResult, null, 2)}
              </pre>
            ) : null}
          </div>
        </section>
        <section className="p-8">
          <h2 className="font-display text-xl font-semibold">Flags in project</h2>
          <div className="mt-4 grid gap-3">
            {flags.map((flag) => (
              <div key={flag.id} className="rounded-2xl border border-ink-700/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{flag.name}</p>
                    <p className="text-xs text-ink-700/70">{flag.key}</p>
                  </div>
                  <span className="rounded-full bg-ink-900 px-3 py-1 text-xs text-white">
                    {flag.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
