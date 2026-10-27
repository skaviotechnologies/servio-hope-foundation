import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_LOGO } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Servio Hope Foundation" },
      { name: "description", content: "Secure sign in for Servio Hope Foundation staff." },
      { property: "og:title", content: "Staff Sign In — Servio Hope Foundation" },
      { property: "og:description", content: "Staff access to the website dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) nav({ to: "/admin" }); });
  }, [nav]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    try {
      if (mode === "reset") {
        const email = z.string().email().safeParse(raw["email"]?.trim());
        if (!email.success) { toast.error("Enter a valid email"); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("If an account exists, a reset link has been sent.");
        return;
      }
      const p = schema.safeParse(raw);
      if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Invalid input"); return; }
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword(p.data);
        if (error) throw error;
        nav({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (error) throw error;
        if (data.session) nav({ to: "/admin" });
        else toast.success("Check your email to confirm your account.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-gradient p-12 text-primary-foreground lg:flex">
        <Link to="/" className="text-sm font-semibold hover:underline">← Back to website</Link>
        <div>
          <h1 className="text-4xl font-extrabold">Servio Hope Foundation</h1>
          <p className="mt-3 text-lg text-primary-foreground/80">Website management dashboard</p>
        </div>
        <p className="text-sm text-primary-foreground/70">Serving Humanity. Inspiring Hope.</p>
      </div>
      <div className="flex items-center justify-center bg-soft p-6">
        <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-soft">
          <img src={DEFAULT_LOGO} alt="Servio Hope Foundation" className="mx-auto h-24 w-24 object-contain" />
          <h2 className="mt-4 text-center text-2xl font-bold text-navy">
            {mode === "in" ? "Staff sign in" : mode === "up" ? "Create staff account" : "Reset password"}
          </h2>
          {mode === "up" && <p className="mt-2 text-center text-sm text-muted-foreground">New accounts need approval from an administrator. The very first account becomes the administrator.</p>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
            {mode !== "reset" && (
              <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={8} /></div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}</Button>
          </form>
          <div className="mt-5 flex flex-col items-center gap-2 text-sm">
            {mode !== "in" && <button className="text-emerald hover:underline" onClick={() => setMode("in")}>Back to sign in</button>}
            {mode === "in" && <button className="text-emerald hover:underline" onClick={() => setMode("up")}>Create a staff account</button>}
            {mode === "in" && <button className="text-muted-foreground hover:underline" onClick={() => setMode("reset")}>Forgot password?</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
