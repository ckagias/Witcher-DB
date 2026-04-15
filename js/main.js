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

    // Make the full card area clickable: navigate to the char-card-link href
    // when clicking anywhere on the card that isn't an interactive element.
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
                window.open(link.href, link.target || "_self", "noopener,noreferrer");
            }
        });
    });
}

/**
 * Populates category count badges using current bestiary card totals.
 */
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

/**
 * Highlights query matches by wrapping matched text in <mark>.
 */
function highlightText(element, query) {
    // Traverse text nodes so we can insert markup without rebuilding whole HTML.
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }
    for (var i = 0; i < textNodes.length; i++) {
        var original = textNodes[i].nodeValue;
        var lower = original.toLowerCase();
        var idx = lower.indexOf(query);
        if (idx !== -1) {
            // Split the original text into before/match/after nodes.
            var before = document.createTextNode(original.substring(0, idx));
            var mark = document.createElement("mark");
            mark.textContent = original.substring(idx, idx + query.length);
            var after = document.createTextNode(original.substring(idx + query.length));
            var parent = textNodes[i].parentNode;
            parent.replaceChild(after, textNodes[i]);
            parent.insertBefore(mark, after);
            parent.insertBefore(before, mark);
        }
    }
}

/**
 * Removes all generated <mark> elements and restores plain text.
 */
function restoreText(element) {
    var marks = element.querySelectorAll("mark");
    for (var i = 0; i < marks.length; i++) {
        var mark = marks[i];
        var parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    }
}

/**
 * Initializes live search for lore sections with highlighting support.
 */
function initLorePage() {
    var loreSearchInput = document.getElementById("lore-page-search");

    if (loreSearchInput) {
        loreSearchInput.addEventListener("input", function () {
            var query = this.value.trim().toLowerCase();
            var sections = document.querySelectorAll(".lore-section");
            var noResults = document.getElementById("lore-no-results");
            var visibleCount = 0;

            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];

                // Restore any previous highlights before re-checking
                restoreText(section);

                if (query === "") {
                    // Empty query means all sections should stay visible.
                    section.removeAttribute("hidden");
                    visibleCount++;
                } else {
                    var text = section.textContent.toLowerCase();
                    if (text.indexOf(query) !== -1) {
                        // Keep section visible and highlight matched text.
                        section.removeAttribute("hidden");
                        highlightText(section, query);
                        visibleCount++;
                    } else {
                        section.setAttribute("hidden", "");
                    }
                }
            }

            if (noResults) {
                // Show no-results helper only when query has no visible sections.
                if (visibleCount === 0 && query !== "") {
                    noResults.removeAttribute("hidden");
                } else {
                    noResults.setAttribute("hidden", "");
                }
            }
        });
    }
}

/**
 * Initializes login form interactions when a login page is present.
 * Handles show/hide password and simple required-field validation.
 */
function initLoginPage() {
    var form = document.querySelector(".login-page form");
    var err = document.getElementById("login-error");
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var togglePw = document.getElementById("toggle-pw");
    // Exit safely on pages without login markup.
    if (!form || !err) {
        return;
    }
    if (togglePw && password) {
        // Toggle password visibility text + input type.
        togglePw.addEventListener("click", function () {
            if (password.type === "password") {
                password.type = "text";
                togglePw.textContent = "Hide";
            } else {
                password.type = "password";
                togglePw.textContent = "Show";
            }
        });
    }
    // Validate fields locally and redirect on success.
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var u = username ? String(username.value || "").trim() : "";
        var p = password ? String(password.value || "").trim() : "";
        if (!u || !p) {
            err.textContent = "Please fill in all fields.";
            err.style.display = "block";
            return;
        }
        err.style.display = "none";
        window.location.href = "home.html";
    });
}

var imageLightboxConfigs = [
    { lightboxId: "gallery-lightbox", sourceId: "gallery-page-grid", thumbSelector: ".gallery-img" },
    { lightboxId: "gwent-lightbox", sourceId: "gwent-lightbox-source", thumbSelector: ".faction-hero-img" },
    { lightboxId: "series-lightbox", sourceId: "series-lightbox-source", thumbSelector: ".series-poster" }
];

/**
 * Returns the image element for a thumbnail target.
 * Supports either direct IMG targets or wrapper elements containing an IMG.
 */
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
    if (!modalImg || !captionEl || !closeBtn || !backdrop) {
        return;
    }

    // Remember existing overflow style so we can restore page scroll on close.
    var prevBodyOverflow = "";

    // Opens modal using clicked thumbnail image + caption text.
    function openModal(thumb) {
        var img = lightboxThumbImage(thumb);
        if (!img) {
            return;
        }
        modalImg.src = img.getAttribute("src") || "";
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
        root.removeAttribute("hidden");
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    // Closes modal and restores original body scroll style.
    function closeModal() {
        root.setAttribute("hidden", "");
        document.body.style.overflow = prevBodyOverflow;
    }

    // Register click and keyboard activation on all matching thumbnails.
    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        if (!lightboxThumbImage(thumb)) {
            return;
        }
        thumb.addEventListener("click", function () {
            openModal(thumb);
        });
        thumb.addEventListener("keydown", function (e) {
            // Enter/Space should behave like click for keyboard users.
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal(thumb);
            }
        });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    // Global Escape closes this modal while it is visible.
    document.addEventListener("keydown", function (e) {
        if (!root.hasAttribute("hidden") && e.key === "Escape") {
            closeModal();
        }
    });
}

/**
 * Initializes all configured lightboxes present on the current page.
 */
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

/**
 * Backward-compatible wrapper used by existing initializer calls.
 */
function initGalleryLightbox() {
    initImageLightboxes();
}

/**
 * Initializes the back-to-top button visibility and smooth scrolling behavior.
 */
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

// Run all page initializers once DOM is ready.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        initLoginPage();
        initCharacterPortraitSliders();
        initCharactersPage();
        initBooksPage();
        initLorePage();
        initBestiaryPage();
        fillBestiaryChipCounts();
        initGalleryLightbox();
        initBackToTopButton();
    });
} else {
    initLoginPage();
    initCharacterPortraitSliders();
    initCharactersPage();
    initBooksPage();
    initLorePage();
    initBestiaryPage();
    fillBestiaryChipCounts();
    initGalleryLightbox();
    initBackToTopButton();
}

/**
 * Switches active school tab/panel and highlights its comparison table row.
 * Also keeps ARIA attributes current for assistive technologies.
 */
function switchSchool(schoolId) {
    var panels = document.querySelectorAll('.school-panel');
    var buttons = document.querySelectorAll('.school-tab-btn');
    var rows = document.querySelectorAll('.comparison-table tbody tr');

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

    // Clear previous active row highlight.
    for (var k = 0; k < rows.length; k++) {
        rows[k].classList.remove('table-row-active');
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

    var activeRow = document.querySelector('.comparison-table tbody tr[data-school="' + schoolId + '"]');
    if (activeRow) {
        activeRow.classList.add('table-row-active');
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
    var btns = document.querySelectorAll('.school-tab-btn');
    var panels = document.querySelectorAll('.school-panel');
    var i;
    for (i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        btns[i].setAttribute('aria-selected', 'false');
    }
    for (i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
    }
    var activePanel = document.getElementById('panel-' + tab);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    var tabIndex = tabIds.indexOf(tab);
    if (tabIndex !== -1 && btns[tabIndex]) {
        btns[tabIndex].classList.add('active');
        btns[tabIndex].setAttribute('aria-selected', 'true');
    }
}