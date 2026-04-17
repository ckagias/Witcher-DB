// Shared helper: close the mobile nav and sync button state.
function closeNavMenu() {
    var menu = document.getElementById("nav-menu");
    var btn = document.querySelector(".menu-btn");
    if (!menu) return;
    // Remove the CSS classes that make the drawer visible and lock body scroll.
    menu.classList.remove("nav-open");
    document.body.classList.remove("nav-drawer-open");
    if (btn) {
        // Reset the hamburger icon and tell screen readers the menu is collapsed.
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
    }
}

// Toggle the mobile nav drawer and sync the menu button (open/closed + aria-expanded).
function toggleMenu() {
    var menu = document.getElementById("nav-menu");
    var btn = document.querySelector(".menu-btn");
    if (!menu) return;
    if (menu.classList.contains("nav-open")) {
        // Menu is currently open — close it.
        closeNavMenu();
    } else {
        // Menu is closed — slide it open and update button state.
        menu.classList.add("nav-open");
        document.body.classList.add("nav-drawer-open");
        if (btn) {
            btn.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
        }
    }
}

var CHAR_IMG_BASE = "images/characters/";

// Shared helper: sync active chip class and aria-current across a chip nav.
// filterAttr is the data-* attribute name used to identify the "show all" chip (e.g. "data-bestiary-filter").
function updateChipActiveState(chipNav, activeCategoryId, filterAttr) {
    if (!chipNav) { return; }
    var allChips = chipNav.querySelectorAll(".bestiary-chip");
    var j;
    for (j = 0; j < allChips.length; j++) {
        var c = allChips[j];
        // Start each chip as inactive, then decide below whether to highlight it.
        c.classList.remove("bestiary-chip-active");
        if (c.getAttribute(filterAttr) === "all") {
            // "Show all" chip: highlight it only when no specific category is selected.
            if (!activeCategoryId) {
                c.classList.add("bestiary-chip-active");
                c.setAttribute("aria-current", "true");
            } else {
                c.removeAttribute("aria-current");
            }
        } else {
            // Category chip: highlight it when it matches the currently active category.
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

// Shared helper: switch tab panels — deactivate all, activate the chosen one.
function switchTabPanel(scope, tabId) {
    var btns = scope.querySelectorAll(".tab-btn");
    var panels = scope.querySelectorAll(".tab-panel");
    var i;
    // Deactivate all tab buttons first.
    for (i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
        btns[i].setAttribute("aria-selected", "false");
    }
    // Hide all panels — the caller is responsible for activating the right button afterwards.
    for (i = 0; i < panels.length; i++) {
        panels[i].classList.remove("active");
        panels[i].setAttribute("aria-hidden", "true");
    }
    // Show only the panel whose id matches "panel-<tabId>".
    var activePanel = document.getElementById("panel-" + tabId);
    if (activePanel) {
        activePanel.classList.add("active");
        activePanel.removeAttribute("aria-hidden");
    }
}

// Add game vs Netflix portrait sliders on character cards (or single portrait when toggles are off).
function initCharacterPortraitSliders() {
    document.querySelectorAll(".char-card-wrap:not(.char-card-wrap-no-toggle)").forEach(function (card, idx) {
        var img = card.querySelector(".char-thumb-wrap img[data-img-base]");
        // Skip cards that have no portrait data or have already been initialized.
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

        // Clear the original static portrait and rebuild it as a comparison widget.
        thumbWrap.textContent = "";
        thumbWrap.classList.add("char-compare");

        // Inner container holds the two stacked portrait images.
        var inner = document.createElement("div");
        inner.className = "char-compare-inner";

        // Left image — the video game portrait (always fully visible).
        var gameImg = document.createElement("img");
        gameImg.className = "char-compare-game";
        gameImg.src = gameSrc;
        gameImg.alt = alt;
        gameImg.setAttribute("width", "280");
        gameImg.setAttribute("height", "220");

        // Right image — the Netflix portrait, initially hidden by clipping the entire image away.
        var netflixImg = document.createElement("img");
        netflixImg.className = "char-compare-netflix";
        netflixImg.src = netflixSrc;
        netflixImg.alt = alt ? alt + " (Netflix)" : "Netflix portrayal";
        netflixImg.setAttribute("width", "280");
        netflixImg.setAttribute("height", "220");
        // clip-path starts at "inset 100% from right" = fully hidden; slider reveals it left-to-right.
        netflixImg.style.clipPath = "inset(0 100% 0 0)";

        inner.appendChild(gameImg);
        inner.appendChild(netflixImg);

        // Give each slider a unique id so its label can point to it with "for".
        var rangeId = "portrait-range-" + idx;

        var label = document.createElement("label");
        label.className = "char-compare-label";
        label.setAttribute("for", rangeId);
        label.textContent = "Game vs Netflix portrait";

        // The range input is the actual slider — 0 = full game portrait, 100 = full Netflix portrait.
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

        // Update Netflix layer clip as user drags the slider.
        range.addEventListener("input", function () {
            var v = range.value;
            netflixImg.style.clipPath = "inset(0 calc(100% - " + v + "%) 0 0)";
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
            netflixImg.style.clipPath = "";
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
        // :scope > img targets only a direct child img, not nested ones.
        var img = thumbWrap.querySelector(":scope > img");
        if (!img) {
            return;
        }
        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }
        // Wrap the single image in the same structure as slider cards for consistent CSS layout.
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

// Books page: show or hide table rows as the user types in the search box.
function initBooksPage() {
    var section = document.getElementById("books-table-section");
    if (!section) {
        return; // Not on the books page — nothing to do.
    }
    var searchInput = document.getElementById("book-table-search");
    // Only select rows that carry a data-search-text attribute (used as the haystack for matching).
    var rows = section.querySelectorAll("tbody tr[data-search-text]");

    // Show or hide rows based on the current query.
    function applySearch() {
        // Normalise the query to lowercase so the match is case-insensitive.
        var q = searchInput ? String(searchInput.value).trim().toLowerCase() : "";
        rows.forEach(function (tr) {
            var hay = tr.getAttribute("data-search-text") || "";
            // An empty query means "show everything"; otherwise check for a substring match.
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

// Bestiary: filter beasts by search text and chips; image opens lightbox, card opens wiki.
function initBestiaryPage() {
    var section = document.getElementById("bestiary-catalog-section");
    if (!section) {
        return; // Not on the bestiary page — nothing to do.
    }
    var searchInput = document.getElementById("bestiary-search");
    var cards = section.querySelectorAll(".bestiary-beast-card[data-search-text]");
    var chipNav = document.querySelector("nav.bestiary-chip-nav");
    // null means "show all categories"; a string means filter to that category id.
    var activeCategoryId = null;

    // Convenience wrapper — passes the bestiary-specific filter attribute name.
    function updateChipActive() {
        updateChipActiveState(chipNav, activeCategoryId, "data-bestiary-filter");
    }

    // Applies text filter and keeps category blocks hidden when empty.
    function applySearch() {
        var q = searchInput ? String(searchInput.value).trim().toLowerCase() : "";
        // First pass: show or hide individual beast cards based on the search query.
        cards.forEach(function (card) {
            var hay = card.getAttribute("data-search-text") || "";
            var ok = !q || hay.indexOf(q) !== -1;
            if (ok) {
                card.removeAttribute("hidden");
            } else {
                card.setAttribute("hidden", "");
            }
        });
        // Second pass: hide any category section whose cards are all hidden (avoids empty headings).
        var cats = section.querySelectorAll(".bestiary-category");
        if (activeCategoryId) {
            // A category chip is active — hide every section except the selected one.
            cats.forEach(function (cat) {
                if (cat.id !== activeCategoryId) {
                    cat.setAttribute("hidden", "");
                } else {
                    // Even the active section should hide if the search left it with no visible cards.
                    var visible = cat.querySelector(".bestiary-beast-card:not([hidden])");
                    if (visible) {
                        cat.removeAttribute("hidden");
                    } else {
                        cat.setAttribute("hidden", "");
                    }
                }
            });
        } else {
            // No category filter — only hide sections that the text search emptied out.
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
                // Clear the active category so all sections become visible again.
                activeCategoryId = null;
                updateChipActive();
                applySearch();
            });
        }
        chipNav.querySelectorAll(".bestiary-chip[data-target]").forEach(function (chip) {
            if (chip.getAttribute("data-bestiary-filter") === "all") {
                return; // Already handled above.
            }
            chip.addEventListener("click", function (e) {
                e.preventDefault();
                // Set the active category to the section id stored on the chip.
                var target = chip.getAttribute("data-target");
                activeCategoryId = target || null;
                updateChipActive();
                applySearch();
            });
        });
        // Sync chip styles on first load (no category selected by default).
        updateChipActive();
    }

    // Wire text input and apply initial state.
    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();

    // Bestiary cards: image opens lightbox | rest of card opens wiki.
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

        // Keyboard users: Enter/Space activates the card like a link.
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                if (shouldIgnoreCardClick(e.target)) {
                    return;
                }
                e.preventDefault();
                window.open(link.href, link.target || "_self", "noopener,noreferrer");
            }
        });
    });
}

// Characters page: filter cards by category chips and make each card open its wiki link.
function initCharactersPage() {
    var chipNav = document.getElementById("char-chip-nav");
    if (!chipNav) {
        return; // Not on the characters page — nothing to do.
    }
    var cards = document.querySelectorAll(".card.char-card-wrap[data-category]");
    // null = show all | a string = show only cards whose data-category matches.
    var activeCategoryId = null;

    // Convenience wrapper — passes the characters-specific filter attribute name.
    function updateChipActive() {
        updateChipActiveState(chipNav, activeCategoryId, "data-char-filter");
    }

    // Shows cards matching the active category id.
    function applyFilter() {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cat = card.getAttribute("data-category") || "";
            // Show the card if no filter is active, or if the card's category matches.
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
            activeCategoryId = null; // Reset — show every character card.
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
    // Apply default state on load (no filter, all cards visible).
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
        // Keyboard users: treat the card like a link.
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.open(link.href, link.target || "_self", "noopener,noreferrer");
            }
        });
    });
}

// Populates category count badges using current bestiary card totals.
function fillBestiaryChipCounts() {
    // Each badge element has data-count-for="<section-id>" pointing to its category section.
    var counts = document.querySelectorAll("[data-count-for]");
    for (var i = 0; i < counts.length; i++) {
        var sectionId = counts[i].getAttribute("data-count-for");
        var section = document.getElementById(sectionId);
        if (section) {
            // Count the beast cards in that section and display the number in the badge.
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
    { lightboxId: "schools-lightbox", sourceId: "schools-lightbox-source", thumbSelector: ".school-thumb" },
    { lightboxId: "games-lightbox", sourceId: "games-page", thumbSelector: ".game-cover" }
];

// Returns the image element for a thumbnail target.
function lightboxThumbImage(thumb) {
    if (thumb.tagName === "IMG") {
        return thumb;
    }
    return thumb.querySelector("img");
}

// One lightbox: thumbnails open it | backdrop, close button, and Escape close it | arrows step images.
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
        var wasHidden = root.hasAttribute("hidden");
        root.removeAttribute("hidden");
        // Only capture the previous overflow the first time the lightbox opens.
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

    // Prev/next navigation: wrap around so it never gets "stuck" at the ends.
    function step(delta) {
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
        // Previous image (when navigation buttons exist).
        prevBtn.addEventListener("click", function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
            step(-1);
        });
    }
    if (nextBtn) {
        // Next image (when navigation buttons exist).
        nextBtn.addEventListener("click", function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
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
        // Both the lightbox modal and its image source must exist — skip if either is absent.
        if (!rootEl || !sourceEl) {
            continue;
        }
        attachImageLightbox(rootEl, sourceEl, cfg.thumbSelector);
    }
}

// Feedback modal: open from hero button, trap focus, validate fields, demo submit (no server).
function initFeedbackModal() {
    var modal = document.getElementById("feedback-modal");
    if (!modal) {
        return;
    }
    var openBtn = document.getElementById("hero-feedback-btn");
    if (!openBtn) {
        return;
    }

    var closeBtn = modal.querySelector(".feedback-modal-close");
    var backdrop = modal.querySelector(".feedback-modal-backdrop");
    var form = document.getElementById("feedback-modal-form");
    var submitBtn = document.getElementById("feedback-modal-submit-btn");
    var resetBtn = document.getElementById("feedback-modal-reset-btn");
    var statusEl = document.getElementById("feedback-modal-status");
    var errEl = document.getElementById("feedback-modal-error");

    var prevBodyOverflow = "";
    var previouslyFocused = null;

    // Returns all focusable elements inside the panel for focus trapping.
    function getFocusable() {
        return Array.prototype.slice.call(
            modal.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );
    }

    function openModal() {
        previouslyFocused = document.activeElement;
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.removeAttribute("hidden");
        modal.classList.remove("is-closing");
        modal.classList.add("is-opening");
        var focusable = getFocusable();
        if (focusable.length) {
            focusable[0].focus();
        }
    }

    function closeModal() {
        modal.classList.remove("is-opening");
        modal.classList.add("is-closing");
        window.setTimeout(function () {
            modal.setAttribute("hidden", "");
            modal.classList.remove("is-closing");
            document.body.style.overflow = prevBodyOverflow;
            prevBodyOverflow = "";
            if (previouslyFocused && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus();
            }
        }, 180);
    }

    // Focus trap: keep keyboard navigation inside the modal while open.
    modal.addEventListener("keydown", function (e) {
        if (modal.hasAttribute("hidden")) {
            return;
        }
        if (e.key === "Escape") {
            e.stopPropagation();
            closeModal();
            return;
        }
        if (e.key !== "Tab") {
            return;
        }
        var focusable = getFocusable();
        if (!focusable.length) {
            return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    openBtn.addEventListener("click", openModal);
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }
    if (backdrop) {
        backdrop.addEventListener("click", closeModal);
    }

    if (!form || !submitBtn) {
        return;
    }

    function showError(msg) {
        if (!errEl) { return; }
        errEl.textContent = msg;
        errEl.removeAttribute("hidden");
    }

    function clearMessages() {
        if (errEl) { errEl.setAttribute("hidden", ""); errEl.textContent = ""; }
        if (statusEl) { statusEl.setAttribute("hidden", ""); statusEl.textContent = ""; }
    }

    function fieldLabelFor(el) {
        if (!el || !el.id) { return "This field"; }
        var label = form.querySelector('label[for="' + el.id + '"]');
        return label ? String(label.textContent || "").trim() : "This field";
    }

    // Clear custom validity on input so the browser tooltip resets.
    var emailInput = document.getElementById("fm-email");
    if (emailInput) {
        emailInput.addEventListener("input", function () {
            emailInput.setCustomValidity("");
        });
        emailInput.addEventListener("blur", function () {
            emailInput.setCustomValidity("");
            var v = String(emailInput.value || "").trim();
            if (v && v.indexOf("@") === -1) {
                emailInput.setCustomValidity("Email addresses need an @ symbol. Example: name@example.com");
            }
        });
    }

    // Submit: validate, then after a short delay show success (no network request).
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearMessages();
        // Use the browser's built-in constraint validation before doing anything else.
        if (typeof form.reportValidity === "function" && !form.reportValidity()) {
            var firstInvalid = form.querySelector(":invalid");
            if (firstInvalid) {
                // Surface the browser's own validation message alongside the field label.
                showError(fieldLabelFor(firstInvalid) + ": " + (firstInvalid.validationMessage || "Please check this field."));
                if (typeof firstInvalid.focus === "function") { firstInvalid.focus(); }
            } else {
                showError("Please check the highlighted fields and try again.");
            }
            return;
        }

        // Disable the button while "sending" so the user can't double-submit.
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending\u2026";

        // Short timeout simulates a network round-trip (there is no server call).
        window.setTimeout(function () {
            var offline = typeof navigator !== "undefined" && navigator.onLine === false;
            if (offline) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Send message";
                showError("You appear to be offline. Check your connection, then try again.");
                return;
            }
            submitBtn.textContent = "\u2713 Sent";
            submitBtn.setAttribute("aria-label", "Message sent");
            if (statusEl) {
                statusEl.innerHTML =
                    "<strong>Message sent.</strong> Thanks for helping improve The Witcher DB. " +
                    "If you want to send more feedback, choose <em>Send another</em>.";
                statusEl.removeAttribute("hidden");
            }
            // Show the "Send another" button so the user can submit again without reloading.
            if (resetBtn) {
                resetBtn.removeAttribute("hidden");
                resetBtn.disabled = false;
            }
            submitBtn.disabled = true;
        }, 550);
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
            submitBtn.removeAttribute("aria-label");
            resetBtn.setAttribute("hidden", "");
            clearMessages();
            var first = document.getElementById("fm-fullname");
            if (first && typeof first.focus === "function") { first.focus(); }
        });
    }
}

// Initializes the back-to-top button visibility and smooth scrolling behavior.
function initBackToTopButton() {
    var scrollBtn = document.getElementById("back-to-top");
    if (!scrollBtn) {
        return;
    }

    // Only show the button once the user has scrolled past 300px — avoids it showing on short pages.
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            scrollBtn.removeAttribute("hidden");
        } else {
            scrollBtn.setAttribute("hidden", "");
        }
    });

    scrollBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


// When the user leaves and comes back, close stray lightboxes and unlock scroll.
function restoreScrollAfterReturn() {
    document.querySelectorAll(".gallery-lightbox:not([hidden])").forEach(function (lb) {
        lb.setAttribute("hidden", "");
    });

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
        initFeedbackModal();
    });
} else {
    initCharacterPortraitSliders();
    initCharactersPage();
    initBooksPage();
    initBestiaryPage();
    fillBestiaryChipCounts();
    initImageLightboxes();
    initBackToTopButton();
    initFeedbackModal();
}

// Run the same cleanup when the tab or window becomes active again (includes back/forward).
window.addEventListener("pageshow", restoreScrollAfterReturn);
window.addEventListener("focus", restoreScrollAfterReturn);
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        restoreScrollAfterReturn();
    }
});

// Switches active school tab/panel. Keeps ARIA attributes current for assistive technologies.
function switchSchool(schoolId) {
    switchTabPanel(document, schoolId);
    var activeBtn = document.getElementById('tab-' + schoolId);
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

// Escape closes the mobile menu when it is open.
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        var menu = document.getElementById("nav-menu");
        var btn = document.querySelector(".menu-btn");
        if (menu && menu.classList.contains("nav-open")) {
            closeNavMenu();
            // Return focus to toggle for keyboard continuity.
            if (btn) { btn.focus(); }
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
        closeNavMenu();
    }
});

// Series page: switch tab panels (live-action, anime, sirens) and mark the active tab.
function switchSeriesTab(tab) {
    var tabIds = ['series', 'anime', 'sirens'];
    var wrap = document.getElementById('series-lightbox-source');
    if (!wrap) {
        return;
    }
    switchTabPanel(wrap, tab);
    var tabIndex = tabIds.indexOf(tab);
    var btns = wrap.querySelectorAll('.tab-btn');
    if (tabIndex !== -1 && btns[tabIndex]) {
        btns[tabIndex].classList.add('active');
        btns[tabIndex].setAttribute('aria-selected', 'true');
    }
}