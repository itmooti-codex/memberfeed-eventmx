export function safeArray(x) {
  return Array.isArray(x) ? x : [];
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }
  return "just now";
}

export function parseDate(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp === "number") {
    return new Date(timestamp * 1000);
  }
  return new Date(timestamp);
}


function shouldEmbed(url) {
  return /(youtube\.com|youtu\.be|loom\.com|vimeo\.com)/i.test(url);
}


function buildEmbed(url) {
  let id;
  if (/youtu\.be\/.+|youtube\.com\/watch\?v=/.test(url)) {
    id = url.split(/v=|youtu\.be\//)[1];
    if (id) id = id.split(/[?&]/)[0];
    if (id) {
      return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen class="w-full h-64"></iframe></div>`;
    }
  } else if (/vimeo\.com\//.test(url)) {
    id = url.split(/vimeo\.com\//)[1];
    if (id) id = id.split(/[?&]/)[0];
    if (id) {
      return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${id}" frameborder="0" allowfullscreen class="w-full h-64"></iframe></div>`;
    }
  } else if (/loom\.com\//.test(url)) {
    id = url.split(/loom\.com\/[^/]*\/?/).pop();
    if (id) id = id.split(/[?&]/)[0];
    if (id) {
      return `<div class="video-embed"><iframe src="https://www.loom.com/embed/${id}" frameborder="0" allowfullscreen class="w-full h-64"></iframe></div>`;
    }
  }
  return "";
}

function decodeEntities(str) {
  if (typeof document !== "undefined" && document.createElement) {
    const div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent || div.innerText || "";
  }
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

