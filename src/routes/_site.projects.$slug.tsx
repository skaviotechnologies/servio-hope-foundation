import { createFileRoute } from '@tanstack/react-router';
import { ProjectPage } from '@/components/site/ProjectPage';
import { projectDetailQuery } from '@/lib/projects';
import { ErrorState } from '@/components/site/ui';

export const Route = createFileRoute('/_site/projects/$slug')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(projectDetailQuery(params.slug)),
  head: ({ loaderData, params }) => {
    const p = loaderData?.project;
    const title = `${p?.title ?? 'Project unavailable'} — Servio Hope Foundation`;
    const description = p?.summary || 'Explore this Servio Hope Foundation project, its objectives and verified progress.';
    const url = `https://servio-hope.lovable.app/projects/${encodeURIComponent(params.slug)}`;
    return { meta: [ { title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { property: 'og:url', content: url }, { name: 'twitter:card', content: 'summary_large_image' }, ...(p?.image_url?.startsWith('https://') ? [{ property: 'og:image', content: p.image_url }, { name: 'twitter:image', content: p.image_url }] : []), ...(!p ? [{ name: 'robots', content: 'noindex' }] : []) ], links: [{ rel: 'canonical', href: url }] };
  },
  errorComponent: ErrorState,
  notFoundComponent: () => <section className="container-site py-20">Project unavailable.</section>,
  component: () => { const { slug } = Route.useParams(); return <ProjectPage slug={slug} />; },
});
