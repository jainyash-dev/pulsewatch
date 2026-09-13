'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [live, setLive] = useState<string>('loading...');

  useEffect(() => {
    fetch('/api/v1/health/live')
      .then((res) => res.json())
      .then((body) => setLive(JSON.stringify(body)))
      .catch((err) => setLive(String(err)));
  }, []);

  return (
    <main className="flex min-h-full flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">PulseWatch</h1>
      <p className="text-zinc-600">Foundation stub. API health via rewrite:</p>
      <pre className="rounded bg-zinc-100 p-4 text-sm">{live}</pre>
    </main>
  );
}
