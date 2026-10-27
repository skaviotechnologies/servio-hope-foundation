import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { settingsQuery, DEFAULT_LOGO } from "@/lib/site";
import { NAV } from "./SiteHeader";

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery);
  const logo = s?.footer_logo_url || s?.logo_url || DEFAULT_LOGO;
  const socials = [
    ["Facebook", s?.facebook_url],
    ["X", s?.x_url],
    ["Instagram", s?.instagram_url],
    ["LinkedIn", s?.linkedin_url],
    ["YouTube", s?.youtube_url],
  ].filter(([, u]) => !!u) as [string, string][];

  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="inline-flex rounded-2xl bg-background p-3">
            <img src={logo} alt={s?.org_name ?? "Servio Hope Foundation"} width={120} height={120} loading="lazy" className="h-28 w-28 object-contain" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            {s?.org_name ?? "Servio Hope Foundation"} ({s?.abbreviation ?? "SHF"}) — a humanitarian and charitable foundation based in {s?.country ?? "Uganda"}.
          </p>
          <p className="mt-2 text-xs text-primary-foreground/60">
            Status: {s?.legal_status ?? "—"}
            {s?.registration_number ? ` · Reg. no. ${s.registration_number}` : ""}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="text-primary-foreground/80 hover:text-gold">{n.label}</Link></li>
            ))}
            <li><Link to="/donate" className="text-primary-foreground/80 hover:text-gold">Donate</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            {s?.address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{s.address}</li>}
            {s?.email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>}
            {s?.phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`tel:${s.phone}`} className="hover:text-gold">{s.phone}</a></li>}
            {!s?.address && !s?.email && !s?.phone && <li><Link to="/contact" className="hover:text-gold">Send us a message →</Link></li>}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {socials.map(([n, u]) => (
                <li key={n}><a href={u} target="_blank" rel="noopener noreferrer" className="rounded-full border border-primary-foreground/25 px-3 py-1 text-xs hover:border-gold hover:text-gold">{n}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {s?.org_name ?? "Servio Hope Foundation"}. {s?.motto}</p>
          <Link to="/auth" className="hover:text-gold">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}
