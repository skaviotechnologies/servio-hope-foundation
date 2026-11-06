import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsQuery, DEFAULT_LOGO } from "@/lib/site";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programmes" },
  { to: "/projects", label: "Projects" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/news", label: "News" },
  { to: "/get-involved", label: "Get involved" },
  { to: "/request-assistance", label: "Request help" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { data: s } = useQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const logo = s?.header_logo_url || s?.logo_url || DEFAULT_LOGO;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md transition-shadow",
        scrolled ? "shadow-soft border-border" : "border-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-gold focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={`${s?.org_name ?? "Servio Hope Foundation"} home`}>
          <img src={logo} alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-contain" />
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-display text-base font-extrabold tracking-tight text-navy">
              {s?.org_name ?? "Servio Hope Foundation"}
            </span>
            <span className="truncate text-xs text-emerald">{s?.motto ?? "Serving Humanity. Inspiring Hope."}</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-soft hover:text-navy"
              activeProps={{ className: "text-navy bg-soft" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="gold" className="hidden rounded-full px-5 sm:inline-flex">
            <Link to="/donate">Donate</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-soft lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t bg-background lg:hidden">
          <div className="container-site flex flex-col py-3">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-soft" activeProps={{ className: "text-navy bg-soft" }}>
                {n.label}
              </Link>
            ))}
            <Button asChild variant="gold" className="mt-2 rounded-full">
              <Link to="/donate" onClick={() => setOpen(false)}>Donate</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
