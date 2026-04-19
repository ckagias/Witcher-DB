// Closes the mobile nav drawer and resets the burger button to its default state.
function closeNavMenu() {
    const menu = document.getElementById("nav-menu");
    const btn = document.querySelector(".menu-btn");
    if (!menu) return;
    menu.classList.remove("nav-open");
    document.body.classList.remove("nav-drawer-open");
    if (btn) {
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
    }
}

// Toggles the mobile nav drawer open or closed each time the burger button is tapped.
function toggleMenu() {
    const menu = document.getElementById("nav-menu");
    const btn = document.querySelector(".menu-btn");
    if (!menu) return;
    if (menu.classList.contains("nav-open")) {
        closeNavMenu();
    } else {
        menu.classList.add("nav-open");
        document.body.classList.add("nav-drawer-open");
        if (btn) {
            btn.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
        }
    }
}

const CHAR_IMG_BASE = "images/characters/";

// Highlights the active filter chip and clears the highlight from all others.
// filterAttr is the data-* attribute name used to identify the "show all" chip.
function updateChipActiveState(chipNav, activeCategoryId, filterAttr) {
    if (!chipNav) { return; }
    const allChips = chipNav.querySelectorAll(".bestiary-chip");
    for (let j = 0; j < allChips.length; j++) {
        const c = allChips[j];
        c.classList.remove("bestiary-chip-active");
        if (c.getAttribute(filterAttr) === "all") {
            if (!activeCategoryId) {
                c.classList.add("bestiary-chip-active");
                c.setAttribute("aria-current", "true");
            } else {
                c.removeAttribute("aria-current");
            }
        } else {
            const tid = c.getAttribute("data-target");
            if (tid && tid === activeCategoryId) {
                c.classList.add("bestiary-chip-active");
                c.setAttribute("aria-current", "true");
            } else {
                c.removeAttribute("aria-current");
            }
        }
    }
}

// Hides every tab panel inside `scope` then shows only the one matching `tabId`.
function switchTabPanel(scope, tabId) {
    const btns = scope.querySelectorAll(".tab-btn");
    const panels = scope.querySelectorAll(".tab-panel");
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
        btns[i].setAttribute("aria-selected", "false");
    }
    for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove("active");
        panels[i].setAttribute("aria-hidden", "true");
    }
    const activePanel = document.getElementById("panel-" + tabId);
    if (activePanel) {
        activePanel.classList.add("active");
        activePanel.removeAttribute("aria-hidden");
    }
}

// Builds the game-vs-Netflix portrait slider on every character card that has a Netflix image.
function initCharacterPortraitSliders() {
    document.querySelectorAll(".char-card-wrap:not(.char-card-wrap-no-toggle)").forEach(function (card, idx) {
        const img = card.querySelector(".char-thumb-wrap img[data-img-base]");
        if (!img || card.getAttribute("data-compare-init") === "1") {
            return;
        }
        const thumbWrap = card.querySelector(".char-thumb-wrap");
        const link = card.querySelector(".char-card-link");
        if (!thumbWrap || !link) {
            return;
        }

        const baseFile = img.getAttribute("data-img-base");
        const gameSrc = img.getAttribute("src");
        const netflixSrc = CHAR_IMG_BASE + "netflix/" + baseFile;
        const alt = img.getAttribute("alt") || "";

        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }

        thumbWrap.textContent = "";
        thumbWrap.classList.add("char-compare");

        const inner = document.createElement("div");
        inner.className = "char-compare-inner";

        const gameImg = document.createElement("img");
        gameImg.className = "char-compare-game";
        gameImg.src = gameSrc;
        gameImg.alt = alt;
        gameImg.setAttribute("width", "280");
        gameImg.setAttribute("height", "220");

        const netflixImg = document.createElement("img");
        netflixImg.className = "char-compare-netflix";
        netflixImg.src = netflixSrc;
        netflixImg.alt = alt ? alt + " (Netflix)" : "Netflix portrayal";
        netflixImg.setAttribute("width", "280");
        netflixImg.setAttribute("height", "220");
        netflixImg.style.clipPath = "inset(0 100% 0 0)";

        inner.appendChild(gameImg);
        inner.appendChild(netflixImg);

        const rangeId = "portrait-range-" + idx;

        const label = document.createElement("label");
        label.className = "char-compare-label";
        label.setAttribute("for", rangeId);
        label.textContent = "Game vs Netflix portrait";

        const range = document.createElement("input");
        range.type = "range";
        range.id = rangeId;
        range.className = "char-compare-range";
        range.min = "0";
        range.max = "100";
        range.value = "0";
        range.setAttribute("aria-valuemin", "0");
        range.setAttribute("aria-valuemax", "100");
        range.setAttribute("aria-valuetext", "Game portrayal");

        function syncAria(v) {
            const n = Number(v);
            if (n <= 5) {
                range.setAttribute("aria-valuetext", "Game portrayal");
            } else if (n >= 95) {
                range.setAttribute("aria-valuetext", "Netflix portrayal");
            } else {
                range.setAttribute("aria-valuetext", n + "% blend toward Netflix");
            }
        }

        range.addEventListener("input", function () {
            const v = range.value;
            netflixImg.style.clipPath = "inset(0 calc(100% - " + v + "%) 0 0)";
            syncAria(v);
        });

        range.addEventListener("click", function (e) {
            e.stopPropagation();
        });
        range.addEventListener("mousedown", function (e) {
            e.stopPropagation();
        });

        thumbWrap.appendChild(inner);
        thumbWrap.appendChild(label);
        thumbWrap.appendChild(range);

        netflixImg.addEventListener("error", function () {
            netflixImg.style.display = "none";
            netflixImg.style.clipPath = "";
            range.disabled = true;
            range.setAttribute("aria-disabled", "true");
            label.textContent = "Portrait (game only)";
        });

        card.setAttribute("data-compare-init", "1");
    });

    document.querySelectorAll(".char-card-wrap-no-toggle").forEach(function (card) {
        if (card.getAttribute("data-single-portrait-init") === "1") {
            return;
        }
        const thumbWrap = card.querySelector(".char-thumb-wrap");
        const link = card.querySelector(".char-card-link");
        if (!thumbWrap || !link) {
            return;
        }
        const compareLabel = card.querySelector(".char-compare-label");
        const img = thumbWrap.querySelector(":scope > img");
        if (!img) {
            return;
        }
        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }
        thumbWrap.classList.add("char-compare", "char-compare-single");
        const inner = document.createElement("div");
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

// Live search box on the books table — hides rows that don't match as you type.
function initBooksPage() {
    const section = document.getElementById("books-table-section");
    if (!section) { return; }
    const searchInput = document.getElementById("book-table-search");
    const rows = section.querySelectorAll("tbody tr[data-search-text]");
    const emptyMsg = document.getElementById("books-search-empty");
    const thead = section.querySelector("thead");

    function applySearch() {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let visible = 0;
        rows.forEach(function (tr) {
            const hay = tr.getAttribute("data-search-text") || "";
            const ok = !q || hay.includes(q);
            if (ok) {
                tr.removeAttribute("hidden");
                visible++;
            } else {
                tr.setAttribute("hidden", "");
            }
        });
        const noMatches = q && visible === 0;
        if (emptyMsg) {
            if (noMatches) {
                emptyMsg.removeAttribute("hidden");
            } else {
                emptyMsg.setAttribute("hidden", "");
            }
        }
        if (thead) {
            if (noMatches) {
                thead.setAttribute("hidden", "");
            } else {
                thead.removeAttribute("hidden");
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();
}

// Sets up category chip filtering and live text search for the bestiary creature grid.
function initBestiaryPage() {
    const section = document.getElementById("bestiary-catalog-section");
    if (!section) { return; }
    const searchInput = document.getElementById("bestiary-search");
    const cards = section.querySelectorAll(".bestiary-beast-card[data-search-text]");
    const chipNav = document.querySelector("nav.bestiary-chip-nav");
    let activeCategoryId = null;

    function updateChipActive() {
        updateChipActiveState(chipNav, activeCategoryId, "data-bestiary-filter");
    }

    function applySearch() {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
            const hay = card.getAttribute("data-search-text") || "";
            const ok = !q || hay.includes(q);
            if (ok) {
                card.removeAttribute("hidden");
            } else {
                card.setAttribute("hidden", "");
            }
        });
        const cats = section.querySelectorAll(".bestiary-category");
        if (activeCategoryId) {
            cats.forEach(function (cat) {
                if (cat.id !== activeCategoryId) {
                    cat.setAttribute("hidden", "");
                } else {
                    const visible = cat.querySelector(".bestiary-beast-card:not([hidden])");
                    if (visible) {
                        cat.removeAttribute("hidden");
                    } else {
                        cat.setAttribute("hidden", "");
                    }
                }
            });
        } else {
            cats.forEach(function (cat) {
                const visible = cat.querySelector(".bestiary-beast-card:not([hidden])");
                if (visible) {
                    cat.removeAttribute("hidden");
                } else {
                    cat.setAttribute("hidden", "");
                }
            });
        }

        const emptyEl = document.getElementById("bestiary-empty");
        if (emptyEl) {
            const anyCard = section.querySelectorAll(
                ".bestiary-category:not([hidden]) .bestiary-beast-card:not([hidden])"
            ).length;
            if (q && anyCard === 0) {
                emptyEl.removeAttribute("hidden");
            } else {
                emptyEl.setAttribute("hidden", "");
            }
        }
    }

    if (chipNav) {
        const showAllChip = chipNav.querySelector("[data-bestiary-filter=\"all\"]");
        if (showAllChip) {
            showAllChip.addEventListener("click", function (e) {
                e.preventDefault();
                activeCategoryId = null;
                updateChipActive();
                applySearch();
            });
        }
        chipNav.querySelectorAll(".bestiary-chip[data-target]").forEach(function (chip) {
            if (chip.getAttribute("data-bestiary-filter") === "all") { return; }
            chip.addEventListener("click", function (e) {
                e.preventDefault();
                const target = chip.getAttribute("data-target");
                activeCategoryId = target || null;
                updateChipActive();
                applySearch();
            });
        });
        updateChipActive();
    }

    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();

    cards.forEach(function (card) {
        const link = card.querySelector(".bestiary-card-link");
        if (!link) { return; }

        const img = link.querySelector("img.gallery-img");
        if (img && img.parentNode === link) {
            link.parentNode.insertBefore(img, link);
        }

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "link");

        function shouldIgnoreCardClick(target) {
            if (!target) { return false; }
            if (target.tagName === "A" || target.tagName === "BUTTON" || target.tagName === "INPUT") {
                return true;
            }
            if (target.closest && target.closest(".gallery-img")) { return true; }
            return false;
        }

        card.addEventListener("click", function (e) {
            if (shouldIgnoreCardClick(e.target)) { return; }
            window.open(link.href, link.target || "_self", "noopener,noreferrer");
        });

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

// Sets up category chip filtering, live text search, and whole-card click navigation on the characters page.
function initCharactersPage() {
    const chipNav = document.getElementById("char-chip-nav");
    if (!chipNav) { return; }
    const cards = document.querySelectorAll(".card.char-card-wrap[data-category]");
    const searchInput = document.getElementById("characters-search");
    let activeCategoryId = null;
    const catSynonyms = {
        witcher: "witcher wolf school",
        sorceress: "sorceress sorcerer mage magic",
        royalty: "royalty crown king queen",
        companion: "companion ally",
        antagonist: "antagonist villain"
    };

    function updateChipActive() {
        updateChipActiveState(chipNav, activeCategoryId, "data-char-filter");
    }

    function buildCharSearchHaystack(card) {
        const bits = [];
        const extra = card.getAttribute("data-search-text");
        if (extra) {
            bits.push(extra);
        }
        const cat = card.getAttribute("data-category") || "";
        bits.push(cat);
        if (cat && catSynonyms[cat]) {
            bits.push(catSynonyms[cat]);
        }
        const nameLink = card.querySelector(".char-card-link");
        if (nameLink) {
            bits.push(nameLink.textContent);
        }
        const role = card.querySelector(".char-role");
        if (role) {
            bits.push(role.textContent);
        }
        card.querySelectorAll("article > p").forEach(function (p) {
            if (p.classList.contains("char-role")) {
                return;
            }
            bits.push(p.textContent);
        });
        return bits.join(" ").replace(/\s+/g, " ").trim().toLowerCase();
    }

    function applyCombined() {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cat = card.getAttribute("data-category") || "";
            if (activeCategoryId && cat !== activeCategoryId) {
                card.setAttribute("hidden", "");
                continue;
            }
            if (!q) {
                card.removeAttribute("hidden");
                continue;
            }
            let hay = card.__charSearchHay;
            if (hay === undefined) {
                hay = buildCharSearchHaystack(card);
                card.__charSearchHay = hay;
            }
            if (hay.includes(q)) {
                card.removeAttribute("hidden");
            } else {
                card.setAttribute("hidden", "");
            }
        }

        const emptyMsg = document.getElementById("characters-search-empty");
        if (emptyMsg) {
            let visible = 0;
            for (let j = 0; j < cards.length; j++) {
                if (!cards[j].hasAttribute("hidden")) {
                    visible++;
                }
            }
            if (q && visible === 0) {
                emptyMsg.removeAttribute("hidden");
            } else {
                emptyMsg.setAttribute("hidden", "");
            }
        }
    }

    const showAllChip = chipNav.querySelector("[data-char-filter=\"all\"]");
    if (showAllChip) {
        showAllChip.addEventListener("click", function (e) {
            e.preventDefault();
            activeCategoryId = null;
            updateChipActive();
            applyCombined();
        });
    }
    chipNav.querySelectorAll(".bestiary-chip[data-target]").forEach(function (chip) {
        if (chip.getAttribute("data-char-filter") === "all") {
            return;
        }
        chip.addEventListener("click", function (e) {
            e.preventDefault();
            const target = chip.getAttribute("data-target");
            activeCategoryId = target || null;
            updateChipActive();
            applyCombined();
        });
    });
    if (searchInput) {
        searchInput.addEventListener("input", applyCombined);
    }
    updateChipActive();
    applyCombined();

    document.querySelectorAll(".card.char-card-wrap").forEach(function (card) {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "link");
        const link = card.querySelector(".char-card-link");
        if (!link) { return; }
        card.addEventListener("click", function (e) {
            const t = e.target;
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

// Counts the cards in each bestiary section and writes the number into each chip's count badge.
function fillBestiaryChipCounts() {
    const counts = document.querySelectorAll("[data-count-for]");
    for (let i = 0; i < counts.length; i++) {
        const sectionId = counts[i].getAttribute("data-count-for");
        const section = document.getElementById(sectionId);
        if (section) {
            const cards = section.querySelectorAll(".bestiary-beast-card");
            counts[i].textContent = cards.length;
        }
    }
}

const imageLightboxConfigs = [
    { lightboxId: "gallery-lightbox", sourceId: "gallery-page-grid", thumbSelector: ".gallery-img" },
    { lightboxId: "gwent-lightbox", sourceId: "gwent-lightbox-source", thumbSelector: ".faction-portrait-img" },
    { lightboxId: "series-lightbox", sourceId: "series-lightbox-source", thumbSelector: ".series-poster" },
    { lightboxId: "bestiary-lightbox", sourceId: "bestiary-catalog-section", thumbSelector: ".gallery-img" },
    { lightboxId: "books-lightbox", sourceId: "books-table-section", thumbSelector: ".book-thumb" },
    { lightboxId: "schools-lightbox", sourceId: "schools-lightbox-source", thumbSelector: ".school-thumb" },
    { lightboxId: "games-lightbox", sourceId: "games-page", thumbSelector: ".game-cover" }
];

// Returns the <img> for a thumbnail — the thumbnail itself if it's an img, otherwise a child img.
function lightboxThumbImage(thumb) {
    if (thumb.tagName === "IMG") {
        return thumb;
    }
    return thumb.querySelector("img");
}

// Attaches a full lightbox to one modal element: thumbnails open it, arrows navigate, Escape/backdrop close it.
function attachImageLightbox(root, source, thumbSelector) {
    const modalImg = root.querySelector(".gallery-lightbox-img");
    const captionEl = root.querySelector(".gallery-lightbox-caption");
    const closeBtn = root.querySelector(".gallery-lightbox-close");
    const backdrop = root.querySelector(".gallery-lightbox-backdrop");
    const prevBtn = root.querySelector(".gallery-lightbox-prev");
    const nextBtn = root.querySelector(".gallery-lightbox-next");
    if (!modalImg || !captionEl || !closeBtn || !backdrop) {
        return;
    }

    let prevBodyOverflow = "";
    const thumbs = [];
    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        if (lightboxThumbImage(thumb)) {
            thumbs.push(thumb);
        }
    });
    const canNavigate = Boolean(prevBtn && nextBtn && thumbs.length > 1);
    let activeIndex = -1;

    function openModal(thumb, options) {
        const img = lightboxThumbImage(thumb);
        if (!img) { return; }
        activeIndex = thumbs.indexOf(thumb);
        const chosenSrc = img.currentSrc || img.getAttribute("src") || "";
        modalImg.src = chosenSrc;
        modalImg.alt = img.getAttribute("alt") || "";
        const cap = img.nextElementSibling;
        let text = "";
        if (cap && cap.tagName === "P") {
            text = (cap.textContent || "").trim();
        } else {
            text = (img.getAttribute("alt") || "").trim();
        }
        captionEl.textContent = text;
        const wasHidden = root.hasAttribute("hidden");
        root.removeAttribute("hidden");
        if (wasHidden) {
            prevBodyOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        }
        if (!options || options.focus !== false) {
            closeBtn.focus();
        }
    }

    function closeModal() {
        root.setAttribute("hidden", "");
        document.body.style.overflow = prevBodyOverflow;
        prevBodyOverflow = "";
    }

    function step(delta) {
        if (!canNavigate || thumbs.length === 0) {
            return;
        }
        let idx = activeIndex;
        if (idx < 0) {
            idx = 0;
        }
        const nextIndex = (idx + delta + thumbs.length) % thumbs.length;
        openModal(thumbs[nextIndex], { focus: false });
    }

    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        if (!lightboxThumbImage(thumb)) { return; }
        thumb.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            openModal(thumb);
        });
        thumb.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                openModal(thumb);
            }
        });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            step(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            step(1);
        });
    }

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

// Loops through imageLightboxConfigs and initialises whichever lightboxes are present on the current page.
function initImageLightboxes() {
    for (let i = 0; i < imageLightboxConfigs.length; i++) {
        const cfg = imageLightboxConfigs[i];
        const rootEl = document.getElementById(cfg.lightboxId);
        const sourceEl = document.getElementById(cfg.sourceId);
        if (!rootEl || !sourceEl) { continue; }
        attachImageLightbox(rootEl, sourceEl, cfg.thumbSelector);
    }
}

// Initialises the feedback modal: open/close, focus trap, field validation, and simulated submit.
function initFeedbackModal() {
    const modal = document.getElementById("feedback-modal");
    if (!modal) {
        return;
    }
    const openBtn = document.getElementById("intro-feedback-btn");
    if (!openBtn) {
        return;
    }

    const closeBtn = modal.querySelector(".feedback-modal-close");
    const backdrop = modal.querySelector(".feedback-modal-backdrop");
    const form = document.getElementById("feedback-modal-form");
    const submitBtn = document.getElementById("feedback-modal-submit-btn");
    const resetBtn = document.getElementById("feedback-modal-reset-btn");
    const statusEl = document.getElementById("feedback-modal-status");
    const errEl = document.getElementById("feedback-modal-error");

    let prevBodyOverflow = "";
    let previouslyFocused = null;

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
        const focusable = getFocusable();
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
            if (previouslyFocused) { previouslyFocused.focus(); }
        }, 180);
    }

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
        const focusable = getFocusable();
        if (!focusable.length) {
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
        const label = form.querySelector('label[for="' + el.id + '"]');
        return label ? (label.textContent || "").trim() : "This field";
    }

    const emailInput = document.getElementById("fm-email");
    if (emailInput) {
        emailInput.addEventListener("input", function () {
            emailInput.setCustomValidity("");
        });
        emailInput.addEventListener("blur", function () {
            emailInput.setCustomValidity("");
            const v = (emailInput.value || "").trim();
            if (v && !v.includes("@")) {
                emailInput.setCustomValidity("Email addresses need an @ symbol. Example: name@example.com");
            }
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearMessages();
        if (!form.reportValidity()) {
            const firstInvalid = form.querySelector(":invalid");
            if (firstInvalid) {
                showError(fieldLabelFor(firstInvalid) + ": " + (firstInvalid.validationMessage || "Please check this field."));
                firstInvalid.focus();
            } else {
                showError("Please check the highlighted fields and try again.");
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending\u2026";

        window.setTimeout(function () {
            const offline = navigator.onLine === false;
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
            const first = document.getElementById("fm-fullname");
            if (first) { first.focus(); }
        });
    }
}

// Shows the back-to-top button after the user scrolls down 300px, hides it again at the top.
function initBackToTopButton() {
    const scrollBtn = document.getElementById("back-to-top");
    if (!scrollBtn) { return; }

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

function restoreScrollAfterReturn() {
    document.querySelectorAll(".gallery-lightbox:not([hidden])").forEach(function (lb) {
        lb.setAttribute("hidden", "");
    });
    if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initCharacterPortraitSliders();
    initCharactersPage();
    initBooksPage();
    initBestiaryPage();
    fillBestiaryChipCounts();
    initImageLightboxes();
    initBackToTopButton();
    initFeedbackModal();
    if (document.getElementById("panel-wolf")) {
        switchSchool("wolf");
    }
});

window.addEventListener("pageshow", restoreScrollAfterReturn);
window.addEventListener("focus", restoreScrollAfterReturn);
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        restoreScrollAfterReturn();
    }
});

function switchSchool(schoolId) {
    switchTabPanel(document, schoolId);
    const activeBtn = document.getElementById("tab-" + schoolId);
    if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.setAttribute("aria-selected", "true");
    }
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        const menu = document.getElementById("nav-menu");
        const btn = document.querySelector(".menu-btn");
        if (menu && menu.classList.contains("nav-open")) {
            closeNavMenu();
            if (btn) { btn.focus(); }
        }
    }
});

document.addEventListener("click", function (e) {
    const menu = document.getElementById("nav-menu");
    const btn = document.querySelector(".menu-btn");
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

function switchSeriesTab(tab) {
    const tabIds = ["series", "anime", "sirens"];
    const wrap = document.getElementById("series-lightbox-source");
    if (!wrap) {
        return;
    }
    switchTabPanel(wrap, tab);
    const tabIndex = tabIds.indexOf(tab);
    const btns = wrap.querySelectorAll(".tab-btn");
    if (tabIndex !== -1 && btns[tabIndex]) {
        btns[tabIndex].classList.add("active");
        btns[tabIndex].setAttribute("aria-selected", "true");
    }
}
