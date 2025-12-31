import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden p-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-electric-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Release control</p>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-ink-900">
          Ship safely with a modern feature flag platform
        </h1>
        <p className="mt-6 text-lg text-ink-700">
          Manage flags, rollout rules, and environments from one control plane. Fast SDK evaluation
          with caching, audit trails, and secure RBAC out of the box.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Get started
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-ink-700/20 px-6 py-3 text-sm font-semibold text-ink-700"
          >
            View dashboard
          </Link>
        </div>
      </section>
      <section className="p-8">
        <h2 className="font-display text-2xl font-semibold">What you get</h2>
        <ul className="mt-6 space-y-4 text-sm text-ink-700">
          <li>Role-based orgs, projects, and environment SDK keys.</li>
          <li>Targeting rules with percentage rollout and segments.</li>
          <li>Audit logs and environment-aware overrides.</li>
          <li>Redis-backed evaluation with rate limiting.</li>
        </ul>
        <div className="mt-8 rounded-2xl bg-ink-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Status</p>
          <p className="mt-2 text-lg font-semibold">Ready for production-grade launches.</p>
          <p className="mt-3 text-sm text-white/70">Deploy to AWS ECS with Terraform.</p>
        </div>
      </section>
    </div>
  );
}
