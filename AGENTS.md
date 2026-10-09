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

- Keep the catalog data client-side and the bag in React state; the current scope is a presentation catalog with WhatsApp handoff, not persisted inventory or online checkout.
- Build order links with the shared catalog helper so quantity, sizes and the store destination are consistent and testable.
- Keep brand styling in global semantic tokens and shared Button variants so the catalog and dialogs stay visually consistent.
