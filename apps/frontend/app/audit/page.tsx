'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';
import { useAuth } from '../../components/auth';
import { Shell } from '../../components/shell';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  diff: any;
}

export default function AuditPage() {
  const { accessToken, orgId } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!accessToken || !orgId) return;
    apiFetch<AuditLog[]>('/audit', { method: 'GET' }, accessToken, orgId).then(setLogs);
  }, [accessToken, orgId]);

  return (
    <Shell>
      <section className="p-8">
        <h1 className="font-display text-3xl font-semibold">Audit log</h1>
        <p className="mt-2 text-sm text-ink-700">Every change tracked for compliance.</p>
        <div className="mt-6 grid gap-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-ink-700/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{log.action}</p>
                  <p className="text-xs text-ink-700/70">{log.entityType}</p>
                </div>
                <span className="text-xs text-ink-700/60">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <pre className="mt-3 rounded-lg bg-ink-900/5 p-3 text-xs text-ink-700">
                {JSON.stringify(log.diff, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
