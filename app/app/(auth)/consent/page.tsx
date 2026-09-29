"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ConsentPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(accept: boolean) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          accept,
          oauth_query: window.location.search.slice(1),
        }),
      });
      const result = (await response.json()) as {
        redirect_uri?: string;
        url?: string;
        message?: string;
      };

      if (!response.ok) throw new Error(result.message ?? "Unable to save consent");
      const redirect = result.redirect_uri ?? result.url;
      if (!redirect) throw new Error("Authorization server did not return a redirect");
      window.location.assign(redirect);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save consent");
      setPending(false);
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 dark:bg-transparent md:py-32">
      <div className="bg-card m-auto w-full max-w-md rounded-[calc(var(--radius)+.125rem)] border p-8 shadow-md">
        <h1 className="text-xl font-semibold">Connect to Uli</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This application is requesting permission to use Uli on your behalf.
          Only approve clients you trust.
        </p>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={pending} onClick={() => respond(false)}>
            Deny
          </Button>
          <Button disabled={pending} onClick={() => respond(true)}>
            {pending ? "Connecting…" : "Allow"}
          </Button>
        </div>
      </div>
    </section>
  );
}
