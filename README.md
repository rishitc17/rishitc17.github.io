# Rishit Choudhary’s portfolio

A buildless Vanilla HTML, CSS and JavaScript portfolio, with Three.js, Supabase Auth, private Storage and an owner-only CMS.

## Run locally

Use Node 22 or newer:

```sh
npm run dev
```

Open http://127.0.0.1:4173. No npm install is needed. Browser libraries and fonts are pinned and vendored. Run `npm run check` for source checks and `npm run build` to create `dist/`.

## Publishing

The GitHub Pages workflow builds and deploys `dist/` from `main`. In repository Settings > Pages, select **GitHub Actions** as the source. The site assumes the domain root, as used by `rishitc17.github.io`.

The custom `404.html` boots the same SPA at the original URL. Direct project URLs and reloads work without query parameters. GitHub Pages serves deep routes with an HTTP 404 status before the SPA loads; returning HTTP 200 for arbitrary dynamic routes requires a host with rewrite support. Client-side navigation uses clean paths throughout.

The build excludes `.blend` sources, setup notes, database scripts and developer tools. Never upload `assets/supa.txt` or a secret/service-role key. The browser configuration contains only the public project URL, publishable key and public owner ID.

## Studio

Visit `/admin` and sign in with the existing authorised Supabase account. There is no account-creation UI. Only user `ca3574a5-1789-4012-910c-42f85a513b9b` can write, as enforced by RLS and Storage policies.

- Projects: hero image, natural-language dates, tags, optional links, status, editable Markdown or Markdown-file upload, manual order, private preview.
- Writing: description, source URL, tags, real date; newest first.
- 3D: image, description, original/tutorial flag; manual order and a public lightbox.
- Recognition: certificate image, description, tags, real date; newest first.
- Every section supports drafts, publishing, home-page featuring, editing and deletion.

The up/down controls persist manual order transactionally. Drafts and their files are private. Image uploads support PNG, JPEG, WebP and AVIF up to 15 MB. Markdown files can be up to 2 MB. Markdown output is sanitised with DOMPurify. Published media use five-minute signed URLs, so an already-issued URL may remain usable until expiry after unpublishing. Previously downloaded files cannot be recalled.

The applied database definition is in `supabase/schema.sql`. `supabase/verify.sql` tests owner/anonymous/other-user access and ordering inside a transaction that rolls back all fixtures. Do not reapply the initial schema to an already configured project.

## Donut

`tools/export_donut.py` exports the original mesh, realises geometry-node instances, relinks existing Poliigon images from the local library, and bakes the existing materials into a self-contained GLB. It leaves the source `.blend` unchanged. Run with Blender:

```sh
blender --background --factory-startup --python tools/export_donut.py
```

The browser renders the model once into a shared render target. The realistic pixels, ASCII luminance and silhouette all sample that same frame. A per-cell, distance-weighted mask translates the surface around the pointer. No second model or spotlight is involved. Pointer/touch interaction, a full-ASCII toggle and a pause control are available; reduced-motion starts paused. Rendering suspends outside the viewport and in hidden tabs. A real still is shown when WebGL is unavailable.

## Dependencies and attribution

- Three.js 0.180.0, MIT
- Supabase JS 2.57.4, MIT
- Marked 16.3.0, MIT
- DOMPurify 3.2.7, Apache-2.0 OR MPL-2.0
- Font Awesome Free 6.7.2, font files under SIL OFL 1.1 and CSS under MIT
- Archivo and Manrope, SIL Open Font License
- Donut model and profile image supplied by Rishit Choudhary; donut follows the BlenderGuru tutorial. Original local material assets are baked into the supplied work.

See `VENDOR.json` for file hashes and source versions, `DESIGN.md` for design reasons and `VERIFICATION.md` for the delivery checks.
