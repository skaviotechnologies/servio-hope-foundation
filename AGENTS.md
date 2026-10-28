<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Programme detail collections are stored on programme records and edited through the shared collection editor; projects link by programme ID and stories by selected IDs with public publication filters. Why: additional programme categories need no code changes and drafts never leak into related content.
- Public pages live under the `_site` pathless layout; admin pages under `_authenticated/admin*`. Why: shared header/footer vs. separate dashboard shell.
- All site content (settings, programs, projects, posts, messages) is read/written via the browser Supabase client with RLS; staff access via `has_role`/`is_staff`. Why: CMS editable without code.
- The `media` storage bucket is private (workspace blocks public buckets); uploads store 10-year signed URLs. Why: public images without a public bucket.
- First account to sign up becomes admin (DB trigger); later accounts need a role row. Why: bootstrap without manual DB work.
- About subsections and leadership profiles use dedicated publication-gated CMS records; only admins may modify them, and public queries filter published rows with deterministic display ordering. Why: draft approval must never expose unverified content or identities.
