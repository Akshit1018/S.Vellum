import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-9 w-20 animate-pulse rounded-sm bg-paper-deep" />;
  }
  if (user) {
    return (
      <div className="max-w-[11rem] truncate text-sm [&_button]:text-muted [&_span]:text-ink-soft">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-sm text-ink-soft hover:border-line-strong hover:text-ink"
    >
      Sign in
    </Link>
  );
}
