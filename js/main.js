// Opens or closes the mobile nav menu
function toggleMenu() {
    var menu = document.getElementById("nav-menu");
    var btn = document.querySelector(".menu-btn");
    if (menu.className.indexOf("nav-open") !== -1) {
        menu.className = "nav-links";
        if (btn) {
            btn.setAttribute("aria-expanded", "false");
        }
    } else {
        menu.className = "nav-links nav-open";
        if (btn) {
            btn.setAttribute("aria-expanded", "true");
        }
    }
}

var CHAR_IMG_BASE = "images/characters/";

// Characters page: before/after style blend (game base layer, Netflix clipped by range)
function initCharacterPortraitSliders() {
    document.querySelectorAll("button[data-portrait-toggle]").forEach(function (btn) {
        if (btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });

    document.querySelectorAll(".char-card-wrap:not(.char-card-wrap--no-toggle)").forEach(function (card, idx) {
        var img = card.querySelector(".char-thumb-wrap img[data-img-base]");
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

        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }

        thumbWrap.textContent = "";
        thumbWrap.classList.add("char-compare");

        var inner = document.createElement("div");
        inner.className = "char-compare__inner";
        inner.style.setProperty("--reveal", "0%");

        var gameImg = document.createElement("img");
        gameImg.className = "char-compare__game";
        gameImg.src = gameSrc;
        gameImg.alt = alt;
        gameImg.setAttribute("width", "280");
        gameImg.setAttribute("height", "220");

        var netflixImg = document.createElement("img");
        netflixImg.className = "char-compare__netflix";
        netflixImg.src = netflixSrc;
        netflixImg.alt = alt ? alt + " (Netflix)" : "Netflix portrayal";
        netflixImg.setAttribute("width", "280");
        netflixImg.setAttribute("height", "220");

        inner.appendChild(gameImg);
        inner.appendChild(netflixImg);

        var rangeId = "portrait-range-" + idx;

        var label = document.createElement("label");
        label.className = "char-compare__label";
        label.setAttribute("for", rangeId);
        label.textContent = "Game vs Netflix portrait";

        var range = document.createElement("input");
        range.type = "range";
        range.id = rangeId;
        range.className = "char-compare__range";
        range.min = "0";
        range.max = "100";
        range.value = "0";
        range.setAttribute("aria-valuemin", "0");
        range.setAttribute("aria-valuemax", "100");
        range.setAttribute("aria-valuetext", "Game portrayal");

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

        range.addEventListener("input", function () {
            var v = range.value;
            inner.style.setProperty("--reveal", v + "%");
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
            inner.style.setProperty("--reveal", "0%");
            range.setAttribute("disabled", "disabled");
            range.setAttribute("aria-disabled", "true");
            label.textContent = "Portrait (game only)";
        });

        card.setAttribute("data-compare-init", "1");
    });

    document.querySelectorAll(".char-card-wrap--no-toggle").forEach(function (card) {
        if (card.getAttribute("data-single-portrait-init") === "1") {
            return;
        }
        var thumbWrap = card.querySelector(".char-thumb-wrap");
        var link = card.querySelector(".char-card-link");
        if (!thumbWrap || !link) {
            return;
        }
        var img = thumbWrap.querySelector(":scope > img");
        if (!img) {
            return;
        }
        if (thumbWrap.parentNode === link) {
            link.parentNode.insertBefore(thumbWrap, link);
        }
        thumbWrap.classList.add("char-compare", "char-compare--single");
        var inner = document.createElement("div");
        inner.className = "char-compare__inner";
        thumbWrap.removeChild(img);
        img.classList.add("char-compare__game");
        if (!img.getAttribute("width")) {
            img.setAttribute("width", "280");
        }
        if (!img.getAttribute("height")) {
            img.setAttribute("height", "220");
        }
        inner.appendChild(img);
        thumbWrap.appendChild(inner);
        card.setAttribute("data-single-portrait-init", "1");
    });
}

// Books page: live search table rows (title / year / type text)
function initBooksPage() {
    var section = document.getElementById("books-table-section");
    if (!section) {
        return;
    }
    var searchInput = document.getElementById("book-table-search");
    var rows = section.querySelectorAll("tbody tr[data-search-text]");

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

    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();
}


// Bestiary: filter beast cards (same pattern as books table search)
function initBestiaryPage() {
    var section = document.getElementById("bestiary-catalog-section");
    if (!section) {
        return;
    }
    var searchInput = document.getElementById("bestiary-search");
    var cards = section.querySelectorAll(".bestiary-beast-card[data-search-text]");
    var chipNav = document.querySelector("nav.bestiary-chip-nav");
    var activeCategoryId = null;

    function updateChipActive() {
        if (!chipNav) {
            return;
        }
        var allChips = chipNav.querySelectorAll(".bestiary-chip");
        var j;
        for (j = 0; j < allChips.length; j++) {
            var c = allChips[j];
            c.classList.remove("bestiary-chip--active");
            if (c.getAttribute("data-bestiary-filter") === "all") {
                if (!activeCategoryId) {
                    c.classList.add("bestiary-chip--active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            } else {
                var tid = c.getAttribute("data-target");
                if (tid && tid === activeCategoryId) {
                    c.classList.add("bestiary-chip--active");
                    c.setAttribute("aria-current", "true");
                } else {
                    c.removeAttribute("aria-current");
                }
            }
        }
    }

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

    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }
    applySearch();
}

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

function highlightText(element, query) {
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

function restoreText(element) {
    var marks = element.querySelectorAll("mark");
    for (var i = 0; i < marks.length; i++) {
        var mark = marks[i];
        var parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    }
}

// Lore page: filter topic sections by typed query
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
                    section.removeAttribute("hidden");
                    visibleCount++;
                } else {
                    var text = section.textContent.toLowerCase();
                    if (text.indexOf(query) !== -1) {
                        section.removeAttribute("hidden");
                        highlightText(section, query);
                        visibleCount++;
                    } else {
                        section.setAttribute("hidden", "");
                    }
                }
            }

            if (noResults) {
                if (visibleCount === 0 && query !== "") {
                    noResults.removeAttribute("hidden");
                } else {
                    noResults.setAttribute("hidden", "");
                }
            }
        });
    }
}

function initLoginPage() {
    var form = document.querySelector(".login-page form");
    var err = document.getElementById("login-error");
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var togglePw = document.getElementById("toggle-pw");
    if (!form || !err) {
        return;
    }
    if (togglePw && password) {
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
    { lightboxId: "gwent-lightbox", sourceId: "gwent-lightbox-source", thumbSelector: ".faction-hero-img" }
];

function attachImageLightbox(root, source, thumbSelector) {
    var modalImg = root.querySelector(".gallery-lightbox__img");
    var captionEl = root.querySelector(".gallery-lightbox__caption");
    var closeBtn = root.querySelector(".gallery-lightbox__close");
    var backdrop = root.querySelector(".gallery-lightbox__backdrop");
    if (!modalImg || !captionEl || !closeBtn || !backdrop) {
        return;
    }

    var prevBodyOverflow = "";

    function openModal(thumb) {
        modalImg.src = thumb.getAttribute("src") || "";
        modalImg.alt = thumb.getAttribute("alt") || "";
        var cap = thumb.nextElementSibling;
        var text = "";
        if (cap && cap.tagName === "P") {
            text = String(cap.textContent || "").trim();
        } else {
            text = String(thumb.getAttribute("alt") || "").trim();
        }
        captionEl.textContent = text;
        root.removeAttribute("hidden");
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    function closeModal() {
        root.setAttribute("hidden", "");
        document.body.style.overflow = prevBodyOverflow;
    }

    source.querySelectorAll(thumbSelector).forEach(function (thumb) {
        thumb.addEventListener("click", function () {
            openModal(thumb);
        });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
        if (!root.hasAttribute("hidden") && e.key === "Escape") {
            closeModal();
        }
    });
}

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

function initGalleryLightbox() {
    initImageLightboxes();
}

function initBackToTopButton() {
    var scrollBtn = document.getElementById("back-to-top");
    if (!scrollBtn) {
        return;
    }

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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        initLoginPage();
        initCharacterPortraitSliders();
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
    initBooksPage();
    initLorePage();
    initBestiaryPage();
    fillBestiaryChipCounts();
    initGalleryLightbox();
    initBackToTopButton();
}

function switchSchool(schoolId) {
    var panels = document.querySelectorAll('.school-panel');
    var buttons = document.querySelectorAll('.school-tab-btn');
    var rows = document.querySelectorAll('.comparison-table tbody tr');

    for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
        panels[i].setAttribute('aria-hidden', 'true');
    }

    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
        buttons[j].setAttribute('aria-selected', 'false');
    }

    for (var k = 0; k < rows.length; k++) {
        rows[k].classList.remove('table-row--active');
    }

    var activePanel = document.getElementById('panel-' + schoolId);
    var activeBtn = document.getElementById('tab-' + schoolId);

    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.removeAttribute('aria-hidden');
    }

    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }

    var activeRow = document.querySelector('.comparison-table tbody tr[data-school="' + schoolId + '"]');
    if (activeRow) {
        activeRow.classList.add('table-row--active');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('panel-wolf')) {
        switchSchool('wolf');
    }
});