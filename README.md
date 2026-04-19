# The Witcher DB (Static Website)

A multi-page, static reference site for *The Witcher* universe covering books, games, Netflix and animation, characters, schools, bestiary, timeline, galleries, and a contact-style feedback flow built with plain **HTML/CSS/JavaScript** (no framework, no build step).

## Demo / Preview

- **Entry point**: open `home.html`, or `/` when hosted (see **Deploy**).
- **Recommended**: run a local static server (see **Run locally**) so navigation, embeds, and assets behave consistently.

## Features

- **Multi-page navigation**: full-width pill bar on wider viewports; on small screens (≤768px), a **hamburger** opens a **right-side sliding drawer** for links.
- **Characters**: card grid with a **Game vs Netflix portrait compare slider** (`initCharacterPortraitSliders()` in `js/main.js`).
- **Books**: searchable table (filters rows as you type).
- **Bestiary**: searchable creature cards + **category chips** + live **category counts**. Chips share the same active-state helper as the characters page (`updateChipActiveState()`).
- **Games**: one page per mainline title, cover, synopsis, platforms, trailers where applicable with the same image **lightbox** pattern as the gallery.
- **Series**: tabbed sections for the Netflix series, *Nightmare of the Wolf*, and *Sirens of the Deep* | poster grid opens the shared lightbox.
- **Gallery & Gwent**: poster/card art opens the **lightbox** (one implementation, many pages).
- **Schools**: tab UI for the schools + comparison table row highlight (`switchSchool()` uses the shared `switchTabPanel()` helper).
- **Timeline**: vertical timeline layout of major events.
- **Feedback**: modal on **Home** only (trigger: “Send feedback”), with client-side validation and success/reset behaviour (`initFeedbackModal()` in `js/main.js`). There is no separate `feedback.html`.
- **Back-to-top** on pages that include the button (smooth scroll).

## Pages

| File | Description |
|------|-------------|
| `home.html` | Landing page, featured content, YouTube embed, feedback modal |
| `characters.html` | Major characters + portrait comparison slider |
| `games.html` | Main Witcher games — entries, covers, trailers |
| `gwent.html` | Gwent overview + factions + lightbox images |
| `series.html` | On-screen Witcher: Netflix, anime, and related tabs + poster lightbox |
| `timeline.html` | Timeline of major events |
| `books.html` | Reading-order table + live search |
| `schools.html` | Witcher schools tabbed panels + comparison table |
| `bestiary.html` | Bestiary catalog + chip filters + live search |
| `gallery.html` | Screenshot gallery + lightbox |

## Tech stack

- **HTML5** (semantic structure, ARIA where it matters for nav, tabs, modals)
- **CSS3**: single shared stylesheet [`css/style.css`](css/style.css) (glassy nav, cards, grids)
- **Vanilla JS**: `js/main.js` — page initializers, shared helpers (`closeNavMenu`, `updateChipActiveState`, `switchTabPanel`), and a single lightbox setup driven by a config list
- **Fonts**: Google Fonts (`Cinzel`, `Lora`)

## Project structure

```text
witcher-db/
├── README.md
├── vercel.json
├── home.html
├── characters.html
├── games.html
├── gwent.html
├── series.html
├── timeline.html
├── books.html
├── schools.html
├── bestiary.html
├── gallery.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    ├── backgrounds/   
    ├── characters/    
    └── …              
```

### About images / assets

HTML points at paths such as `images/favicon.webp`, character art under `images/characters/`, gallery shots, and per-page backgrounds. **Add the files** under `witcher-db/images/` (or change the HTML) so icons and media resolve. The `images/backgrounds/` folder includes a short readme for series background assets.

## Deploy (Vercel)

`vercel.json` rewrites `/` to `home.html`. Image paths in the markup expect a populated `images/` tree; if that folder is empty or incomplete, you will see broken images until you add assets or update paths.

## Run locally

### Option A: Open directly (quickest)

Double-click `home.html` in your browser.

> Some browsers treat `file://` differently (iframes, security). If something looks wrong, use Option B.

### Option B: Local static server (recommended)

From inside `witcher-db/`, run one of these:

**Python**

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/home.html`.

**Node**

```bash
npx serve .
```

### Option C: VS Code Live Server

Install “Live Server”, right-click `home.html` → **Open with Live Server**.

## Interactions (where to look in code)

- **Mobile nav**: `toggleMenu()` and `closeNavMenu()` in `js/main.js`
- **Characters portrait compare**: `initCharacterPortraitSliders()`
- **Books live search**: `initBooksPage()`
- **Bestiary search + chips + counts**: `initBestiaryPage()`, `fillBestiaryChipCounts()` (chips use `updateChipActiveState()` with the bestiary filter attribute)
- **Characters category chips**: `initCharactersPage()` (same chip helper, different `data-*` attribute)
- **Image lightbox**: `initImageLightboxes()` reads `imageLightboxConfigs` (gallery, Gwent, series, bestiary, books, schools, games — each row is lightbox id, source root id, thumb selector)
- **Series tabs**: `switchSeriesTab()` in `js/main.js` (inline from `series.html`); uses `switchTabPanel()`
- **Schools tabs**: `switchSchool()`; uses `switchTabPanel()`
- **Back to top**: `initBackToTopButton()`
- **Feedback modal (home)**: `initFeedbackModal()`; markup lives in `home.html`

## Customization tips

- **Colors and typography**: edit literals in [`css/style.css`](css/style.css) (for example gold accents around `#c8a96e` / `#e8d4a8`, body text `#e6dfd3`, dark panels `#070708`).
- **Background per page**: the outer wrapper uses **`site-bg`** plus a second class defined in `style.css`, for example `site-bg-home`, `site-bg-bestiary`, `site-bg-series`, `site-bg-book` (books), `site-bg-characters`, `site-bg-games`, `site-bg-gwent`, `site-bg-gallery`, `site-bg-schools`, `site-bg-timeline`. Each maps to a `background-image` rule in the `.site-bg-*` rules in `style.css` (search for `.site-bg-home` to jump to that block).
- **New pages**: copy an existing page and keep the shared stylesheet link, [`js/main.js`](js/main.js), and the nav block so the drawer behaves the same everywhere.
- **Script loading**: [`characters.html`](characters.html) and [`bestiary.html`](bestiary.html) load `js/main.js` with **`defer`**; other pages load it in `<head>` without `defer`. Behaviour is handled in `main.js` for both cases, but for new pages it is best to **match whichever pattern you copy** (or standardise on `defer` + one consistent `<script>` placement).
- **New lightbox**: add an entry to `imageLightboxConfigs` in `js/main.js` and ensure the markup matches the expected class names inside each lightbox root (`attachImageLightbox()`).

## Credits

- **Developed & designed by**: [Christoforos Kagias](https://github.com/ckagias)
- Some pages link to community references (Witcher Wiki, Wikipedia, etc.).

## Disclaimer

This is an **educational project** for my University. *The Witcher* and all related trademarks, characters, and assets belong to their respective owners (e.g. CD PROJEKT S.A., Andrzej Sapkowski, Netflix where applicable). This project is not affiliated with or endorsed by them.