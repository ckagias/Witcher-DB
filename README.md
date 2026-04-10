# The Witcher DB (Static Website)

A multi-page, static reference site for *The Witcher* universe — covering characters, lore, books, schools, a bestiary, a timeline, a map hub, and media galleries — built with plain **HTML/CSS/JavaScript** (no framework, no build step).

> Folder: `witcher-db/`

## Demo / Preview

- **Entry point**: open `home.html`
- **Recommended**: run a local static server (see “Run locally”) so navigation, embeds, and assets behave consistently.

## Features

- **Multi-page navigation**: full-width pill bar on wider viewports; on small screens (≤768px), a **hamburger** opens a **right-side sliding drawer** for links.
- **Characters**: card grid with a **Game vs Netflix portrait compare slider** (implemented in `js/main.js`).
- **Books**: searchable table (filters rows as you type).
- **Bestiary**: searchable creature cards + **category chips** + live **category counts**.
- **Lore**: live page filter with **keyword highlighting** and a “no results” state.
- **Gallery & Gwent**: click-to-open **image lightbox modal** (shared lightbox logic).
- **Schools**: accessible tab UI switching between school panels + row highlight in comparison table.
- **Timeline**: vertical timeline layout of major events.
- **Map**: region cards + embedded external interactive map (`witcher3map.com`).
- **Feedback**: accessible form with client-side validation and success/reset UI.
- **Back-to-top** button appears after scrolling (smooth scroll).

## Pages

- `home.html`: landing page + featured content + YouTube embed
- `characters.html`: major characters cards + portrait comparison slider
- `gwent.html`: Gwent overview + factions list + lightbox image
- `map.html`: region picker + external interactive map embed
- `timeline.html`: timeline of major events
- `book.html`: reading-order table + live search
- `schools.html`: Witcher schools tabbed panels + comparison table
- `bestiary.html`: bestiary catalog + chip filters + live search
- `lore.html`: lore topics + live filter + text highlighting
- `gallery.html`: screenshot gallery + lightbox
- `feedback.html`: feedback form + validation

## Tech stack

- **HTML5** (semantic structure, aria attributes used in multiple pages)
- **CSS3**: single shared stylesheet `css/style.css` (design tokens via `:root`, glassy nav, cards, grids)
- **Vanilla JS**: `js/main.js` (page initializers + interaction helpers)
- **Fonts**: Google Fonts (`Cinzel`, `Lora`)

## Project structure

```text
witcher-db/
  README.md
  home.html
  characters.html
  gwent.html
  map.html
  timeline.html
  book.html
  schools.html
  bestiary.html
  lore.html
  gallery.html
  feedback.html
  css/
    style.css
  js/
    main.js
```

### About images / assets (important)

The HTML references an `images/` folder (for example `images/favicon.png`, `images/characters/...`, `images/gallery/...`), but **this workspace snapshot currently does not include any image files**.

To avoid broken images, add your assets under `witcher-db/images/` using the same paths referenced in the HTML (or update the HTML to match your asset paths).

## Run locally

### Option A: Open directly (quickest)

- Double-click `home.html` to open it in your browser.

> Note: Some browsers handle `file://` pages differently (especially around iframes and relative resources). If anything looks off, use Option B.

### Option B: Local static server (recommended)

From inside the `witcher-db/` folder, run one of these:

**Python**

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500/home.html`.

**Node**

```bash
npx serve .
```

### Option C: VS Code Live Server

- Install the “Live Server” extension
- Right-click `home.html` → **Open with Live Server**

## Interactions (where to look in code)

- **Mobile nav (drawer)**: `toggleMenu()` in `js/main.js`
- **Characters portrait compare slider**: `initCharacterPortraitSliders()`
- **Books live search**: `initBooksPage()`
- **Bestiary live search + chips**: `initBestiaryPage()` + `fillBestiaryChipCounts()`
- **Lore live search + highlighting**: `initLorePage()` + `highlightText()` / `restoreText()`
- **Gallery/Gwent lightbox**: `initImageLightboxes()` / `attachImageLightbox()`
- **Back to top**: `initBackToTopButton()`
- **Schools tabs**: `switchSchool()` + default activation on `DOMContentLoaded`
- **Feedback form validation**: inline script inside `feedback.html`

## Customization tips

- **Theme tokens** live in `css/style.css` under `:root` (e.g. `--gold`, `--text`, `--panel`).
- **Background per page** is controlled with `site-bg--*` classes (e.g. `site-bg--home`, `site-bg--bestiary`).
- **Add new pages** by copying an existing page and keeping:
  - the shared `<link rel="stylesheet" href="css/style.css" />`
  - the shared `<script src="js/main.js"></script>` (or `defer`)
  - the nav markup (so the menu behaves consistently)

## Credits

- **Developed & designed by**: [Christoforos Kagias](https://github.com/ckagias)
- Some pages link out to community references (e.g. Witcher Wiki, Wikipedia) and external map embed (`witcher3map.com`).

## Disclaimer

This is a **educational project** for my University. *The Witcher* and all related trademarks, characters, and assets are the property of their respective owners (e.g. CD PROJEKT S.A., Andrzej Sapkowski, Netflix where applicable). This project is not affiliated with or endorsed by them.

