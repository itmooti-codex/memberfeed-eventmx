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

export function formatContent(html = "") {
  if (!html) return "";
  html = decodeEntities(html);
  // convert anchor tags to open in new tab
  // if the link text is the url itself, also embed previews
  const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  html = html.replace(anchorRegex, (match, url, text) => {
    let normalized = url;
    if (!/^https?:\/\//i.test(url)) {
      normalized = `https://${url}`;
    }
    const embed = text.trim() === url.trim() ? buildEmbed(normalized) : "";
    return `<a href="${normalized}" target="_blank" rel="noopener noreferrer">${text}</a>` + embed;
  });

  // replace bare urls including those without protocol
  // avoid matching URLs inside HTML attributes or within anchor text
  // capture any leading character so we can reinsert it during replacement
  const urlRegex = /(^|[^"'>=])((?:https?:\/\/|www\.)[^\s<]+)/g;
  html = html.replace(urlRegex, (match, prefix, raw) => {
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const embed = buildEmbed(url);
    const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer">${raw}</a>`;
    return (prefix || "") + anchor + (embed || "");
  });
  return html;
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
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

