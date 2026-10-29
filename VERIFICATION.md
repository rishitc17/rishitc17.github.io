# Initial portfolio verification (historical)

This records the first build before the dark-studio revision. Theme and donut controls mentioned below have since been removed. Current checks, screenshots and design critique are in [REDESIGN-VERIFICATION.md](REDESIGN-VERIFICATION.md).

Verified on 29 October 2026 against the running local site and the connected Supabase project.

## Recorded browser checks

| Control or flow | Evidence |
| --- | --- |
| Name/home link | Opens `/` with the hero and collection sections. |
| Projects, Writing, 3D, Recognition | Each opens its matching clean path; the active navigation item is marked. |
| Home primary action and selected-work link | Scroll to the real `#selected-work` section. |
| Home collection links | Target the implemented section pages. |
| ASCII view | Toggles full character rendering of the same paused model; aria-pressed changes. |
| Pointer on donut | Converts nearby surface cells into characters without moving or duplicating the model. |
| Pause/Play | Freezes and resumes rotation; keyboard Enter also operates the controls. |
| Mobile menu | Opens, shows the four destinations, and closes with Escape. |
| Theme toggle | Changes all surfaces, text and canvas background; both modes inspected. |
| 3D search | A matching query returns The donut; a nonmatching query shows an explicit empty message; clearing restores the entry. |
| Render lightbox | Loads the actual uploaded image and title/description, including when signed out. Close button and Escape both work. |
| Studio sign-in | User signed in with their own existing credentials; the exact authorised account reached the CMS. |
| Studio sign-out | Returned to the sign-in form and invalidated the local account session. |
| Empty sign-in | Native validation identifies the required email and password. |
| Section selector | All four editors open with their section-specific fields; stale-response protection prevents cross-section lists. |
| Image upload | Real donut poster uploaded to the private bucket, previewed, and saved. |
| Draft save | Real donut saved as private; anonymous SQL reads returned zero draft rows and zero draft files. |
| Publish | Saved the real donut as published; anonymous browser loaded its image successfully. |
| Original/tutorial checkbox | The saved donut is correctly marked Tutorial study. |
| Featured checkbox | The saved donut appears on the home page. |
| Project fields | Temporary draft stored title, description, tags, natural-language date and Ready to launch status. |
| Markdown import | A real `.md` file populated the editor and was uploaded to private Storage. |
| Markdown preview | Rendered bold, italic, links, a table and a code block; scripts and javascript URLs were removed. |
| Private project preview | Rendered the temporary project at `/admin/preview/<id>`, including Markdown and the private-preview notice. |
| Writing editor | URL and actual date inputs accepted input; no fictional writing was published. |
| Recognition editor | Empty submit correctly identified title, slug and date as required. |
| Unsaved changes | Cancel opened the confirmation; Keep editing preserved input, and Discard changes closed the editor. |
| Delete entry | Escape dismissed confirmation. With explicit user approval, deletion removed the temporary entry and its Markdown file. |
| 404 | Repair donut and Scramble donut toggle state; home recovery link opens `/`. |
| Back to top | Scrolls to the top and restores focus to the name link. |

The real collection contains only The donut. No invented projects, writing or certificates were retained. Storage contains the real donut image only. No password was copied into source or tool output.

## Database and storage

`supabase/verify.sql` ran successfully after the final policy migration. All fixtures rolled back. Assertions checked owner create/read/update/delete, transactional manual ordering, anonymous published-only reads, private draft media exclusion, and rejection of non-owner writes/uploads/media changes. Actual owner upload, draft save, publishing and file deletion were also exercised through the CMS. The public image was downloaded in the signed-out browser.

All content uses the RLS-enabled `public.entries` table. The bucket is private. Policies target the exact authorised UUID. The owner check uses `auth.uid()`, not editable metadata. No security-definer functions are used. Only a publishable key is in browser code. The performance advisor returned no findings after splitting policies by role and operation.

The existing Supabase Auth configuration reports **Leaked Password Protection Disabled**. This is an account setting, separate from the implemented RLS. [Supabase’s instructions](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) explain how to enable it. No setting requiring a plan upgrade was changed.

## Responsive, contrast and implementation evidence

- Browser viewport checks: 375×812, 768×1024, 812×375, 1280×720 and 1440×900. `document.documentElement.scrollWidth <= innerWidth` at every tested size.
- Mobile controls were measured; a narrow icon-only scroll link was corrected to a 44px target and given an accessible name.
- Keyboard checks exercised Enter, Escape, focus return, native form validation and modal dismissal. The dialog uses the browser's modal focus management.
- Contrast checker: red `#d20b32` on light ground `#f5f4f0` = 4.98:1; muted text `#62635d` on `#eae9e4` = 4.99:1; dark-theme accent `#ff6d82` on `#191b19` = 6.40:1. The rendered dark home page audit checked 45 text elements and found no failures.
- Article text sits above a dark scrim whose weakest opacity is 0.73, preserving contrast even over a white image.
- Reduced motion starts the renderer paused and disables entrance/transitional motion. These branches were inspected; the browser harness did not expose media emulation. Browser zoom commands were unavailable; reflow was checked at narrow viewports and all text uses scalable rem/fluid type.
- Network loading, empty and error states are implemented with visible messages; requests time out after 20 seconds. Empty and loading states were observed live. Offline/error fallbacks and retry handlers were inspected in source.
- Latest browser session had no JavaScript warnings or errors after the shader fix. No remote CDN is needed at runtime.
- Source checks and static build passed. Vendored files are versioned and SHA-256 recorded in `VENDOR.json`.

## Antislop delivery gate

### Hard gate

- R-02 PASS: source punctuation check found no em dashes in authored UI text.
- R-03 PASS: tested viewport range has no horizontal overflow; mobile menu and controls reflow.
- R-17 PASS: only counts derived from real returned entries appear.
- R-18 PASS: no testimonials or fictional people appear.
- R-23 PASS: profile image, model, navigation and content structure came from the owner's explicit brief.
- R-24 PASS: every navigation destination is implemented.
- R-25 PASS: measured semantic colour pairs meet AA; rendered dark-page audit has zero failures.
- R-26 PASS: actual control behavior is recorded above; absent content creates no dead controls.
- R-27 PASS: collection, media, authentication and saves have visible loading/empty/error feedback; implemented fallbacks were inspected.
- R-28 PASS: no generic FAQ was introduced.
- R-32 PASS: native buttons, links, fields and dialogs support keyboard operation and visible focus; Enter and Escape exercised.
- R-33 PASS: features are implemented directly in source; build and export scripts create artifacts rather than patching UI source.
- R-34 PASS: light and dark surfaces and canvas update together; both themes inspected.
- R-35 PASS: site ran in a real browser, static build passed, and element-by-element checks are recorded above; verification limits are stated explicitly.
- R-36 PASS: no invented compliance, performance or customer claims.
- R-37 PASS: explicit owner direction recorded in DESIGN.md and Design Read declared before implementation.
- R-38 PASS: only supplied identity and real work are public; test content was clearly labelled and removed.

### Purpose gate

- R-01 PASS: red comes from the supplied profile image; the article gradient exists solely for text contrast.
- R-04 PASS: Font Awesome icons indicate actual navigation, editing, theme or image actions; no decorative feature glyphs.
- R-06 PASS: Archivo expresses precise display typography; Manrope carries readable personal prose; monospace is limited to ASCII and code.
- R-07 PASS: no decorative grid or dot background.
- R-08 PASS: arrows indicate scroll direction or destination; ordinary editing controls use explicit labels.
- R-09 PASS: status labels carry real saved state; no decorative capsule badge.
- R-10 PASS: no glassmorphism.
- R-12 PASS: shadow is restricted to modal/menu elevation.
- R-13 PASS: no page-wide glow.
- R-14 PASS: projects, writing, art and recognition use distinct content-specific compositions.
- R-19 PASS: motion explains rotation and representation changes; pause/reduced-motion/offscreen guards exist.
- R-22 PASS: the visual is the owner's actual Blender model, with a real rendered fallback.

### Liveliness

- Dials PASS: ENERGY 3 / RHYTHM 3 / MOTION 2 are explicit in DESIGN.md.
- Dial consistency PASS: large type and interactive hero, followed by distinct list/gallery/archive treatments.
- Focal point PASS: the hero pairs the short display statement with the original donut; supporting text remains subordinate.
- Structural whitespace PASS: section scale and gutters separate the narrative and the collection.
- Accent PASS: red marks the key action and the display word, with quieter secondary controls.
- Identity motif PASS: one model translated from material to characters belongs to this owner's brief.
- Design Read PASS: declared before building in the conversation.

### Craftsmanship and quality locks

- C-1 PASS: major decisions have written reasons in DESIGN.md.
- C-2 PASS: controls have concrete outcomes recorded in the browser checks.
- C-3 PASS: each section corresponds to an explicitly requested category.
- C-4 PASS: responsive layouts, native dialogs, keyboard focus, states and theme tokens are present; test limitations above are explicit.
- C-5 PASS: no invented achievements, testimonials or metrics.
- R-05 PASS: compositions follow the four actual content types, with no SaaS feature/pricing template.
- R-11 PASS: 6px action corners, small field corners and circular utility controls have distinct roles.
- R-15 PASS: actions name their destination or operation, such as Save entry, Preview project and See what I’m making.
- R-16 PASS: authored copy avoids the banned marketing buzzwords.
- R-20 PASS: the supplied R identity, red accent and model-to-ASCII interaction make the page specific.
- R-21 PASS: light/dark choice follows viewer preference, with a working persisted toggle.
- R-29 PASS: neutral grounds and ink plus one red accent; artwork retains its real material colours.
- R-30 PASS: no product was cloned.
- R-31 PASS: palette, composition, typography, spacing, artwork and motion purposes are written in DESIGN.md.

The owner's direction takes priority over optional taste-skill prescriptions for unrelated stock imagery, a serif font and photographic crossfades. No unrelated images were fabricated to meet an image quota.
