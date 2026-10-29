# Dark studio revision, 29 October 2026

The owner requested dark only, stronger personal art direction, faster full 3D rotation, a smaller local ASCII effect, no donut controls/instructions, a visibly broken 404 and corrected CMS spacing. The revision keeps the existing content and Supabase permissions.

## Browser and build evidence

Production-build inspection ran at 1440×900, 768×1024 and 390×844. All six final fold/page sheets were opened and reviewed. Final artifacts are in the ignored `.taste-skill/after-round-3/` directory.

| Measurement | Before | Final |
| --- | --- | --- |
| Heading line limit | A three-line section heading | All headings at most two lines |
| Small text under 13px | Six elements reported | Zero |
| Moving elements | Three reported | Eighteen at every tested width |
| Horizontal overflow | No observed issue | Zero at all three widths |
| Broken images | None | None |
| Browser console errors | No retained error | Zero at all three widths |

Final source lint: zero FAIL, two WARN for legitimate input/secondary-action outlines. Final rendered inspector: zero FAIL **with two disclosed exclusions**. `few-pictures` is excluded because there is only one published real work, and unrelated stock images would misrepresent this portfolio. `eyebrow` is excluded because the empty recognition message belongs to its own section; it is incorrectly associated with the next section's large footer wordmark. The unfiltered second report is retained and reports those two findings. Exclusions are not hidden design fixes.

Other warnings: the fluid display scale produces more than five computed font sizes; the measured 5.2:1 running text is full white on the crimson chapter and meets AA; the moving picture is the actual WebGL model rather than video; the bare-name detector misses the visible introductory sentence and the 18px subtitle below the name. No video or unrelated photograph was added to satisfy a quota.

Contrast checker: accent `#fd3456` on `#0d0d0f` is 5.36:1; white on `#d90c34` is 5.18:1. The browser inspector found no low-contrast text.

| Control/flow | Current verification |
| --- | --- |
| Idle donut | Sharp direct rendering; ASCII compositor bypassed entirely. Screenshot reviewed. |
| Hover donut | Small local patch seen on the actual mesh; no shader warnings/errors. Raycast and 32–52px radius inspected. |
| Rotation | Continuous multi-axis full turns; main axis approximately 6.6 seconds per revolution. |
| Keyboard model access | Focusable stage; focus holds angle, blur resumes; source inspected. |
| Donut controls/hints | No mode, pause, scramble, repair or visible operating hint remains. |
| 404 | Missing bands and displaced red fragments visible in saved screenshot; Back home clicked successfully. |
| Main navigation | Existing four clean routes retained; 3D clicked and loaded real content. |
| 3D render | View The donut opened the actual published image and description. |
| Lightbox keyboard | Escape closed it and restored the collection. |
| Search | Nonmatching input showed zero entries and explicit feedback; clearing restored the real render. |
| Phone menu | At 390px opened all four links; Escape closed it and returned focus to Menu. |
| CMS feedback spacing | Real stylesheet/markup component fixture measured 24px to toolbar at 390px; saved screenshot reviewed. No database fixture created. |
| Owner CMS | Data actions unchanged; authenticated CRUD/upload/publish/Markdown/delete verification remains in the historical report. These writes were not repeated for a visual revision. |
| Reduced motion | JS media-query and CSS branches inspected; autoplay stops and content remains visible. Runtime media emulation was not exercised. |
| Page motion | Eighteen moving elements measured during actual load/scroll. Route teardown kills owned GSAP timelines/triggers. |
| Themes | Fixed dark palette, dark color-scheme and no toggle. |

`tools/check.mjs` and `tools/build.mjs` pass. Vendored GSAP 3.13.0 and ScrollTrigger have pinned SHA-256 entries and a local licence notice linking the official terms. Fonts/libraries do not require runtime CDN access. No Supabase schema or policy changes were made.

## Screenshot critique

ROUND 1
Seen in one second: Rishit's name and his dimensional donut.
Idea (one sentence): His own model turns material into characters above a name that forms the page's base.
Live thing: Mesh-local material-to-ASCII translation on a rotating real model.
Layout words by section: hero=object/name / work=crimson split / empty collections=rows / 3D=gallery / footer=wordmark.
Scores: design 6.5 · usability 7.5 · creativity 7 · content 6 → overall 6.9, capped to 6.0 by unfiltered inspector findings.
Caps applied: Fewer than four pictures; raw inspector findings; currently unpublished collections.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Tablet-fold: portrait hero has an excessive empty gap. Remove the tablet viewport-height minimum.
2. Desktop-fold: action above the name competes with the object. Put one work action below the name.
3. Mobile-fold: the first screen needs clearer orientation below the name. Add the plain software/writing/3D subtitle.

ROUND 2
Seen in one second: A large name anchored beneath a rotating original object.
Idea (one sentence): A personal studio built around Rishit's name and the work he actually made.
Live thing: The same model, with a small surface translation under the pointer.
Layout words by section: hero=object/name / work=crimson split / empty collections=rows / 3D=gallery / footer=wordmark.
Scores: design 6.5 · usability 8 · creativity 7 · content 6 → overall 7.0, capped to 6.0 by unfiltered inspector findings.
Caps applied: Fewer than four pictures; raw inspector findings; currently unpublished collections.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Mobile-fold: hidden desktop line breaks join words. Add literal spaces around those breaks.
2. Desktop-page-01: the archive remains sparse with one real work. Keep empty rows compact; do not invent achievements.
3. Desktop-page-01: the meter treats an empty section message as a footer kicker. Record the false-positive exclusion explicitly.

ROUND 3
Seen in one second: Rishit's name, then his rotating chocolate-iced model.
Idea (one sentence): The owner's original model translates between solid material and characters in a dark personal studio.
Live thing: Tight mesh-gated ASCII interaction and continuous multi-axis rotation.
Layout words by section: hero=object/name / work=crimson split / empty collections=rows / 3D=gallery / footer=wordmark.
Scores: design 6.5 · usability 8.5 · creativity 7 · content 6 → overall 7.2.
Caps applied: Design at most 6.5 under the skill's four-picture rubric; content at most 6 while requested categories lack published material. This is a self-review, not an award or jury score, and remains below the skill's 7.5 target.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Desktop-page-01: three collections have no published material. The remaining limit is real content, not another decorative section.
2. Desktop-fold: the model is the only distinctive work visual. Add future original work through the CMS when available; no stock imagery stands in for it.
3. Desktop-page-01: copy is deliberately brief and cannot express a rich personal biography from the current verified facts. A future specific project story can strengthen it without age or school references.

Direction: name-as-monument, seed 752900178, palette/type retained. No redraw. The dealt crossing photograph is replaced by the owner's actual model above the name, preserving readable type. No found pictures or clips, no AI-created imagery, no unlabelled sample content. The R profile and donut are supplied by Rishit; the donut is explicitly credited as a BlenderGuru tutorial study in its collection/lightbox.

## Antislop delivery gate

R-02 PASS: source punctuation check finds no authored UI em dash.
R-03 PASS: final three-width inspector reports zero horizontal overflow or clipped headlines.
R-17 PASS: entry counts come from returned real data.
R-18 PASS: no testimonials or fictional people.
R-23 PASS: uses the supplied R identity, supplied model and requested categories.
R-24 PASS: all four original navigation destinations remain implemented.
R-25 PASS: final inspector reports no low-contrast text; measured pairs above meet AA.
R-26 PASS: surviving public controls were exercised as recorded above; CMS operations retain prior verification.
R-27 PASS: collection loading, empty and search-empty states observed; error/retry and WebGL fallback inspected.
R-28 PASS: no filler FAQ.
R-32 PASS: visible focus, native dialogs/fields, keyboard Escape and mobile focus return verified.
R-33 PASS: direct source edits; build/export scripts produce artifacts rather than patch UI source.
R-34 PASS: one fixed dark theme; no theme toggle.
R-35 PASS: production build ran in the browser; current and historical control evidence is distinguished above.
R-36 PASS: no invented metrics, compliance promises or award claims.
R-37 PASS: revised owner direction and design read recorded before implementation.
R-38 PASS: real donut only; no new fixture data in Supabase.
R-01 PASS: crimson derives from the supplied profile; only article scrim supports text contrast.
R-04 PASS: icons indicate actual menu, navigation, image or editing actions.
R-06 PASS: Archivo carries the name, Manrope the prose; reasons in DESIGN.md.
R-07 PASS: no decorative grid or dot ground.
R-08 PASS: the hero arrow points to actual work below; arrows are not on every action.
R-09 PASS: status labels reflect saved content state.
R-10 PASS: no glass surfaces.
R-12 PASS: shadow restricted to floating dialogs/menu.
R-13 PASS: no decorative background glow.
R-14 PASS: project, writing, art and recognition layouts follow their content.
R-19 PASS: motion shows model depth and guides the page hierarchy; reduced-motion and focus guards inspected.
R-22 PASS: the visual is the owner's original model, with its real rendered fallback.
Dials PASS: ENERGY 3 / RHYTHM 3 / MOTION 3 recorded in DESIGN.md.
Consistency PASS: object-led hero, crimson chapter, compact rows and large gallery vary the rhythm.
Focal point PASS: dominant name and actual artwork lead; no generic slogan.
Whitespace PASS: tablet excess gap corrected and empty categories compacted.
Accent PASS: one red family connects the original identity, chapter and primary action.
Motif PASS: supplied object translated between material and ASCII.
Design Read PASS: declared before building in the conversation.
C-1 PASS: visual purposes are written in DESIGN.md.
C-2 PASS: public control outcomes recorded above.
C-3 PASS: sections correspond to the owner's requested categories.
C-4 PASS: three-width reflow, native keyboard controls, visible focus and state fallbacks; runtime limits disclosed.
C-5 PASS: no invented achievements or testimonials.
R-05 PASS: no pricing/features/stock SaaS structure.
R-11 PASS: square primary actions, small form corners and one circular scroll action have distinct roles.
R-15 PASS: actions identify the operation, such as View work, Back home and Save entry.
R-16 PASS: no generic AI marketing claims.
R-20 PASS: supplied identity and original interactive model provide specificity; content limitations are not disguised.
R-21 PASS: dark only is the owner's explicit request.
R-29 PASS: neutral grounds and ink with one red accent family.
R-30 PASS: no named product cloned.
R-31 PASS: palette, layout, type, spacing, imagery and motion decisions recorded in DESIGN.md.
