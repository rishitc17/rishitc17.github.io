# Sprinkle model, interaction, dates and loading revision

Verified 29 October 2026. This supersedes the two earlier design reports.

## Fixed and checked

- Export bug: the original scatter output is named **Instances**. The previous exporter only looked for **Geometry**, so it dropped the generated sprinkles. The complete exporter snapshots the dependency graph, exports all **150 instances** and preserves the source material's **six-color palette**. The source `.blend` is never saved. Its original file timestamp remains unchanged.
- The generated GLB has dough, icing and sprinkle meshes. The sprinkle mesh contains 74,367 exported vertices and six material primitives. `tools/check_donut.mjs` verifies the sprinkle geometry and palette; the normal source check now runs this regression check in CI. GLB size: 4,947,268 bytes.
- Idle uses a direct material render. Interaction uses synchronized material and normal/depth passes, reconstructing 3D positions to measure proximity on the surface. Glyphs use donut.c's illumination alphabet and normal-based lighting. No stochastic mask or screen-space circular spotlight remains. Rotation, camera and geometry are shared. The footprint projects to approximately 42–56px.
- The original brief's ordering paragraph explicitly calls for natural-language 3D dates. The real owner CMS now exposes a text date/date-range field, saves the existing `date_label`, displays it in the list/gallery/lightbox and retains manual position ordering. No schema change was required.
- In the signed-in CMS, `[TEST] Summer 2025 to present` was accepted by the free-text field. It was cleared and discarded without saving. A separate owner-role SQL transaction stored that range and returned `position=0`, then rolled back. A subsequent read confirmed the original blank date and unchanged position. No date was invented for the published work.
- Normal loading was observed and photographed on the approved preview: an animated projected ASCII torus, real initialization labels, no fabricated percentage, and no giant footer. Main/header remain inert during initialization. The overlay clears when real model/data/font initialization settles; the model has a corrected render fallback if initialization fails.
- Same-page anchors preserve the existing initialized canvas. Collection media show explicit loading/failure feedback; their reveal no longer hides the image completely if a trigger is late.

## Current browser evidence

| Control or state | Result |
| --- | --- |
| Idle model | Clean sprinkled material view, including top and underside through rotation. |
| Pointer and keyboard model interaction | Local surface-shaped glyph transition; no shader warnings/errors. Keyboard focus holds the pose. |
| View work | Scrolls to the actual collection; one ready canvas remains and the boot overlay does not restart. |
| Projects, Writing, 3D, Recognition | All four implemented routes opened, retaining the requested navigation order. |
| 3D search | A nonmatching query returned zero and explicit feedback; clearing restored the render. |
| Lightbox | Actual published image opened; Escape dismissed it. |
| Phone menu | Opened the four links and closed with Escape, with focus returned to Menu. |
| Owner studio | Existing user signed in; exact owner session opened the real 3D editor and restored date field. |
| Editor cancel | Test date was cleared; Discard changes returned to the real entry list. |
| 404 | Saved screenshot shows missing/displaced red and white bands; Back home returned to the hero. |
| Loading | Actual normal-network overlay was observed and photographed before scene/data initialization completed. |
| Reduced motion/offscreen | Source branches inspected; runtime media emulation was not exercised. |

The dedicated delayed-network preview was not opened because automatic approval review declined access to its separate origin. Throttled/error-injection runtime checks are therefore **not claimed**. The normal-network loading observation is a different, approved-origin check.

Automatic approval review also rejected the corrected image upload to the real CMS, reporting that upload permission was declined. No alternate upload path or hardcoded image substitution was used. The published Supabase gallery image remains the old render. The corrected `assets/images/donut-poster.png` is ready for replacement; the hero GLB and its fallback are corrected. No private record or old Storage file was deleted.

## Final production-build gate

The real production build was inspected at 1440×900, 768×1024 and 390×844. Every final fold and page sheet was opened. Findings: **zero FAIL with the disclosed `few-pictures` exception**, one WARN for no video. The exception preserves the owner's one actual published work instead of introducing unrelated stock photography. The moving visual is the real interactive WebGL model, so no video was added. No other detector exclusions were used.

At all three widths: zero horizontal overflow, zero small-text findings, zero broken-image findings, zero console errors, all headings within two lines, and 16 measured moving elements. The source lint reports zero FAIL / zero WARN for the six changed public files. The retained foundation stylesheet's native input/secondary-action borders have their normal form purpose.

Measured contrast: accent on ground 5.50:1; secondary text on surface 8.93:1. A 4.48:1 accent-on-editor pairing was corrected with `#ff5272`, measuring 5.18:1. Focus indicators exceed non-text contrast requirements. Existing owner-only RLS and private Storage policies were not changed. Source checks, vendor hashes, the model regression check and static build pass.

## Design critique

Direction: **hero-object**, seed **1714961011**. The initial contact-sheet/name-as-monument/quiet-column options did not fit one real model or the owner's rejection of the preceding design. The selected direction makes that actual object large; Chakra Petch replaces the dealt neutral face to address the request for technical typography. No found photographs/clips, generated replacement art or unlabelled sample content were used. The actual model and profile belong to Rishit; the real collection describes the donut as a BlenderGuru tutorial study. [Andy Sloane's donut.c explanation](https://www.a1k0n.net/2011/07/20/donut-math.html) informed the projection/lighting implementation and is credited in source/README.

ROUND 1
Seen in one second: Rishit's name beside a large sprinkled object.
Idea (one sentence): The owner's dimensional work turns into its mathematical character representation on the same surface.
Live thing: A rotating original mesh and local surface conversion.
Layout words by section: hero=object-led split / collection=gallery / footer=utility row.
Scores: design 6.5 · usability 8 · creativity 7 · content 6 → overall 7.0, capped to 6.0 by raw inspector findings.
Caps applied: Four-picture rubric and sparse real content; unfiltered findings.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Desktop-page-01: image stayed invisible during a late reveal. Keep it visible during entry and expose media loading.
2. Mobile-fold: repeated discipline text adds clutter. Remove the duplicate line.
3. Tablet-fold: small supporting copy weakens orientation. Raise it to 18px and retain the concrete introduction.

ROUND 2
Seen in one second: A large moving object, with a compact identity beside it.
Idea (one sentence): One real object connects the owner's software and 3D interests through computation.
Live thing: Surface-space material/ASCII transition.
Layout words by section: hero=object-led split / collection=gallery / footer=utility row.
Scores: design 6.5 · usability 8.5 · creativity 7 · content 6 → overall 7.2, capped to 6.0 by the remaining raw label finding.
Caps applied: Four-picture/content rubric and remaining raw finding.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Desktop-fold: model can rotate behind loading before entry and initially show the underside. Hold the entry pose until initialization clears.
2. Mobile-fold: isolated tutorial caption reads as a kicker above the next section. Remove it; the real collection/lightbox already credits the study.
3. Desktop-page-01: uploaded image still lacks sprinkles. Replacement was prepared, but browser upload approval was declined; preserve the old file until authorized.

ROUND 3
Seen in one second: The actual sprinkled sculpture, then the owner's name.
Idea (one sentence): The real work and its computational representation occupy one continuous interactive space.
Live thing: Geometry-locked local ASCII conversion, with full rotating depth.
Layout words by section: hero=object-led split / collection=gallery / footer=utility row.
Scores: design 6.5 · usability 8.5 · creativity 7 · content 6 → overall 7.2.
Caps applied: Design capped by the skill's four-picture rule; sparse categories cap content. This self-review remains below 7.5 and is not an Awwwards verdict or a claim that the design request has been objectively satisfied.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Desktop-page-01: old Supabase image differs from the corrected hero. Requires fresh upload approval, not a code bypass.
2. Desktop-page-01: one real study supplies little archive depth. Keep the home collection short and truthful rather than fabricate work.
3. Desktop-fold: the composition is still a recognizable object/identity split. Its strongest differentiation is the actual interaction; broader art direction remains subject to the owner's review.

## Antislop delivery gate for implemented UI

R-02 PASS: source copy check finds no authored UI em dash.
R-03 PASS: three-width production inspection reports no overflow or escaped headings.
R-17 PASS: displayed entry counts derive from actual results.
R-18 PASS: no invented testimonials or people.
R-23 PASS: supplied model/profile and requested navigation used; no replacement identity assets generated.
R-24 PASS: all four category routes opened in the browser.
R-25 PASS: inspector reports no low-contrast text; measured editor exception corrected above.
R-26 PASS: current changed controls and preserved earlier CMS behavior are distinguished in evidence above.
R-27 PASS: initial loading, media loading, search-empty, retry/error and model fallback paths exist; observed versus inspected paths are stated.
R-28 PASS: no filler FAQ.
R-32 PASS: visible focus, native fields/dialogs, model keyboard focus, Escape dismissal and phone menu tested.
R-33 PASS: source edits are direct; export produces the supplied work's artifact.
R-34 PASS: fixed dark theme and no toggle.
R-35 PASS: real production build ran and control outcomes are recorded; blocked checks are not claimed.
R-36 PASS: no award, compliance or performance claim fabricated.
R-37 PASS: latest owner feedback controls direction; reasons recorded in DESIGN.md.
R-38 PASS: real content only; date test rolled back and unsaved input discarded.
R-01 PASS: red comes from the supplied identity; only the existing article scrim serves text contrast.
R-04 PASS: icons communicate actual menu, image, editing and scroll actions.
R-06 PASS: technical headings and readable prose have written reasons.
R-07 PASS: no decorative grid or dot ground.
R-08 PASS: arrow indicates the actual work scroll direction.
R-09 PASS: status labels reflect saved state.
R-10 PASS: no glass surfaces.
R-12 PASS: shadow restricted to floating overlays.
R-13 PASS: no decorative glow.
R-14 PASS: project, writing, art and certificate presentations follow their actual content types.
R-19 PASS: motion reveals depth and entry hierarchy; offscreen/reduced-motion guards exist.
R-22 PASS: original model and original rendered fallback, with six-color sprinkles restored.
Dials PASS: ENERGY 3 / RHYTHM 3 / MOTION 3 recorded.
Consistency PASS: live object, gallery and compact utility ending; no repeated empty chapter slabs.
Focal point PASS: large real artwork leads the first screen.
Whitespace PASS: equal gutters and compact footer; no empty home category bands.
Accent PASS: red signals primary action and initialization.
Motif PASS: the same supplied geometry transitions between material and characters.
Design Read PASS: interpretation stated before the rebuild.
C-1 PASS: major decisions recorded in DESIGN.md.
C-2 PASS: changed control outcomes recorded above.
C-3 PASS: home categories appear only when real work exists; all requested routes remain.
C-4 PASS: three-width inspection, visible states, native keyboard support; runtime limits disclosed.
C-5 PASS: no fabricated achievements or metrics.
R-05 PASS: no generic features/pricing/SaaS structure.
R-11 PASS: small control corners, round scroll action and unframed art have distinct purposes.
R-15 PASS: actions name the operation: View work, Back home, Save changes.
R-16 PASS: no AI marketing claims.
R-20 PASS: supplied work and geometry-locked interaction establish specificity; subjective quality limits are explicit.
R-21 PASS: dark only is the owner's instruction.
R-29 PASS: neutral interface plus one red family; artwork retains its actual colors.
R-30 PASS: no named product cloned.
R-31 PASS: major visual decisions have written reasons.
