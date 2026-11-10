# The Possession

The arena uses true 3D through a lightweight, imperative Three.js scene,
loaded with a dynamic import in the browser. This supports the requested
camera move from a straight overhead court view to a position just behind
the ball, following its passes, shots, and final dunk. The renderer is isolated from the page's HTML, so
resume text and interactive controls remain accessible DOM content.

The player, basketball, and hoop are actual Higgsfield-generated GLB assets.
Higgsfield also generated the hardwood texture and arena panorama. The player
uses a Meshy skeleton, shared across eight independently posed clones. Its
surface was welded, simplified, smoothed, and given a satin ivory finish; the
rigged model is 821 KB instead of the original 34 MB. Court dimensions and
markings remain geometric so the ball stays aligned with the painted floor.
The same scene supports the day-gym and night-arena themes;
the dark arena is the default unless the visitor selects the light theme.

A roughly 900-viewport-height track gives seven chapters room to breathe.
One normalized scroll progress drives the ball and camera: center-circle
tip-off from overhead, left-wing reception as the camera descends,
perimeter passes with a ball-follow camera, a drive through the lane,
project shots, the top of the key, and the final approach to the rim.
Reversing the scroll rewinds the possession.

`components/possession/possession-play.ts` defines explicit passers, receivers,
and possession. The tip goes to player 2, passes reach players 3 and 4, and an
outlet returns the ball to player 0 for the finish. Nobody owns the ball during
flight. Independent routes keep passers and receivers planted, with eased
gathers, two-hand catches, release poses, and distance-driven footsteps.
All motion is a pure function of scroll position, including the camera and
skeleton poses; no frame-by-frame distance accumulation affects rewinding.

The document renders all chapter content on the server. Pinning and scroll
animation progressively enhance that document; reduced-motion visitors
and visitors without JavaScript receive the chaptered vertical layout.
The play-by-play links provide direct chapter navigation.

The opening is exported from the actual 3D scene as a small WebP preview.
The live renderer loads on the first scroll, touch, click, or keyboard input,
then fades over that preview once its shaders are compiled. This keeps
WebGL setup out of the initial text paint and avoids a continuously running
render loop when the visitor is reading.

## Editing content

- `content/site.ts` owns the profile, education, experience, skills, and links.
- `content/projects.ts` owns projects, recognition, technology, and destinations.
- `content/story.ts` owns chapter headings and broadcast copy, references the
  original experience records, orders projects by awards and featured status,
  and derives the final box score from the resume and project data.
- `public/arena/models/` contains the three optimized runtime GLBs.
- `public/arena/textures/` contains the generated hardwood and environment.
- `assets/arena/manifest.json` records Higgsfield models, job IDs, result URLs,
  prompts, and optimization notes; `assets/arena/sources/` retains originals.
- `components/possession/generated-assets.ts` owns loading, model scale,
  calibrated rim anchors, and reversible skeleton posing.

The scoreboard’s points and clock are illustrative basketball storytelling;
the final box score contains the actual portfolio totals. Hackathon wins
count awards explicitly described as winners; placements remain visible on
their project cards.

## Verification

Run `npm run test:motion` to check possession changes, free-flight passes,
floor clearance, position/velocity and pose continuity at every action boundary,
camera turns, planted passing endpoints, and complete rewind determinism.

Production build and ESLint pass. Browser checks cover the overhead camera,
ball-follow movement, identical camera/ball coordinates after rewinding,
375px touch layout, project selection, theme persistence, reduced motion,
no-JavaScript content, and WebGL failure. Automated axe checks report no
violations for both themes and the project explorer. A mobile Lighthouse
run against the local production build measured performance 92,
accessibility 100, SEO 100, and zero layout shift. Live WebGL is loaded on
interaction, so the initial-load score measures the lightweight preview.
