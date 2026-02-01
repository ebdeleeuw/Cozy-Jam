# 🎹 Cozy Jam - UI/UX Style Guide

Welcome to the **Cozy Jam** design system. This project aims to feel like a "warm digital artifact"—a friendly, soft, and inviting space for collaborative music. 

Please follow these guidelines when making changes to the UI to maintain the application's unique vibe.

---

## 1. Core Philosophy

*   **Soft over Sharp**: Avoid sharp corners (`rounded-none` or `rounded-sm`). Use `rounded-2xl` or `rounded-full` everywhere.
*   **Warm over Cold**: Use warm greys (Stone) instead of cool greys (Slate/Gray). Backgrounds should never be pure white `#FFFFFF` unless it's a card on top of a cream background.
*   **Playful over Professional**: The interface should feel like a toy. Buttons should bounce (`active:scale-95`), elements should breathe (`animate-breathe`), and feedback should be joyous.
*   **Tactile**: Use subtle borders (`border-stone-100`) and soft shadows to give depth without heaviness.

---

## 2. Color Palette

We use a custom Tailwind configuration defined in `index.html`.

### Primary Colors
*   **Canvas**: `bg-cozy-cream` (`#FDFBF7`) - The main background color. Like fancy paper.
*   **Ink**: `text-cozy-dark` (`#4A403A`) - The primary text color. A deep, warm brown/charcoal. NEVER use pure black (`#000000`).

### Accent Pastels (The "Jam" Flavors)
Used for avatars, backgrounds blobs, and subtle highlights.
*   🌸 **Rose**: `bg-rose-200` / `text-rose-500` (Love, Recording)
*   ☁️ **Sky**: `bg-cozy-blue` (`#D0E1F4`) / `bg-sky-200` (Chill, Synth)
*   🌿 **Mint**: `bg-cozy-green` (`#D9EAD3`) / `text-emerald-600` (Success, MIDI Ready)
*   ☀️ **Sun**: `bg-cozy-yellow` (`#F9E4B7`) / `bg-amber-100` (Energy, Waiting)

### Neutrals
*   **Stone**: `stone-50` to `stone-900`. Use `stone-400` for subtitles/inactive icons to keep them warm.

---

## 3. Typography

**Font Family**: `Nunito` (imported via Google Fonts).
*   This is a "rounded" sans-serif that inherently feels friendly.

**Usage**:
*   **Headings**: `font-extrabold` or `font-bold`. Tracking should be tight (`tracking-tight`) for large text.
*   **Body**: `font-semibold` is often preferred over `font-normal` to maintain legibility against the textured background.
*   **Labels**: Uppercase labels should use `tracking-widest` and `text-xs`.

---

## 4. UI Elements & Components

### Buttons
*   **Shape**: Always `rounded-full` or `rounded-2xl`.
*   **Interaction**: 
    *   Hover: `hover:-translate-y-1` (Lift effect).
    *   Active: `active:scale-95` (Press effect).
*   **Shadows**: `shadow-lg` for primary actions, `shadow-sm` for secondary.

### Cards / Panels
*   **Background**: `bg-white` or `bg-white/90` with `backdrop-blur-md` for floating elements.
*   **Borders**: Delicate. `border border-stone-100`.
*   **Shadows**: Soft and diffuse. `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.

### Visualizers
*   Avoid hard technical graphs.
*   Use concentric circles, pulses, and soft blurs (`blur-3xl`).
*   Animations should be slow (`duration-700`, `duration-1000`) and organic.

### Texture
*   The app uses a global SVG noise overlay (`bg-grain`) at `opacity-5`.
*   **Do not remove this.** It provides the "paper/analog" feel that prevents the app from looking too "SaaS-like".

---

## 5. Iconography

*   **Library**: `lucide-react`.
*   **Style**: Stroke width is generally standard (2px).
*   **Color**: Icons often pair with text. If standalone, give them a container with a subtle background (`bg-stone-50`).

---

## 6. Motion & Animation

Animations are crucial for the "Cozy" feel.

*   **Entrance**: `animate-fade-in-up` or `animate-slide-down`.
*   **Idle**: `animate-breathe` (slow scaling) makes the app feel alive even when inactive.
*   **Feedback**: `animate-bounce` for joyous events (playing), `animate-pulse` for recording/waiting.
*   **Speed**: Keep transitions distinct. 
    *   Micro-interactions: `duration-200` or `duration-300`.
    *   Ambient loops: `4s` to `10s`.

---

## 7. Code Conventions (React/Tailwind)

*   **Functional Components**: Use `React.FC`.
*   **Tailwind Classes**: Group layout (`flex`, `grid`) first, then spacing (`p-4`, `m-2`), then visual (`bg-`, `rounded-`).
*   **Z-Index Management**:
    *   `z-0`: Background Grain.
    *   `z-10`: Main content (Visualizer).
    *   `z-20`: Controls.
    *   `z-30`: Floating Particles (ReactionZone).
    *   `z-40`: Header (Pointer events logic required).
    *   `z-50`: Modals / Queue Display.

---

> "If it feels like a spreadsheet, add more rounded corners and slower animations." 
