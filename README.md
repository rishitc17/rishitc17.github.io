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
- 3D: image, description, natural-language date/date range, original/tutorial flag; manual order and a public lightbox. Dates appear in the list, gallery and lightbox without changing the manual sort.
- Recognition: certificate image, description, tags, real date; newest first.
- Every section supports drafts, publishing, home-page featuring, editing and deletion.

Home uses vertical cards for every category. Collection pages use project and writing cards, a certificate gallery, and natural-image-ratio 3D masonry. Tags are pills, dates have calendar markers, and project state uses a separate rectangular label. Importing a Markdown file fills the same editable content field used by the public project page; it is not a separate write-up.

The up/down controls persist manual order transactionally. Drafts and their files are private. Image uploads support PNG, JPEG, WebP and AVIF up to 15 MB. Markdown files can be up to 2 MB. Markdown output is sanitised with DOMPurify. Published media use five-minute signed URLs, so an already-issued URL may remain usable until expiry after unpublishing. Previously downloaded files cannot be recalled.

The applied database definition is in `supabase/schema.sql`. `supabase/verify.sql` tests owner/anonymous/other-user access and ordering inside a transaction that rolls back all fixtures. Do not reapply the initial schema to an already configured project.

## Donut

`tools/export_donut.py` calls the complete export, preserving evaluated surfaces and all 150 sprinkle instances. It copies the six colors from the source sprinkle ramp, relinks the existing local textures and bakes the surface colors into a self-contained GLB. It never saves the source `.blend`. The older exporter lost instances by assuming the node output was named Geometry; this file's output is named Instances. Run with Blender:

```sh
blender --background --factory-startup --python tools/export_donut.py
```

The idle model renders directly. Interaction uses synchronized material and normal passes of the complete model, with one camera and pose. The cursor removes a soft local area of the foreground to reveal the aligned ASCII clone behind it. The 78–115px radius and 8×12px glyph cells replace the earlier tiny surface patch. Pointer coordinates follow the hero's scroll translation and scale. The character alphabet and lighting approach follow [Andy Sloane's explanation of donut.c](https://www.a1k0n.net/2011/07/20/donut-math.html). Rotation turns around the donut's own axis in about 8.7 seconds with bounded tilt and roll; the glaze stays toward the camera. Keyboard focus holds rotation and reduced motion disables autoplay. Hidden and offscreen rendering cancels pending frames, then visibility/focus restoration resumes without pointer input. The corrected real render is the WebGL fallback. There are no mode buttons or operating hints. `tools/check_donut_motion.mjs` checks the glaze-facing invariant and frame cancellation/resumption.

The interface is dark only. An object-led hero and technical Chakra Petch headings replace the editorial chapter treatment. The footer is compact. The loading sequence animates a projected ASCII torus and reports real initialization stages, then releases the interface when model/data/fonts settle. Vendored GSAP and ScrollTrigger retain native scrolling and a reduced-motion path. See `DESIGN.md` for the direction and its constraints.

## Dependencies and attribution

- Three.js 0.180.0, MIT
- GSAP and ScrollTrigger 3.13.0, [GSAP Standard License](https://gsap.com/standard-license/) (notice preserved locally)
- Supabase JS 2.57.4, MIT
- Marked 16.3.0, MIT
- DOMPurify 3.2.7, Apache-2.0 OR MPL-2.0
- Font Awesome Free 6.7.2, font files under SIL OFL 1.1 and CSS under MIT
- Chakra Petch, Manrope and legacy Archivo font files, SIL Open Font License
- Donut model and profile image supplied by Rishit Choudhary; donut follows the BlenderGuru tutorial. Original local material assets are baked into the supplied work.

See `VENDOR.json` for hashes, `DESIGN.md` for design reasons and `COLLECTION-VERIFICATION.md` for current checks. The other verification documents preserve earlier delivery evidence.
