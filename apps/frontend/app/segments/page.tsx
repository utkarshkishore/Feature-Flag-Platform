'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';
import { useAuth } from '../../components/auth';
import { Shell } from '../../components/shell';

interface Project {
  id: string;
  name: string;
}

interface Segment {
  id: string;
  name: string;
  description?: string;
  rules: any;
}

export default function SegmentsPage() {
  const { accessToken, orgId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [name, setName] = useState('');
  const [includeList, setIncludeList] = useState('');
  const [excludeList, setExcludeList] = useState('');
  const [field, setField] = useState('country');
  const [op, setOp] = useState('equals');
  const [value, setValue] = useState('US');

  useEffect(() => {
    if (!accessToken || !orgId) return;
    apiFetch<Project[]>('/projects', { method: 'GET' }, accessToken, orgId).then((data) => {
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0].id);
    });
  }, [accessToken, orgId]);

  useEffect(() => {
    if (!accessToken || !selectedProject) return;
    apiFetch<Segment[]>(`/segments?projectId=${selectedProject}`, { method: 'GET' }, accessToken).then(setSegments);
  }, [accessToken, selectedProject]);

  const createSegment = async () => {
    if (!accessToken || !orgId) return;
    const rules = {
      include: includeList.split(',').map((item) => item.trim()).filter(Boolean),
      exclude: excludeList.split(',').map((item) => item.trim()).filter(Boolean),
      conditions: [{ field, op, value }],
    };

    await apiFetch(
      '/segments',
      {
        method: 'POST',
        body: JSON.stringify({ projectId: selectedProject, name, rules }),
      },
      accessToken,
      orgId,
    );
    const updated = await apiFetch<Segment[]>(`/segments?projectId=${selectedProject}`, { method: 'GET' }, accessToken);
    setSegments(updated);
  };

  return (
    <Shell>
      <section className="p-8">
        <h1 className="font-display text-3xl font-semibold">Segments</h1>
        <p className="mt-2 text-sm text-ink-700">Group users for targeted rollouts.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-ink-700/10 p-6">
            <h2 className="font-display text-lg font-semibold">Create segment</h2>
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
                placeholder="Segment name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                placeholder="Include users (comma separated userId/email)"
                value={includeList}
                onChange={(event) => setIncludeList(event.target.value)}
              />
              <input
                className="rounded-xl border border-ink-700/10 px-4 py-2"
                placeholder="Exclude users (comma separated userId/email)"
                value={excludeList}
                onChange={(event) => setExcludeList(event.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  className="rounded-xl border border-ink-700/10 px-3 py-2"
                  value={field}
                  onChange={(event) => setField(event.target.value)}
                >
                  <option value="country">Country</option>
                  <option value="emailDomain">Email domain</option>
                  <option value="appVersion">App version</option>
                </select>
                <select
                  className="rounded-xl border border-ink-700/10 px-3 py-2"
                  value={op}
                  onChange={(event) => setOp(event.target.value)}
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts with</option>
                </select>
                <input
                  className="rounded-xl border border-ink-700/10 px-3 py-2"
                  placeholder="Value"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>
            </div>
            <button
              className="mt-4 rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
              onClick={createSegment}
            >
              Save segment
            </button>
          </div>
          <div className="rounded-2xl border border-ink-700/10 p-6">
            <h2 className="font-display text-lg font-semibold">Existing segments</h2>
            <div className="mt-4 grid gap-3">
              {segments.map((segment) => (
                <div key={segment.id} className="rounded-xl border border-ink-700/10 p-4">
                  <p className="font-semibold">{segment.name}</p>
                  <pre className="mt-2 text-xs text-ink-700">
                    {JSON.stringify(segment.rules, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
