# PostHog Easter Eggs — Deep Hunt Report

**Target:** `D:/Projects/portfolio/Research/posthog.com/src/`  
**Eggs found:** 23 confirmed  
**Hunt method:** grepped for `konami`, `keydown`, `localStorage`, `console.log`, `hidden`, `secret`, `easter`, `cheat`, cursor/audio/confetti triggers; read full App context, Layout context, all pages under `/pages/`, and standalone components

---

## 1. Hedgehog Mode

**Trigger:** `?hedgehog_mode=true` in URL, or toggle in Settings → Display Options, or `localStorage.setItem('hedgehog-mode-enabled', 'true')`  
**Effect:** The PostHog hedgehog mascot (Max) animates along all four edges of the page using the `@posthog/hedgehog-mode` npm package. Lazy-loaded on demand.  
**File:** `src/components/HedgehogMode/index.tsx:9,16`; `src/components/Layout/context.tsx:48`  
**Why on-brand:** Max is their mascot, fully part of brand identity. This puts him literally on every page.  
**Port difficulty:** Medium. Need a mascot asset and the walk-cycle animation logic. Use CSS sprite or Lottie. The PostHog package is open source — could be studied directly. Key mechanic: position the mascot element fixed at viewport edges, animate x/y based on which edge it's on.

---

## 2. April Fools Auto-Hedgehog

**Trigger:** Visiting the site on April 1st while Hedgehog Mode hasn't been explicitly set (no `localStorage` key present)  
**Effect:** Hedgehog Mode silently enables itself for the day  
**File:** `src/components/Layout/context.tsx:47-51`
```typescript
const isAprilFirst = today.getMonth() === 3 && today.getDate() === 1
if (isAprilFirst && typeof hedgehogModeLocalStorage !== 'string') {
    hedgehogModeLocalStorage = 'true'
}
```
**Why on-brand:** Calendar gags are classic developer humor. "You didn't enable this — the date did."  
**Port difficulty:** Trivial. One `new Date()` check in the app init. Great skeleton for world-specific seasonal triggers (e.g., winter in GoT world, harvest in Ghibli).

---

## 3. Enterprise Mode — `?synergy=true`

**Trigger:** Visit `posthog.com/?synergy=true`  
**Effect:** Injects `font-family: Verdana !important` onto the `<body>` via inline style. All text across the entire site switches to Verdana — a deliberate parody of corporate design debt.  
**File:** `src/components/Layout/context.tsx:165-166`; effect applied at line 155
**Why on-brand:** PostHog openly mocks "enterprise" culture. Verdana is the stereotypical "this was designed in 2003 by a committee" font.  
**Port difficulty:** Trivial. One `body.setAttribute('style', ...)` call. The joke only lands if the visitor is in on the anti-enterprise humor.

---

## 4. James Cursor

**Trigger:** `siteSettings.cursor` set to `"james"` (via Display Options in the OS taskbar menu)  
**Effect:** The default cursor and pointer cursor are replaced with photos of James Hawkins (PostHog co-founder). His face becomes your cursor.  
**File:** `src/context/App.tsx` — `updateCursor()` function; Cloudinary URLs: `james_cursor_default_d6f7983b0a.png`, `james_cursor_pointer_8bf0dd7a15.png`  
**Why on-brand:** Deeply personal and absurdist. PostHog ships transparency (literally, their CEO is the cursor).  
**Port difficulty:** Trivial. Set CSS custom properties `--cursor-default` and `--cursor-pointer` on `:root`. Any image works. For portfolio: my own face, a hedgehog, or a world-specific sprite.

---

## 5. XL Cursor

**Trigger:** `siteSettings.cursor` set to `"xl"` (via Display Options)  
**Effect:** Oversized SVG cursor via CSS custom property override — same `--cursor-default`/`--cursor-pointer` mechanism as James cursor  
**File:** `src/context/App.tsx` — `updateCursor()` function  
**Why on-brand:** Accessibility parody. "You wanted a bigger cursor? Here's a BIGGER cursor."  
**Port difficulty:** Trivial. One CSS url() swap.

---

## 6. DVD-Bounce Screensaver

**Trigger:** `Shift+Z` keyboard shortcut (global), or idle timeout via `useInactivityDetection` hook  
**Effect:** A Lottie animation (PostHog hedgehog loading animation) bounces around the screen exactly like the DVD logo screensaver. Uses `requestAnimationFrame` for velocity-based physics. Dismissed by any `mousemove`. Shows hint: "Visit display options to disable screensaver."  
**File:** `src/components/Screensaver/index.tsx`; hook at `src/hooks/useInactivityDetection.ts`  
**Why on-brand:** Pure nostalgia for the developer demographic. The Lottie file is `/lotties/loading.json`.  
**Port difficulty:** Medium. Bouncing physics is ~20 lines of `requestAnimationFrame` with velocity reflection at edges. The inactivity hook is fully reusable.

---

## 7. Smart Inactivity Detection (Screensaver skip)

**Trigger:** Screensaver would trigger but a video is currently playing in a visible window  
**Effect:** Screensaver is silently suppressed while any `<video>` is un-paused, or any YouTube iframe is visible  
**File:** `src/hooks/useInactivityDetection.ts:21-41`  
**Why on-brand:** Shows obsessive product polish — they thought about the exact use case where screensaver would interrupt a demo.  
**Port difficulty:** Low. The `checkVideosInView` function queries `video:not([paused])` and YouTube iframes. Drop this into any screensaver implementation.

---

## 8. Keyboard OS Shortcut Layer

**Trigger:** Global `keydown` listener, active on every page. Shortcuts include:
- `\` — cycle through all themes
- `|` — cycle through wallpapers  
- `Shift+Z` — trigger screensaver
- `Shift+M` — toggle OS mode vs website mode
- `Shift+X` — close all windows  
- Additional shortcuts for opening specific apps

**Effect:** Full OS-level keyboard navigation, non-discoverable without source-diving or a help modal  
**File:** `src/context/App.tsx:2060-2240`  
**Why on-brand:** They're a developer-focused product — keyboard power users are their exact audience.  
**Port difficulty:** Medium. Already have a keyboard shortcut system in the portfolio. The pattern to copy: a single central `keydown` handler in App context, not scattered per-component.

---

## 9. PostHog FM — TapePlayer

**Trigger:** Navigate to `/fm` (also accessible from the OS taskbar)  
**Effect:** Full cassette tape player UI:
- Physical cassette slides in with `framer-motion` (translateY 0%→-100%→0%)
- Click the cassette to flip it 180° (rotateY) and reveal the track list on notebook paper background
- YouTube IFrame API (`youtube-nocookie.com`) slides up behind the cassette
- Power switch plays `switch.mp3`; eject plays `insert.mp3`; rewind plays `rewind.mp3`
- Animated waveform: 60 bars with random heights
- "Dance Mode" button opens a separate window cycling through 7 Giphy GIFs every 5 seconds

**File:** `src/components/TapePlayer/index.tsx`; sounds at `static/sounds/`  
**Why on-brand:** Audio + music is an extremely "human" touch for a B2B SaaS. The cassette format is maximally retro for a modern data tool.  
**Port difficulty:** High for full fidelity, but the individual pieces (CSS flip, slide-in animation, Web Audio) are each independently portable. The cassette flip is a CSS `perspective + rotateY(180deg)` trick.

---

## 10. Dance Mode

**Trigger:** Click "Dance Mode" button inside TapePlayer (`/fm`)  
**Effect:** Separate OS window opens showing cycling Giphy dance GIFs. Preloads the next GIF as `new Image()` before display. Window title: "Dance Mode - ♫ PostHog FM"  
**File:** `src/components/DanceMode.tsx`; `AUTOPLAY_DELAY_MS = 5000`  
**Why on-brand:** "Maximum fun" as a product value. Also a viral moment when screenshotted.  
**Port difficulty:** Low. A `setInterval` on an array of GIF URLs with preloading. Swap in world-appropriate GIFs (Totoro dancing, Elden Ring roll spam, etc.)

---

## 11. Confetti Explosions

**Trigger:** Four distinct user accomplishments:
1. Joining a waitlist (`src/components/WaitlistForm/index.tsx:23`)
2. Applying for a job (`src/components/Job/Apply.tsx:260`)
3. Redeeming a points reward (`src/components/Points/RewardCard.tsx:155`)
4. Submitting the sales contact form (`src/components/SalesforceForm/index.tsx:396`)

**Effect:** `ReactConfetti` fires 1000 pieces of confetti across the viewport  
**File:** `src/context/App.tsx` — `confetti` state; component reads `useApp().confetti`  
**Why on-brand:** Treats boring form submissions as celebrations. Emotional design that makes people screenshot and share.  
**Port difficulty:** Trivial. `npm install react-confetti`. Call `setConfetti(true)` and auto-reset after 3 seconds.

---

## 12. Theo Mode

**Trigger:** Click the Theo icon in the blog post reading menu (nav display options)  
**Effect:** Hides the entire site header, footer, cookie banner, nav, and sidebar — leaves only the article content. A small floating toggle in top-right lets you exit. Shows Theo's photo with tooltip: "Theo - t3.gg once complained our blog had too many things on it for making screen recordings. So here's to you, Theo. Film away."  
**File:** `src/components/Layout/context.tsx:59`; toggle UI at `src/components/MainNav/index.tsx:682`; conditional renders at `src/components/Layout/index.tsx:54,58,65`  
**Why on-brand:** They responded to a real developer's real complaint by adding a named mode honoring them. Community responsiveness as a feature.  
**Port difficulty:** Low. One boolean in context that conditionally renders shell chrome. The "named after someone" framing is the design insight.

---

## 13. Cher Hedgehog-Generator Window

**Trigger:** Accessible via OS app system (app window config in App context)  
**Effect:** Opens a custom window for generating hedgehog avatars, powered by a Cher-themed UI (posthog's AI feature). Renders via `createPortal` into the OS window layer.  
**File:** `src/context/App.tsx:912` (Cher window config), line 1064 (hedgehog-generator config)  
**Why on-brand:** Their AI assistant is named Cher. The hedgehog avatar generator is a "fun" use of their own AI product, dog-fooded on the marketing site.  
**Port difficulty:** Medium. Requires an image generation API. The OS window portal pattern is already in the portfolio.

---

## 14. Random Founder Audio Clips

**Trigger:** Click anywhere on the Founder Note section on the Careers page  
**Effect:** One of 10 MP3 files plays — recordings of James Hawkins (co-founder) speaking. Clips are named `quote-1.mp3` through `quote-10.mp3`. Randomized via `Math.random()`.  
**File:** `src/components/Careers/FounderNote/index.tsx` — `playRandomJamesAudio()` function; `audioRef` with `audio.play()`  
**Why on-brand:** It's literally the founder speaking to candidates. Scales "personal touch" without requiring James to record 10,000 individual calls.  
**Port difficulty:** Low once audio files exist. The `new Audio(src).play()` pattern is 5 lines. For portfolio: clicking certain "about me" sections could play audio from me.

---

## 15. DPA Reading Modes — "DPAYAY"

**Trigger:** Navigate to `/dpa` and switch the reading mode toggle  
**Effect:** The legal Data Processing Agreement is rendered in 5 distinct modes:
- `pretty` — legal doc with colorful design flourishes
- `lawyer` — Times New Roman, full formalism
- `fairytale` — ELI5 narrative ("Once upon a time, a developer needed data...")
- `tswift` — Taylor Swift sing-along format ("From the vault: Your data is fine")
- `genz` — "bestie energy" casual voice ("ok so like, here's the tea on your data bestie")

**File:** `src/pages/dpa.tsx`  
**Why on-brand:** They hate corporate jargon. Making the DPA readable (and funny) is a direct product value expression.  
**Port difficulty:** Medium. The "same content, multiple personalities" pattern is the key insight — not the specific voices. Content transformation via mode switch.

---

## 16. Trash Page — Self-Referential Archive

**Trigger:** Navigate to `/trash` (accessible from OS desktop)  
**Effect:** Shows an OS-style Trash folder with two sections:
- "Recently deleted": `employee feet pics`, `spicy.mov`, `quick calls script.txt`, `Copy of whitepaper (2) - final FINAL.docx.pdf`
- "Archive (cannot be recovered)": `GA3`, `Synergy Framework.canvas`, `PIP.doc`, **`website easter eggs.md`** (url: `undefined` — intentionally unclickable, a meta-joke that this file can't be recovered), `[GATEKEEP] state of the industry report.pdf`, `ai slop.tsx`

**File:** `src/pages/trash/index.tsx:60-142`  
**Why on-brand:** Dark humor about corporate detritus. "GA3" in the archive-cannot-be-recovered section is a direct jab at Google Analytics. "website easter eggs.md" being unrecoverable is a wink at the person hunting for exactly this.  
**Port difficulty:** Trivial. Static data rendered with the OS `Explorer` component. The joke is the content curation, not the code.

---

## 17. Photo Booth

**Trigger:** Navigate to `/photobooth` (accessible from OS taskbar menu)  
**Effect:** Full webcam photo booth. Takes 4 photos with a countdown timer. Applies one of 4 PostHog-branded templates (frames/overlays). Creates a downloadable photo strip and a business card format. Uses `react-webcam` + `html-to-image`.  
**File:** `src/pages/photobooth.tsx`; icon at `src/components/OSIcons/AppIcon.tsx:66`  
**Why on-brand:** Conference/event marketing — they set this up at booths so attendees could make personalized PostHog merch/cards.  
**Port difficulty:** Medium. `react-webcam` handles the hard part. The template overlay is just absolutely-positioned elements over the canvas. `html-to-image` for download.

---

## 18. Coloring Book PDF

**Trigger:** Navigate to `/coloring-book.pdf`  
**Effect:** Renders a printable PostHog hedgehog coloring book as a Cloudinary PDF iframe. Print CSS hides all OS chrome and makes the PDF fill the full printed page. Title shown as "Coloring book.pdf" in the OS explorer.  
**File:** `src/components/ColoringBook/index.js`  
**Why on-brand:** Absurdly wholesome. Nobody expects a data analytics company to have a coloring book. Shareable, printable, tactile.  
**Port difficulty:** Trivial. Iframe + print CSS. The unique element is having the actual illustrated PDF.

---

## 19. IsGoogleAnalyticsIllegal.com Microsite Reference

**Trigger:** Visible on the Careers page "Fun Stuff" section  
**Effect:** Links to `isgoogleanalyticsillegal.com` — a real microsite they spun up when EU courts started finding Google Analytics in violation of GDPR. Also referenced in the main navigation display options panel.  
**File:** `src/components/Careers/FunStuff/index.tsx:38-44`  
**Why on-brand:** Aggressive competitive positioning as entertainment. Converts a legal news story into a lead-generation page.  
**Port difficulty:** N/A for the microsite. The design pattern: turn competitor's bad news into your homepage moment.

---

## 20. Taylor Swift DPA Edition

**Trigger:** Select `tswift` reading mode on the `/dpa` page  
**Effect:** The entire Data Processing Agreement is rewritten as Taylor Swift song lyrics. Referenced explicitly in the "Fun Stuff" section on the Careers page as something PostHog actually shipped.  
**File:** `src/pages/dpa.tsx` (tswift mode); reference in `src/components/Careers/FunStuff/index.tsx`  
**Why on-brand:** Legal content that goes viral. The Careers page uses this as a recruiting signal: "this is the team you'd work on."  
**Port difficulty:** Content work, not code. The mode-switch pattern (egg #15) covers the technical side.

---

## 21. Wallpaper Cycle Shortcut

**Trigger:** `|` key (pipe, `Shift+\`) anywhere on the site while the OS shell is active  
**Effect:** Cycles through all available wallpapers, applied via `data-wallpaper` attribute on `<body>`. Wallpapers are defined in the site settings system.  
**File:** `src/context/App.tsx:2060-2240` (keyboard handler section)  
**Why on-brand:** Desktop OS metaphor taken to its logical conclusion. Power-user discoverable.  
**Port difficulty:** Trivial in the portfolio — wallpaper cycling is already implemented. Add `|` as the hotkey.

---

## 22. Theme Cycle Shortcut

**Trigger:** `\` key anywhere on the site  
**Effect:** Cycles through all available themes. Theme is stored in `siteSettings` in `localStorage` under the key `siteSettings`.  
**File:** `src/context/App.tsx:2060-2240`  
**Why on-brand:** Same desktop-OS commitment. Discovering `\` cycles themes is a "wait, what?" moment.  
**Port difficulty:** Trivial. Add `\` to the existing keyboard handler in portfolio App context.

---

## 23. "Skin Mode" Classic vs Modern

**Trigger:** Display Options → Skin toggle  
**Effect:** Sets `data-skin="classic"` or `data-skin="modern"` on `<body>`. CSS selectors target `[data-skin="classic"]` to switch the icon set, font stack, and UI chrome to a Windows 98-era aesthetic.  
**File:** `src/context/App.tsx:2268-2269`  
**Why on-brand:** Nostalgia. Many PostHog users were writing PHP in 2003. Classic mode is an acknowledgment of where the web came from.  
**Port difficulty:** Low. Swap the `data-skin` attribute and point CSS variables to the alternate design tokens.

---

## Honorable Mention: robots.txt

`User-agent: Googlebot / Disallow: /*.md$` — they block markdown files from crawlers. No joke embedded, but it does mean the raw content files (including `.md` easter egg documents) are intentionally de-indexed.  
**File:** `static/robots.txt`

---

## Honorable Mention: Trash Self-Reference

The `website easter eggs.md` file in the Archive (cannot be recovered) section of `/trash` has `url: undefined`. It's the one item in the Trash that cannot be clicked — a deliberate meta-gag for whoever hunts through the Trash looking for easter eggs. The file documenting the easter eggs cannot be recovered.  
This is the sharpest easter egg in the whole site.

---

# Easter Egg Design Patterns for Our Portfolio

These are the patterns worth abstracting — framed for the explorable-worlds context (Ghibli default, Elden Ring, GoT) and the Desktop OS metaphor.

---

## Pattern 1: Calendar-Gated World Events

**What PostHog did:** Auto-enabled Hedgehog Mode on April 1st.  
**Abstracted:** Worlds respond to real-world date/time. On a specific date, the world shifts — cherry blossoms in Ghibli on a spring equinox, a Blood Moon in Elden Ring on Halloween, a Feast of Westeros on December 25th. The visitor didn't trigger it; they just arrived at the right moment.  
**Implementation sketch:** `new Date()` check in world init. Apply a temporary world overlay (CSS class or context flag) that auto-reverts after the day. Store `lastSeenDate` in `localStorage` so it only triggers once per day per visitor.  
**Why it fits the portfolio:** Novel authors love seasonal world-building. Demonstrates "the world is alive" — not just reactive to the user, but to time itself.

---

## Pattern 2: Persona-Named Modes

**What PostHog did:** Theo Mode, James Cursor — named after real people with real stories attached.  
**Abstracted:** A mode that's "for someone specific" — even if that person is fictional or personal. The mode has a name, a face, and a one-sentence story explaining why it exists. In the portfolio: a "Narrator Mode" for reading the site as a novel, or a "Cartographer Mode" (Ghibli world) that renders the desktop as a hand-drawn map with annotations.  
**Implementation sketch:** One boolean in context, one CSS class on body, one tooltip that tells the story. The name is the hardest part — it must feel personal, not generic.  
**Why it fits the portfolio:** Novelist instinct. Names and stories make features feel inhabited. "Dark Mode" is a feature; "Nachtmahr Mode" is a character.

---

## Pattern 3: Accomplishment Confetti

**What PostHog did:** Confetti on form submissions — treating a contact form like an achievement.  
**Abstracted:** Every meaningful user action in the OS shell deserves a micro-celebration. Completing the "About" app tour in Ghibli world drops cherry blossom petals. Finishing the GoT lore quiz plays a fanfare. Closing all windows triggers a brief screen clear with a "Rest Site Reached" message.  
**Implementation sketch:** Central `celebration` state in App context. World-specific confetti particles (petals, runes, ravens) instead of generic confetti. Triggered from anywhere via `useCelebration()` hook.  
**Why it fits the portfolio:** Makes the portfolio feel like it *notices you* — not just a static display.

---

## Pattern 4: URL-Param Mode Gates

**What PostHog did:** `?hedgehog_mode=true`, `?synergy=true` — entire mode changes from a URL param.  
**Abstracted:** Share-able world modifiers. `?lore=true` activates a tooltip overlay on every element explaining its in-world backstory. `?night=true` forces nighttime in Ghibli regardless of system clock. These can be sent as easter egg hints: "have you tried /?lore=true".  
**Implementation sketch:** Read `URLSearchParams` in App init. Apply overrides before rendering. Store in session storage if the mode should persist the session.  
**Why it fits the portfolio:** URL params are shareable — they become the easter egg delivery mechanism. "Here, open this link" is more discoverable than "press a key nobody would guess."

---

## Pattern 5: Sound-Effect-Layered Interactions

**What PostHog did:** Four distinct sound effects for the cassette player (insert, eject, rewind, click). Physical metaphor reinforced with audio.  
**Abstracted:** World-appropriate sounds for OS interactions. Opening an app window in Ghibli plays a soft bamboo chime. Opening a window in Elden Ring plays a dungeon door creak. The GoT Taskbar notification plays a raven call. These are 100ms clips — not music, just haptic-equivalent audio.  
**Implementation sketch:** `new Audio(src).play()` in event handlers. Preload all world sounds on world init. Tie to the existing world/theme system so sounds swap when the world swaps. Respect `prefers-reduced-motion` (and add a `prefers-reduced-sound` localStorage toggle in Settings).  
**Why it fits the portfolio:** Novelist instinct: atmosphere. The same screen *sounds different* in each world.

---

## Pattern 6: The Self-Referential Joke

**What PostHog did:** `website easter eggs.md` in the Trash with `url: undefined` — the easter egg list is itself an easter egg that cannot be found.  
**Abstracted:** The portfolio can have a "meta" layer. A hidden `README.txt` file in the OS Desktop (not linked anywhere) that contains the list of all easter eggs — but is itself partially corrupted. Or a `FOUND: 3/11 eggs` counter somewhere in the OS system tray that increments as the user discovers things.  
**Implementation sketch:** Track discovered states in `localStorage` as a set of egg IDs. Show a subtle counter in the system tray status line. The README.txt "file" on the desktop is unlinked — found only by using the File Manager's search function.  
**Why it fits the portfolio:** This is the novelist trick: make the world feel bigger by implying there's more than is shown. The counter saying `3/11` makes visitors search for the remaining 8.

---

## Pattern 7: Inactivity → World Atmospheric Response

**What PostHog did:** DVD-bounce screensaver on idle, with smart suppression when video is playing.  
**Abstracted:** Each world has an idle state. Ghibli: Totoro and friends walk across the desktop after 2 minutes of no interaction. Elden Ring: a Great Rune shatters the screen with "YOU DIED" after 5 minutes. GoT: ravens fly across the desktop carrying unread messages.  
**Implementation sketch:** The `useInactivityDetection` hook from PostHog is directly portable — the `checkVideosInView` smart-skip should be replicated exactly. The screensaver "content" is the only world-specific part.  
**Why it fits the portfolio:** Signals that the portfolio is a *space* you inhabit, not a PDF you read.

---

## Pattern 8: Competitive Humor as Navigation Destination

**What PostHog did:** `/dpa` page with Taylor Swift edition, and linked to `IsGoogleAnalyticsIllegal.com` — turning legal/competitive content into entertainment.  
**Abstracted:** The portfolio's `/404` page, `/trash`, and `/about` pages can do this. The 404 page in the Elden Ring world: "Page Not Found — [Area Not Discovered]". The Trash page in GoT world: contains "Joffrey's resume.docx" and "The Red Wedding RSVP list.xlsx" — unrecoverable.  
**Implementation sketch:** World-aware page components. The page shell is the same; the content data array changes per world. Already partially done with the Worlds system. The trash page's static `trashData` object becomes a world-keyed lookup.  
**Why it fits the portfolio:** This is exactly the novelist pattern — the same world event (a deleted file) feels completely different based on which story you're in.

---

## Pattern 9: Physical UI Metaphor with Audio+Motion

**What PostHog did:** The cassette tape that physically slides in, flips 180° to show the tracklist, and plays sounds on every physical interaction.  
**Abstracted:** The portfolio's File Manager opening animation, the Window drag-and-drop, and the World switcher all have room for this. When switching worlds, the screen doesn't just fade — it tears like a page, or shatters, or burns at the edges, with an appropriate sound. The transition duration: 600-800ms.  
**Implementation sketch:** `framer-motion` `AnimatePresence` with world-specific exit/enter variants. Sound files: `page_turn.mp3`, `shatter.mp3`, `fire_crackle.mp3` — each 300-600ms. The technical cost is low; the perceptual impact is high.  
**Why it fits the portfolio:** This is the difference between a website and a world. Worlds have physics.

---

## Pattern 10: Named-Person Cursor as Identity Statement

**What PostHog did:** James Cursor — the co-founder's actual photo as the cursor on a B2B SaaS marketing site.  
**Abstracted:** A hidden cursor option in the OS settings. In the portfolio, a "Manish cursor" that's an actual photo (absurdist self-reference), or a world-specific cursor: a quill in Ghibli world, a Great Rune fragment in Elden Ring, a Lannister sigil in GoT. The cursor IS the world's native tool.  
**Implementation sketch:** CSS custom property `--cursor-default: url('/cursors/quill.png') 4 32, auto`. Swap in `updateCursor()` when world changes. Size: 32×32px or 64×64px for statement cursors.  
**Why it fits the portfolio:** Every click in the GoT world is made with a Lannister sigil. The mechanical act of navigation becomes narration.
