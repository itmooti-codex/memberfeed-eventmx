export function processContent(rawHtml) {
  const allowedTags = ['b', 'i', 'u', 'a', 'br', 'p', 'span', 'div', 'ul', 'ol', 'li', 'strong', 'em', 'iframe'];
  const allowedAttrs = ['href', 'target', 'class', 'style', 'data-mention-id', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'];

  const sanitize = html => DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttrs });
  rawHtml = sanitize(rawHtml);

  const extractLink = rawHtml.trim().match(/^(https?:\/\/[^\s]+)$/)?.[0] || null;
  const getMatch = (regex) => extractLink && regex.exec(extractLink);
  const yt = getMatch(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vi = getMatch(/vimeo\.com\/(\d+)/);
  const loom = getMatch(/loom\.com\/share\/([a-zA-Z0-9]+)/);

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const renderPreview = (platform, idPath, fullUrl) => {
    const domain = getDomain(fullUrl);
    return `
      <a class="block contentA mb-2" href="${fullUrl}" target="_blank" style="color: blue; text-decoration: underline;">${fullUrl}</a>
      <a href="${fullUrl}" target="_blank" class="flex flex-col items-start justify-center gap-4 self-stretch rounded bg-zinc-100 p-2">
        <div class="flex items-center justify-start gap-2 self-stretch rounded-xl">
          <div class="flex flex-1 flex-col items-start justify-center gap-1">
            <div class="justify-start text-center font-['Inter'] text-xs leading-none font-medium text-stone-950">${platform}</div>
            <div class="justify-start text-center font-['Inter'] text-xs leading-none font-normal text-neutral-500">${fullUrl}</div>
          </div>
          <div class="relative h-8 w-8 overflow-hidden">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H26C26.5304 28 27.0391 27.7893 27.4142 27.4142C27.7893 27.0391 28 26.5304 28 26V6C28 5.46957 27.7893 4.96086 27.4142 4.58579C27.0391 4.21071 26.5304 4 26 4ZM21 18C21 18.2652 20.8946 18.5196 20.7071 18.7071C20.5196 18.8946 20.2652 19 20 19C19.7348 19 19.4804 18.8946 19.2929 18.7071C19.1054 18.5196 19 18.2652 19 18V14.4137L12.7075 20.7075C12.6146 20.8004 12.5043 20.8741 12.3829 20.9244C12.2615 20.9747 12.1314 21.0006 12 21.0006C11.8686 21.0006 11.7385 20.9747 11.6171 20.9244C11.4957 20.8741 11.3854 20.8004 11.2925 20.7075C11.1996 20.6146 11.1259 20.5043 11.0756 20.3829C11.0253 20.2615 10.9994 20.1314 10.9994 20C10.9994 19.8686 11.0253 19.7385 11.0756 19.6171C11.1259 19.4957 11.1996 19.3854 11.2925 19.2925L17.5863 13H14C13.7348 13 13.4804 12.8946 13.2929 12.7071C13.1054 12.5196 13 12.2652 13 12C13 11.7348 13.1054 11.4804 13.2929 11.2929C13.4804 11.1054 13.7348 11 14 11H20C20.2652 11 20.5196 11.1054 20.7071 11.2929C20.8946 11.4804 21 11.7348 21 12V18Z" fill="#0963D8"/>
            </svg>
          </div>
        </div>
      </a>
    `;
  };

  if (yt) return renderPreview('YouTube', `watch?v=${yt[1]}`, `https://www.youtube.com/watch?v=${yt[1]}`);
  if (vi) return renderPreview('Vimeo', `video/${vi[1]}`, `https://player.vimeo.com/video/${vi[1]}`);
  if (loom) return renderPreview('Loom', `share/${loom[1]}`, `https://www.loom.com/share/${loom[1]}`);
  if (extractLink) return renderPreview(getDomain(extractLink), extractLink, extractLink);

  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  container.querySelectorAll("a").forEach(a => {
    const href = a.href;
    const matches = {
      yt: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(href),
      vi: /vimeo\.com\/(\d+)/.exec(href),
      loom: /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(href)
    };

    const makeIframe = (src, link) => `
      <a class="block mb-2" href="${link}" target="_blank" style="color: blue; text-decoration: underline;">${link}</a>
      <iframe class="!w-full" width="300" height="315" src="${src}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    `;

    let iframeHTML = null;
    if (matches.yt) iframeHTML = makeIframe(`https://www.youtube.com/embed/${matches.yt[1]}`, `https://www.youtube.com/watch?v=${matches.yt[1]}`);
    else if (matches.vi) iframeHTML = makeIframe(`https://player.vimeo.com/video/${matches.vi[1]}`, `https://player.vimeo.com/video/${matches.vi[1]}`);
    else if (matches.loom) iframeHTML = makeIframe(`https://www.loom.com/embed/${matches.loom[1]}`, `https://www.loom.com/share/${matches.loom[1]}`);

    if (iframeHTML) {
      const wrapper = document.createElement("span");
      wrapper.classList.add("video-tooltip-wrapper");
      const tooltip = document.createElement("span");
      tooltip.classList.add("video-tooltip");
      tooltip.innerHTML = iframeHTML;

      a.classList.add("video-link");
      a.setAttribute("target", "_blank");

      a.parentNode.insertBefore(wrapper, a);
      wrapper.appendChild(a);
      wrapper.appendChild(tooltip);
    } else {
      a.setAttribute("target", "_blank");
      a.style.color = "blue";
      a.style.textDecoration = "underline";
    }
  });

  return sanitize(container.innerHTML);
}
