import { state, searchInput, clearIcon, searchIcon, GLOBAL_AUTHOR_ID } from "../../config.js";
import { tmpl } from "../../ui/render.js";
export function applyFilterAndRender() {
  requestAnimationFrame(() => {
    Plyr.setup('.js-player', {
      controls: [
        'play-large',
        'restart',
        'rewind',
        'play',
        'fast-forward',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'download',
        'fullscreen',
      ],
      settings: ['captions', 'quality', 'speed'],
      tooltips: { controls: true, seek: true },
      clickToPlay: true,
      autoplay: false,
      muted: false,
      loop: { active: false },
    });
  });
  let items = state.postsStore;
  switch (state.currentFilter) {
    case "Featured":
      items = items.filter((p) => p.isFeatured);
      break;
    case "My Posts":
      items = items.filter((p) => p.authorId === GLOBAL_AUTHOR_ID);
      break;
    case "Saved Posts":
      items = items.filter((p) => p.hasBookmarked);
      break;
  }
  if (state.currentFileFilter !== "All") {
    items = items.filter((p) => p.fileType === state.currentFileFilter);
  }
  if (state.currentSearchTerm) {
    const q = state.currentSearchTerm.toLowerCase();
    items = items.filter(
      (p) =>
        p.authorName.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }
  if (items.length === 0) {
    $("#forum-root").html(
      '<div class="empty-state text-center p-4">No posts found.</div>'
    );
  } else {
    $("#forum-root").html(tmpl.render(items));
  }
}

export function initFilterHandlers() {
$(document).on("click", ".filter-btn", function () {
  state.currentFilter = $(this).data("filter");
  $(".filter-btn").removeClass("active");
  $(this).addClass("active");
  applyFilterAndRender();
});

// toggle menu
$("#file-filter-btn").on("click", function (e) {
  e.stopPropagation();
  $(".file-filter").toggleClass("open");
});

// pick a file type
$(document).on("click", "#file-filter-menu li", function () {
  const type = $(this).data("type");
  state.currentFileFilter = type;

  // update button label & active menu item
  $("#file-filter-btn").text(type + " ▾");
  $("#file-filter-menu li").removeClass("active");
  $(this).addClass("active");

  // close dropdown and re-render
  $(".file-filter").removeClass("open");
  applyFilterAndRender();
});

// click outside to close
$(document).on("click", function (e) {
  if (!$(e.target).closest(".file-filter").length) {
    $(".file-filter").removeClass("open");
  }
});

searchInput.addEventListener("input", (e) => {
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => {
    const q = e.target.value.trim();
    state.currentSearchTerm = q;
    if (q) {
      clearIcon.classList.remove("hidden");
      searchIcon.classList.add("hidden");
    } else {
      clearIcon.classList.add("hidden");
      searchIcon.classList.remove("hidden");
    }
    applyFilterAndRender();
    removeHighlights(document.getElementById("forum-root"));
    if (q) highlightMatches(document.getElementById("forum-root"), q);
  }, 300);
});

clearIcon.addEventListener("click", () => {
  searchInput.value = "";
  clearIcon.classList.add("hidden");
  searchIcon.classList.remove("hidden");
  state.currentSearchTerm = "";
  applyFilterAndRender();
  removeHighlights(document.getElementById("forum-root"));
});
}

function highlightMatches(el, query) {
  const terms = query.split(/\s+/).filter(Boolean);
  const regex = new RegExp(
    "(" +
      terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
      ")",
    "gi"
  );
  traverse(el);

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.nodeValue;
      if (regex.test(txt)) {
        const span = document.createElement("span");
        span.innerHTML = txt.replace(regex, "<mark>$1</mark>");
        node.replaceWith(span);
      }
    } else {
      node.childNodes.forEach(traverse);
    }
  }
}

function removeHighlights(el) {
  el.querySelectorAll("mark").forEach((m) => {
    m.replaceWith(document.createTextNode(m.textContent));
  });
}



