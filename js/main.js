/**
 * Toggles the mobile navigation drawer.
 * Opens or closes the menu and updates button ARIA state.
 */
function toggleMenu() {
    // Read menu/button elements used by the mobile nav.
    var menu = document.getElementById("nav-menu");
    var btn = document.querySelector(".menu-btn");
    // Exit safely on pages that do not include this nav.
    if (!menu) return;
    // Detect current state so we can toggle.
    var isOpen = menu.classList.contains("nav-open");
    if (isOpen) {
        // Close menu and clear related state classes.
        menu.classList.remove("nav-open");
        document.body.classList.remove("nav-drawer-open");
        if (btn) {
            // Sync visual and accessibility states on the button.
            btn.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
        }
    } else {
        // Open menu and mark body as drawer-open.
        menu.classList.add("nav-open");
        document.body.classList.add("nav-drawer-open");
        if (btn) {
            // Sync visual and accessibility states on the button.
            btn.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
        }
    }
}

var CHAR_IMG_BASE = "images/characters/";

/**
 * Initializes portrait comparison sliders for character cards.
 */
function initCharacterPortraitSliders() {
    // Setup compare mode on cards that support toggling.
    document.querySelectorAll(".char-card-wrap:not(.char-card-wrap-no-toggle)").forEach(function (card, idx) {
        var img = card.querySelector(".char-thumb-wrap img[data-img-base]");
        // Skip if required image data is missing or card is already initialized.
        if (!img || card.getAttribute("data-compare-init") === "1") {
            return;
        }
        var thumbWrap = card.querySelector(".char-thumb-wrap");
        var link = card.querySelector(".char-card-link");
        if (!thumbWrap || !link) {
            return;
        }

        var baseFile = img.getAttribute("data-img-base");
        var gameSrc = img.getAttribute("src");
        // Netflix portraits live under a predictable subfolder with matching filenames.
        var netflixSrc = CHAR_IMG_BASE + "netflix/" + baseFile;
        var alt = img.getAttribute("alt") || "";

        // Move thumbnail wrapper outside the link so slider controls stay interactive.
        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }

        thumbWrap.textContent = "";
        thumbWrap.classList.add("char-compare");

        var inner = document.createElement("div");
        inner.className = "char-compare-inner";
        inner.style.setProperty("--reveal", "0%");

        var gameImg = document.createElement("img");
        gameImg.className = "char-compare-game";
        gameImg.src = gameSrc;
        gameImg.alt = alt;
        gameImg.setAttribute("width", "280");
        gameImg.setAttribute("height", "220");

        var netflixImg = document.createElement("img");
        netflixImg.className = "char-compare-netflix";
        netflixImg.src = netflixSrc;
        netflixImg.alt = alt ? alt + " (Netflix)" : "Netflix portrayal";
        netflixImg.setAttribute("width", "280");
        netflixImg.setAttribute("height", "220");

        inner.appendChild(gameImg);
        inner.appendChild(netflixImg);

        var rangeId = "portrait-range-" + idx;

        var label = document.createElement("label");
        label.className = "char-compare-label";
        label.setAttribute("for", rangeId);
        label.textContent = "Game vs Netflix portrait";

        var range = document.createElement("input");
        range.type = "range";
        range.id = rangeId;
        range.className = "char-compare-range";
        range.min = "0";
        range.max = "100";
        range.value = "0";
        range.setAttribute("aria-valuemin", "0");
        range.setAttribute("aria-valuemax", "100");
        range.setAttribute("aria-valuetext", "Game portrayal");

        // Keep screen-reader value text meaningful at each slider position.
        function syncAria(v) {
            var n = Number(v);
            if (n <= 5) {
                range.setAttribute("aria-valuetext", "Game portrayal");
            } else if (n >= 95) {
                range.setAttribute("aria-valuetext", "Netflix portrayal");
            } else {
                range.setAttribute("aria-valuetext", n + "% blend toward Netflix");
            }
        }

        // Update CSS reveal variable as user drags the slider.
        range.addEventListener("input", function () {
            var v = range.value;
            inner.style.setProperty("--reveal", v + "%");
            syncAria(v);
        });

        // Prevent slider interactions from bubbling to surrounding clickable card elements.
        range.addEventListener("click", function (e) {
            e.stopPropagation();
        });
        range.addEventListener("mousedown", function (e) {
            e.stopPropagation();
        });

        thumbWrap.appendChild(inner);
        thumbWrap.appendChild(label);
        thumbWrap.appendChild(range);

        // Graceful fallback if Netflix image file does not exist.
        netflixImg.addEventListener("error", function () {
            netflixImg.style.display = "none";
            inner.style.setProperty("--reveal", "0%");
            range.setAttribute("disabled", "disabled");
            range.setAttribute("aria-disabled", "true");
            label.textContent = "Portrait (game only)";
        });

        card.setAttribute("data-compare-init", "1");
    });

    // Setup non-toggle cards (single portrait mode) once.
    document.querySelectorAll(".char-card-wrap-no-toggle").forEach(function (card) {
        if (card.getAttribute("data-single-portrait-init") === "1") {
            return;
        }
        var thumbWrap = card.querySelector(".char-thumb-wrap");
        var link = card.querySelector(".char-card-link");
        if (!thumbWrap || !link) {
            return;
        }
        var compareLabel = card.querySelector(".char-compare-label");
        var img = thumbWrap.querySelector(":scope > img");
        if (!img) {
            return;
        }
        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }
        thumbWrap.classList.add("char-compare", "char-compare-single");
        var inner = document.createElement("div");
        inner.className = "char-compare-inner";
        thumbWrap.removeChild(img);
        img.classList.add("char-compare-game");
        // Ensure consistent layout even if width/height attrs are missing in HTML.
        if (!img.getAttribute("width")) {
            img.setAttribute("width", "280");
        }
        if (!img.getAttribute("height")) {
            img.setAttribute("height", "220");
        }
        inner.appendChild(img);
        thumbWrap.appendChild(inner);
        if (compareLabel) {
            thumbWrap.appendChild(compareLabel);
        }
        card.setAttribute("data-single-portrait-init", "1");
    });
}

/**
 * Initializes live filtering for the books table.
 * Matches typed text against each row's data-search-text value.
 */
function initBooksPage() {
    var section = document.getElementById("books-table-section");
    if (!section) {
        return;
    }
    var searchInput = document.getElementById("book-table-search");
    var rows = section.querySelectorAll("tbody tr[data-search-text]");

    // Show or hide rows based on the current query.
    function applySearch() {
        var q = searchInput ? String(searchInput.value).trim().toLowerCase() : "";
        rows.forEach(function (tr) {
            var hay = tr.getAttribute("data-search-text") || "";
            var ok = !q || hay.indexOf(q) !== -1;
            if (ok) {
                tr.removeAttribute("hidden");
            } else {
                tr.setAttribute("hidden", "");
            }
        });
    }

    // Re-filter while typing, and run once on page load.
    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();
}


/**
 * Initializes bestiary filtering by text and category chips.
 * Cards are filtered first by search, then category visibility is recalculated.
 */
function initBestiaryPage() {
    var section = document.getElementById("bestiary-catalog-section");
    if (!section) {
        return;
    }
    var searchInput = document.getElementById("bestiary-search");
    var cards = section.querySelectorAll(".bestiary-beast-card[data-search-text]");
    var chipNav = document.querySelector("nav.bestiary-chip-nav");
    var activeCategoryId = null;

    // Updates active chip styling and aria-current state.
    function updateChipActive() {
        if (!chipNav) {
            return;
        }
        var allChips = chipNav.querySelectorAll(".bestiary-chip");
        var j;
        for (j = 0; j < allChips.length; j++) {
            var c = allChips[j];
            c.classList.remove("bestiary-chip-active");
            if (c.getAttribute("data-bestiary-filter") === "all") {
                if (!activeCategoryId) {
                    c.classList.add("bestiary-chip-active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            } else {
                var tid = c.getAttribute("data-target");
                if (tid && tid === activeCategoryId) {
                    c.classList.add("bestiary-chip-active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            }
        }
    }

    // Applies text filter and keeps category blocks hidden when empty.
    function applySearch() {
        var q = searchInput ? String(searchInput.value).trim().toLowerCase() : "";
        cards.forEach(function (card) {
            var hay = card.getAttribute("data-search-text") || "";
            var ok = !q || hay.indexOf(q) !== -1;
            if (ok) {
                card.removeAttribute("hidden");
            } else {
                card.setAttribute("hidden", "");
            }
        });
        var cats = section.querySelectorAll(".bestiary-category");
        if (activeCategoryId) {
            cats.forEach(function (cat) {
                if (cat.id !== activeCategoryId) {
                    cat.setAttribute("hidden", "");
                } else {
                    var visible = cat.querySelector(".bestiary-beast-card:not([hidden])");
                    if (visible) {
                        cat.removeAttribute("hidden");
                    } else {
                        cat.setAttribute("hidden", "");
                    }
                }
            });
        } else {
            cats.forEach(function (cat) {
                var visible = cat.querySelector(".bestiary-beast-card:not([hidden])");
                if (visible) {
                    cat.removeAttribute("hidden");
                } else {
                    cat.setAttribute("hidden", "");
                }
            });
        }
    }

    // Wire up category chip clicks.
    if (chipNav) {
        var showAllChip = chipNav.querySelector("[data-bestiary-filter=\"all\"]");
        if (showAllChip) {
            showAllChip.addEventListener("click", function (e) {
                e.preventDefault();
                activeCategoryId = null;
                updateChipActive();
                applySearch();
            });
        }
        chipNav.querySelectorAll(".bestiary-chip[data-target]").forEach(function (chip) {
            if (chip.getAttribute("data-bestiary-filter") === "all") {
                return;
            }
            chip.addEventListener("click", function (e) {
                e.preventDefault();
                var target = chip.getAttribute("data-target");
                activeCategoryId = target || null;
                updateChipActive();
                applySearch();
            });
        });
        updateChipActive();
    }

    // Wire text input and apply initial state.
    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();

    // Bestiary cards: image opens lightbox; rest of card opens wiki.
    cards.forEach(function (card) {
        var link = card.querySelector(".bestiary-card-link");
        if (!link) {
            return;
        }

        // Keep the image out of the link to avoid accidental navigation.
        var img = link.querySelector("img.gallery-img");
        if (img && img.parentNode === link) {
            link.parentNode.insertBefore(img, link);
        }

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "link");

        function shouldIgnoreCardClick(target) {
            if (!target) {
                return false;
            }
            // Let interactive descendants handle activation.
            if (target.tagName === "A" || target.tagName === "BUTTON" || target.tagName === "INPUT") {
                return true;
            }
            // Image opens the lightbox.
            if (target.closest && target.closest(".gallery-img")) {
                return true;
            }
            return false;
        }

        card.addEventListener("click", function (e) {
            if (shouldIgnoreCardClick(e.target)) {
                return;
            }
            // Open the wiki in a new tab like a normal external link.
            window.open(link.href, link.target || "_self", "noopener,noreferrer");
        });

        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                if (shouldIgnoreCardClick(e.target)) {
                    return;
                }
                e.preventDefault();
                // Keyboard users: Enter/Space activates the card like a link.
                window.open(link.href, link.target || "_self", "noopener,noreferrer");
            }
        });
    });
}

/**
 * Initializes category chip filtering for character cards.
 * Shows cards from the selected category, or all cards when reset.
 */
function initCharactersPage() {
    var chipNav = document.getElementById("char-chip-nav");
    if (!chipNav) {
        return;
    }
    var cards = document.querySelectorAll(".card.char-card-wrap[data-category]");
    var activeCategoryId = null;

    // Updates active chip class and aria-current for accessibility.
    function updateChipActive() {
        var allChips = chipNav.querySelectorAll(".bestiary-chip");
        var j;
        for (j = 0; j < allChips.length; j++) {
            var c = allChips[j];
            c.classList.remove("bestiary-chip-active");
            if (c.getAttribute("data-char-filter") === "all") {
                if (!activeCategoryId) {
                    c.classList.add("bestiary-chip-active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            } else {
                var tid = c.getAttribute("data-target");
                if (tid && tid === activeCategoryId) {
                    c.classList.add("bestiary-chip-active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            }
        }
    }

    // Shows cards matching the active category id.
    function applyFilter() {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cat = card.getAttribute("data-category") || "";
            if (!activeCategoryId || cat === activeCategoryId) {
                card.removeAttribute("hidden");
            } else {
                card.setAttribute("hidden", "");
            }
        }
    }

    var showAllChip = chipNav.querySelector("[data-char-filter=\"all\"]");
    if (showAllChip) {
        showAllChip.addEventListener("click", function (e) {
            e.preventDefault();
            activeCategoryId = null;
            updateChipActive();
            applyFilter();
        });
    }
    chipNav.querySelectorAll(".bestiary-chip[data-target]").forEach(function (chip) {
        if (chip.getAttribute("data-char-filter") === "all") {
            return;
        }
        chip.addEventListener("click", function (e) {
            e.preventDefault();
            var target = chip.getAttribute("data-target");
            activeCategoryId = target || null;
            updateChipActive();
            applyFilter();
        });
    });
    updateChipActive();
    applyFilter();

    // Make the full card clickable while preserving native control behavior.
    document.querySelectorAll(".card.char-card-wrap").forEach(function (card) {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "link");
        var link = card.querySelector(".char-card-link");
        if (!link) {
            return;
        }
        card.addEventListener("click", function (e) {
            // Let native links, buttons, inputs, and sliders handle their own events.
            var t = e.target;
            if (t.tagName === "A" || t.tagName === "BUTTON" || t.tagName === "INPUT") {
                return;
            }
            window.open(link.href, link.target || "_self", "noopener,noreferrer");
        });
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                // Keyboard users: treat the card like a link.
                window.open(link.href, link.target || "_self", "noopener,noreferrer");
            }
        });
    });
}

// Populates category count badges using current bestiary card totals.
function fillBestiaryChipCounts() {
    var counts = document.querySelectorAll("[data-count-for]");
    for (var i = 0; i < counts.length; i++) {
        var sectionId = counts[i].getAttribute("data-count-for");
        var section = document.getElementById(sectionId);
        if (section) {
            var cards = section.querySelectorAll(".bestiary-beast-card");
            counts[i].textContent = String(cards.length);
        }
    }
}

var imageLightboxConfigs = [
    { lightboxId: "gallery-lightbox", sourceId: "gallery-page-grid", thumbSelector: ".gallery-img" },
    { lightboxId: "gwent-lightbox", sourceId: "gwent-lightbox-source", thumbSelector: ".faction-hero-img" },
    { lightboxId: "series-lightbox", sourceId: "series-lightbox-source", thumbSelector: ".series-poster" },
    { lightboxId: "bestiary-lightbox", sourceId: "bestiary-catalog-section", thumbSelector: ".gallery-img" },
    { lightboxId: "books-lightbox", sourceId: "books-table-section", thumbSelector: ".book-thumb" },
    { lightboxId: "schools-lightbox", sourceId: "schools-lightbox-source", thumbSelector: ".school-thumb" }
];

// Returns the image element for a thumbnail target.
function lightboxThumbImage(thumb) {
    if (thumb.tagName === "IMG") {
        return thumb;
    }
    return thumb.querySelector("img");
}

/**
 * Attaches all interaction handlers for one image lightbox instance.
 * Supports click/keyboard open, backdrop/button close, and Escape close.
 */
function attachImageLightbox(root, source, thumbSelector) {
    var modalImg = root.querySelector(".gallery-lightbox-img");
    var captionEl = root.querySelector(".gallery-lightbox-caption");
    var closeBtn = root.querySelector(".gallery-lightbox-close");
    var backdrop = root.querySelector(".gallery-lightbox-backdrop");
    var prevBtn = root.querySelector(".gallery-lightbox-prev");
    var nextBtn = root.querySelector(".gallery-lightbox-next");
    if (!modalImg || !captionEl || !closeBtn || !backdrop) {
        return;
    }

    // Remember existing overflow style so we can restore page scroll on close.
    var prevBodyOverflow = "";

    // Thumbs list for optional prev/next navigation.
    var thumbs = [];
    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        if (lightboxThumbImage(thumb)) {
            thumbs.push(thumb);
        }
    });
    var canNavigate = Boolean(prevBtn && nextBtn && thumbs.length > 1);
    var activeIndex = -1;

    // Opens modal using clicked thumbnail image + caption text.
    function openModal(thumb, options) {
        var img = lightboxThumbImage(thumb);
        if (!img) {
            return;
        }
        activeIndex = thumbs.indexOf(thumb);
        // Prefer the URL the browser chose from srcset (best available resolution).
        var chosenSrc = img.currentSrc || img.getAttribute("src") || "";
        modalImg.src = chosenSrc;
        modalImg.alt = img.getAttribute("alt") || "";
        var cap = img.nextElementSibling;
        var text = "";
        if (cap && cap.tagName === "P") {
            text = String(cap.textContent || "").trim();
        } else {
            // Fallback to alt text when no adjacent caption paragraph exists.
            text = String(img.getAttribute("alt") || "").trim();
        }
        captionEl.textContent = text;
        // Only capture the previous overflow the first time the lightbox opens.
        var wasHidden = root.hasAttribute("hidden");
        root.removeAttribute("hidden");
        if (wasHidden) {
            prevBodyOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        }
        var shouldFocus = !options || options.focus !== false;
        if (shouldFocus) {
            closeBtn.focus();
        }
    }

    // Closes modal and restores original body scroll style.
    function closeModal() {
        root.setAttribute("hidden", "");
        document.body.style.overflow = prevBodyOverflow;
        prevBodyOverflow = "";
    }

    function step(delta) {
        // Prev/next navigation: wrap around so it never gets "stuck" at the ends.
        if (!canNavigate || thumbs.length === 0) {
            return;
        }
        var idx = activeIndex;
        if (idx < 0) {
            idx = 0;
        }
        var nextIndex = (idx + delta + thumbs.length) % thumbs.length;
        openModal(thumbs[nextIndex], { focus: false });
    }

    // Register click and keyboard activation on all matching thumbnails.
    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        if (!lightboxThumbImage(thumb)) {
            return;
        }
        thumb.addEventListener("click", function (e) {
            // Stop bubbling to surrounding clickable cards/links.
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            openModal(thumb);
        });
        thumb.addEventListener("keydown", function (e) {
            // Enter/Space should behave like click for keyboard users.
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                }
                openModal(thumb);
            }
        });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
            // Previous image (when navigation buttons exist).
            step(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
            // Next image (when navigation buttons exist).
            step(1);
        });
    }

    // Keyboard: Escape closes; arrows step when enabled.
    document.addEventListener("keydown", function (e) {
        if (root.hasAttribute("hidden")) {
            return;
        }
        if (e.key === "Escape") {
            closeModal();
            return;
        }
        if (canNavigate && e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
            return;
        }
        if (canNavigate && e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
        }
    });
}

// Initializes all configured lightboxes present on the current page.
function initImageLightboxes() {
    var i;
    for (i = 0; i < imageLightboxConfigs.length; i++) {
        var cfg = imageLightboxConfigs[i];
        var rootEl = document.getElementById(cfg.lightboxId);
        var sourceEl = document.getElementById(cfg.sourceId);
        if (!rootEl || !sourceEl) {
            continue;
        }
        attachImageLightbox(rootEl, sourceEl, cfg.thumbSelector);
    }
}

// Initializes the back-to-top button visibility and smooth scrolling behavior.
function initBackToTopButton() {
    var scrollBtn = document.getElementById("back-to-top");
    if (!scrollBtn) {
        return;
    }

    // Reveal button only after user has scrolled down enough.
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            scrollBtn.removeAttribute("hidden");
        } else {
            scrollBtn.setAttribute("hidden", "");
        }
    });

    // Scroll smoothly to the top when the button is clicked.
    scrollBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


// Safety: restore scrolling when returning after leaving a lightbox open.
function restoreScrollAfterReturn() {
    // If any lightbox is open, hide it (equivalent to close).
    document.querySelectorAll(".gallery-lightbox:not([hidden])").forEach(function (lb) {
        lb.setAttribute("hidden", "");
    });

    // If scroll is locked via inline style, clear it.
    if (document.body && document.body.style && document.body.style.overflow === "hidden") {
        document.body.style.overflow = "";
    }
}

// Run all page initializers once DOM is ready.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        initCharacterPortraitSliders();
        initCharactersPage();
        initBooksPage();
        initBestiaryPage();
        fillBestiaryChipCounts();
        initImageLightboxes();
        initBackToTopButton();
    });
} else {
    initCharacterPortraitSliders();
    initCharactersPage();
    initBooksPage();
    initBestiaryPage();
    fillBestiaryChipCounts();
    initImageLightboxes();
    initBackToTopButton();
}

// Restore scroll when returning from another tab/window (covers BFCache too).
window.addEventListener("pageshow", restoreScrollAfterReturn);
window.addEventListener("focus", restoreScrollAfterReturn);
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        // Some browsers only fire visibilitychange on tab return.
        restoreScrollAfterReturn();
    }
});

// Switches active school tab/panel. Keeps ARIA attributes current for assistive technologies.
function switchSchool(schoolId) {
    var panels = document.querySelectorAll('.tab-panel');
    var buttons = document.querySelectorAll('.tab-btn');

    // Reset panel visibility state.
    for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
        panels[i].setAttribute('aria-hidden', 'true');
    }

    // Reset button selected state.
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
        buttons[j].setAttribute('aria-selected', 'false');
    }

    var activePanel = document.getElementById('panel-' + schoolId);
    var activeBtn = document.getElementById('tab-' + schoolId);

    // Activate selected content panel.
    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.removeAttribute('aria-hidden');
    }

    // Activate selected tab button.
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }
}

// Apply default schools tab when the schools page is loaded.
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('panel-wolf')) {
        switchSchool('wolf');
    }
});

// Accessibility: Escape closes the open mobile menu.
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        var menu = document.getElementById("nav-menu");
        var btn = document.querySelector(".menu-btn");
        if (menu && menu.classList.contains("nav-open")) {
            menu.classList.remove("nav-open");
            document.body.classList.remove("nav-drawer-open");
            if (btn) {
                btn.classList.remove("is-open");
                btn.setAttribute("aria-expanded", "false");
                // Return focus to toggle for keyboard continuity.
                btn.focus();
            }
        }
    }
});

// Close mobile menu when user clicks outside both menu and toggle button.
document.addEventListener("click", function (e) {
    var menu = document.getElementById("nav-menu");
    var btn = document.querySelector(".menu-btn");
    if (
        menu &&
        menu.classList.contains("nav-open") &&
        !menu.contains(e.target) &&
        btn &&
        !btn.contains(e.target)
    ) {
        menu.classList.remove("nav-open");
        document.body.classList.remove("nav-drawer-open");
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
    }
});

/**
 * Switches active tabs for the series page.
 * Updates panel visibility plus tab button ARIA selected state.
 */
function switchSeriesTab(tab) {
    var tabIds = ['series', 'anime', 'sirens'];
    var wrap = document.getElementById('series-lightbox-source');
    if (!wrap) {
        return;
    }
    var btns = wrap.querySelectorAll('.tab-btn');
    var panels = wrap.querySelectorAll('.tab-panel');
    var i;
    for (i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        btns[i].setAttribute('aria-selected', 'false');
    }
    for (i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
        panels[i].setAttribute('aria-hidden', 'true');
    }
    var activePanel = document.getElementById('panel-' + tab);
    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.setAttribute('aria-hidden', 'false');
    }
    var tabIndex = tabIds.indexOf(tab);
    if (tabIndex !== -1 && btns[tabIndex]) {
        btns[tabIndex].classList.add('active');
        btns[tabIndex].setAttribute('aria-selected', 'true');
    }
}