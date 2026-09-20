# Static Pages — Project Context

This repository contains standalone interactive learning pages for Susie. Codex and other coding agents must read and follow this file before creating or changing a page.

## Product and audience

- Primary learner: Susie, a 4–5-year-old Chinese child learning English.
- Primary experience: playful, short, touch-friendly learning activities that can be used with a parent.
- Visible guidance may be bilingual: concise Chinese instructions plus the English words and sentences being learned.
- Avoid long explanations, dense screens, competitive pressure, timers, punishment, or negative scoring.

## Repository structure

- Keep one complete webpage in each root-level folder.
- Use short English folder names, for example: `shapes/`, `colors/`, `animals/`.
- A simple page should remain dependency-free and contain:
  - `index.html`
  - `styles.css`
  - `app.js`
- Each folder should be independently runnable by opening its `index.html`.
- `shapes/` is the canonical visual and interaction reference for all future pages.

## Required visual direction

All learning pages must feel like chapters from the same cheerful picture book, not unrelated templates.

### Design tokens

Use these core colors unless the lesson genuinely needs an additional semantic color:

```css
:root {
  --ink: #40384e;
  --muted: #746d7c;
  --cream: #fff8e8;
  --paper: #fffdf8;
  --coral: #ff6b81;
  --coral-dark: #e94e68;
  --mint: #51c6b7;
  --yellow: #ffd74b;
  --blue: #6fbde7;
  --purple: #a78bd4;
  --shadow: 0 16px 42px rgba(72, 61, 86, .12);
}
```

### Typography and components

- Use the rounded font stack from `shapes/styles.css`:
  `ui-rounded, "Nunito", "Arial Rounded MT Bold", system-ui, sans-serif`.
- Use a warm cream background, white/paper cards, dark purple text, and bright coral primary actions.
- Cards and controls should have large rounded corners, soft shadows, thick friendly borders, and a slightly tactile button press effect.
- Keep headings bold, rounded, and expressive; body text must stay highly readable.
- Decorative stars, dots, diamonds, hearts, and other simple lesson-related accents may appear lightly in the background.
- Preserve generous whitespace. Do not turn pages into dashboards or generic component grids.
- Reuse the `Susie's English` brand treatment from the shapes page.

## Poppy mascot — must stay consistent

- Poppy is the recurring rabbit guide and the recognizable character across every page.
- Reuse the exact Poppy inline SVG from `shapes/index.html` whenever the full mascot is shown.
- Do not replace Poppy with an emoji, stock illustration, a different rabbit, or a newly generated character.
- Do not change Poppy's face, proportions, colors, clothing, or drawing style.
- Lesson-specific text in the speech bubble may change.
- Small lesson props may be added around Poppy only when they do not alter or cover the original character.
- The mascot should welcome Susie, demonstrate the task, celebrate progress, or appear on the completion screen—not merely decorate empty space.

## Interaction language

- Open directly on a playful lesson start screen; do not add a marketing landing page.
- Present one clear action at a time.
- Use large touch targets suitable for a child on iPhone or iPad.
- Give immediate, gentle feedback:
  - correct: cheerful animation, short praise, chime, and optional star;
  - incorrect: invite another try without losing progress.
- Prefer progressive reveal. Do not display or read a long list all at once when words can appear one by one.
- Keep activities short and show simple progress.
- Use the existing star counter pattern when the lesson includes scored activities.
- End with a cheerful completion screen featuring Poppy and a replay action.

## Voice and sound

- English pronunciation must use the natural-voice selection logic from `shapes/app.js`.
- Prefer high-quality English voices such as Microsoft Aria Online, Google US English, Ava, Samantha, Jenny, Allison, or another enhanced/premium/natural voice available on the device.
- Use a natural pitch of `1`.
- Keep the normal speaking rate around `0.74`; isolated phonics words may use approximately `0.68`.
- Do not read several vocabulary words in one rushed utterance. Reveal and pronounce them individually.
- Cancel the previous utterance before starting a new one so repeated taps do not create overlapping speech.
- Sound effects should be soft and brief and must never overpower pronunciation.

## Responsive and accessibility requirements

- Support phone, iPad/tablet, and desktop layouts.
- Avoid horizontal scrolling, clipped text, and tiny controls.
- Main body text should generally be at least 16px.
- Provide visible keyboard focus states and useful `aria-label` text.
- Use `aria-live` for answer feedback and progressively revealed learning content.
- Respect `prefers-reduced-motion`.
- Preserve semantic buttons and headings; do not make clickable `div` elements.

## Engineering rules

- Keep each page simple, readable, and easy to host as static files.
- Do not add a framework, build system, dependency, backend, login, analytics, or data collection unless explicitly requested.
- Store only non-sensitive, device-local progress in `localStorage`.
- Before delivery, verify JavaScript syntax, local asset paths, mobile layout, touch interactions, replay/reset behavior, and pronunciation controls.
- When local and cloud development happen in parallel, use separate branches and merge through review. Do not let both environments directly overwrite `main`.

## Definition of done for a new page

A page is complete only when it:

1. follows the shapes page's design system;
2. includes the same Poppy mascot;
3. teaches the requested material through working interactions;
4. works on phone, tablet, and desktop;
5. uses natural, child-friendly pronunciation;
6. provides gentle feedback, progress, completion, and replay;
7. can run independently from its own folder; and
8. is committed to the repository without breaking existing pages.
