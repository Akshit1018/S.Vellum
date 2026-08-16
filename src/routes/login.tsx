import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="min-h-dvh bg-paper px-5 py-10 text-ink">
      <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center">
        <p className="font-display text-sm italic text-muted">Vellum</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Sign in
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Optional. Extraction still happens on this device. Sign in only if you
          want your session to persist across visits.
        </p>

        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>

        <Link
          to="/"
          className="mt-8 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
