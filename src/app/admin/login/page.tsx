"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage(): React.ReactElement {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok) {
        setError(json.error ?? "Incorrect password.");
        setLoading(false);
        return;
      }
      router.push("/admin/orders");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[70vh] items-center bg-surface py-16">
      <Container size="default">
        <div className="mx-auto max-w-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/8 text-primary">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-center font-display text-2xl font-medium text-primary">
            Admin access
          </h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            Enter the admin password to view the registrant roster.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="sr-only" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full border border-primary/15 bg-white px-5 py-3 text-sm font-medium text-primary outline-none transition-all placeholder:text-ink-muted/50 focus:border-accent focus:ring-4 focus:ring-accent/15"
            />

            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !password}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
