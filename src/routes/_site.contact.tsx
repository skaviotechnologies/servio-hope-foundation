import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { settingsQuery } from "@/lib/site";
import { PageHero } from "@/components/site/ui";
import { MessageForm } from "@/components/site/MessageForm";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Servio Hope Foundation" },
      { name: "description", content: "Get in touch with Servio Hope Foundation in Uganda." },
      { property: "og:title", content: "Contact — Servio Hope Foundation" },
      { property: "og:description", content: "Send us a message." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: s } = useQuery(settingsQuery);
  const items = [
    { icon: MapPin, label: "Address", value: s?.address },
    { icon: Mail, label: "Email", value: s?.email, href: s?.email ? `mailto:${s.email}` : undefined },
    { icon: Phone, label: "Phone", value: s?.phone, href: s?.phone ? `tel:${s.phone}` : undefined },
  ].filter((i) => i.value);
  return (
    <>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" intro="Questions, ideas or offers of support — send us a message." />
      <section className="container-site grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          {items.length === 0 && <p className="text-muted-foreground">Use the form to reach our team.</p>}
          {items.map((i) => (
            <div key={i.label} className="flex gap-4 rounded-2xl bg-soft p-5">
              <i.icon className="h-6 w-6 shrink-0 text-emerald" aria-hidden />
              <div><p className="text-sm text-muted-foreground">{i.label}</p>{i.href ? <a href={i.href} className="font-semibold text-navy hover:underline">{i.value}</a> : <p className="font-semibold text-navy">{i.value}</p>}</div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border bg-card p-8 shadow-soft"><MessageForm kind="contact" /></div>
      </section>
    </>
  );
}
