import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsQuery } from "@/lib/site";
import { PageHero } from "@/components/site/ui";
import { MessageForm } from "@/components/site/MessageForm";
import { VolunteerForm } from "@/components/site/VolunteerForm";
import youthImg from "@/assets/youth.jpg";

export const Route = createFileRoute("/_site/get-involved")({
  head: () => ({
    meta: [
      { title: "Get Involved — Volunteer or Partner | Servio Hope Foundation" },
      { name: "description", content: "Volunteer your time and skills, or partner with Servio Hope Foundation." },
      { property: "og:title", content: "Get Involved — Servio Hope Foundation" },
      { property: "og:description", content: "Volunteer or partner with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GetInvolved,
});

function GetInvolved() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <>
      <PageHero eyebrow="Get involved" title="Give your time, skills or partnership" intro={s?.volunteer_intro} image={youthImg} />
      <section className="container-site max-w-3xl py-20">
        <Tabs defaultValue="volunteer">
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
            <TabsTrigger value="partner">Partner with us</TabsTrigger>
          </TabsList>
          <TabsContent value="volunteer">
            <h2 className="mb-6 text-2xl font-bold text-navy">Volunteer application</h2>
            <VolunteerForm />
          </TabsContent>
          <TabsContent value="partner">
            <h2 className="mb-6 text-2xl font-bold text-navy">Partnership enquiry</h2>
            <MessageForm kind="partner" cta="Send enquiry" messageLabel="Tell us about your organisation and partnership idea" />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
