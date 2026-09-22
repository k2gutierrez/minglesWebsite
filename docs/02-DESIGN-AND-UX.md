# Visual and interaction system

## Direction

A dark, graphic agave brand with an operational Web3 layer. The user explicitly requested black backgrounds and stronger motion after reviewing the first preview; that direction supersedes the brief’s ivory-first public layout. The oversized type gives the brand confidence; coral signals action; quiet rules, mono labels, and honest status chips organize the build. The hero uses the supplied official logo, not an invented Mingle or bottle. Build cards are structured as index → visual → title/description → status/action, making each engine easier to scan.

| Token        | Value     | Use                                              |
| ------------ | --------- | ------------------------------------------------ |
| Mingle Coral | `#E15162` | Brand moments, state accents, primary highlights |
| Warm Ivory   | `#EDEDD9` | Public foundation                                |
| Near Black   | `#1D1D1D` | Text, structure, holder surfaces                 |
| White        | `#FFFFFF` | Reserved neutral                                 |

Black (#111112) is the primary background, with #19191B/#242426 card surfaces and very subtle tinted graphic fields. No fake progress meters. The 100% Mingles Spirit stamp is a brand phrase, not a tequila composition/ABV claim.

## Typography

The brief locks **Hogfish** for short expressive display and **GT Pressura Mono** for interface/body. These files and licenses are absent. The preview uses self-hosted **Barlow Condensed** and **IBM Plex Mono**, bundled from Fontsource. They are visibly a substitute, not represented as the official fonts.

When licensed WOFF2 files arrive, add `public/fonts/`, define local `@font-face` rules with `font-display: swap`, and replace `--display` and `--mono`. Retest all headline wrapping. Do not stretch/crop supplied character art to fill text-shaped spaces.

## Layout

Public: 4.5–6% horizontal gutters, generous 55–80px section padding, split hero, 2-column feature sections, 4-to-2 column build cards. Portal: dark foundation, sidebar on desktop, horizontally scrolling tab navigation on mobile. Admin: labeled inputs, distinct draft/publish actions, no raw JSON authoring.

Breakpoints: 1100px, 800px, 500px. The 800px breakpoint collapses navigation and hero; 500px stacks most cards. The layout is designed for 360px through large desktop widths.

## Motion contract

- Hero: noticeable spring-driven 3D mouse parallax of the official logo card, a rotating canvas particle network, orbit rings, rotating symbols, and floating labels; reset tilt on pointer leave; mouse-only pointer input.
- Brand ribbon: slow CSS loop, decorative and hidden from assistive technology.
- Section reveal: 44px vertical reveal with opacity as sections enter view, plus a masked page entrance.
- Art eras: tab-controlled panel transition; ArrowLeft/ArrowRight navigation.
- Cards/CTAs: 3D hover tilt, lifted surfaces, line-art graphic response, and deliberate color changes. Desktop gets a spring-following cursor ring/crosshair; it disappears on touch/reduced motion.
- Reduced motion: MotionConfig honors OS preference; CSS stops ribbon/animations/transitions and smooth scrolling. No motion-dependent information.
- No scroll-jacking, wallet prompts on entry, background video download, or heavy WebGL dependency.

Motion for React provides the spring/reveal layer. CSS handles predictable interactions. Rive/GSAP/Three.js are intentionally not installed because no authored assets or necessary 3D interaction were supplied.

## Key flows

1. Visitor → hero → Building Now → Tequila/Art/Experiments → dated proof.
2. Art visitor → era tabs → approved gallery later → relevant reveal update.
3. Holder → account sign-in → verified collection later → honest Protocol readiness.
4. Editor → draft → preview → publish → public route → restore earlier version when needed.
5. Game visitor → clear current status → published rules/costs → verified PVG destination when available.

## Asset preparation

| Asset                | Suggested ratio | Delivery                                               |
| -------------------- | --------------- | ------------------------------------------------------ |
| Hero character/media | 1:1 or 4:5      | Approved transparent PNG/WebP; no invented replacement |
| Bottle feature       | 4:5             | Real photo, consistent light, approved color           |
| Experiment card      | 16:10           | Actual title treatment or game screenshot              |
| Story/update media   | 3:2 or 16:9     | Date, location, rights/credit, descriptive alt         |
| Token lineage        | 1:1 per era     | token ID + chain + contract + era + release state      |
| Video                | 16:9 or 4:5     | Compressed MP4/WebM, poster, captions/transcript       |

Current uploads are limited to PNG/JPEG/WebP, 2 MB each. Add responsive sizes, `next/image`, explicit dimensions, and configured Storage domains when actual production media is available. Video requires the follow-on workflow in the Supabase guide.

## Accessibility

Keep a visible keyboard focus outline, skip link, semantic headings, text-based status, descriptive field labels, and `aria-current` navigation. Never use color alone for state. Coral text on ivory is reserved for large display; small body copy uses near-black. Test zoom at 200%, 360px width, keyboard-only operation, and screen readers before launch.
