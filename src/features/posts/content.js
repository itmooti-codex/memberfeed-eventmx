export function processContent(rawHtml) {
  const allowedTags = [
    'b',
    'i',
    'u',
    'a',
    'br',
    'p',
    'span',
    'div',
    'ul',
    'ol',
    'li',
    'strong',
    'em'
  ];
  const allowedAttrs = [
    'href',
    'target',
    'class',
    'style',
    'data-mention-id'
  ];
  rawHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs
  });

  const isOnlyUrl = rawHtml.trim().match(/^(https?:\/\/[^\s]+)$/);
  const link = isOnlyUrl ? rawHtml.trim() : null;

  const yt =
    link &&
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(link);
  const vi = link && /vimeo\.com\/(\d+)/.exec(link);
  const loom = link && /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(link);

  if (yt) {
    return `
    <a class="block mb-2" href="https://www.youtube.com/watch?v=${yt[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.youtube.com/watch?v=${yt[1]}</a>
    <a href="https://www.youtube.com/watch?v=${yt[1]}" target="_blank" class="flex justify-center items-center w-full h-[315px] bg-[var(--color-primary-shade)]">
    <svg class="size-[100px] " width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.99992 2.76666C7.20592 2.76666 6.27992 2.78533 5.37725 2.81066L5.34058 2.812C4.42192 2.838 3.68059 2.85866 3.09659 2.95533C2.48792 3.056 1.98259 3.24866 1.57859 3.664C1.17325 4.08066 0.996585 4.596 0.913252 5.21266C0.833252 5.806 0.833252 6.558 0.833252 7.49266V8.50866C0.833252 9.442 0.833252 10.194 0.913252 10.788C0.995919 11.4047 1.17325 11.92 1.57859 12.3367C1.98259 12.7527 2.48792 12.9447 3.09659 13.0453C3.68059 13.142 4.42192 13.1627 5.34058 13.1887L5.37725 13.19C6.28058 13.2153 7.20592 13.234 7.99992 13.234C8.79392 13.234 9.71992 13.2153 10.6226 13.19L10.6593 13.1887C11.5779 13.1627 12.3193 13.142 12.9033 13.0453C13.5119 12.9447 14.0173 12.752 14.4213 12.3367C14.8266 11.92 15.0039 11.4047 15.0866 10.788C15.1666 10.1947 15.1666 9.44266 15.1666 8.508V7.492C15.1666 6.558 15.1666 5.806 15.0866 5.21266C15.0039 4.596 14.8266 4.08066 14.4213 3.664C14.0173 3.248 13.5119 3.056 12.9033 2.95533C12.3193 2.85866 11.5779 2.838 10.6586 2.812L10.6226 2.81066C9.7486 2.78414 8.8743 2.76947 7.99992 2.76666ZM7.24792 9.76733C7.17189 9.81076 7.08579 9.83346 6.99823 9.83317C6.91067 9.83287 6.82472 9.80959 6.74899 9.76564C6.67326 9.7217 6.61039 9.65864 6.56668 9.58277C6.52297 9.50691 6.49995 9.42089 6.49992 9.33333V6.66666C6.49995 6.5791 6.52297 6.49309 6.56668 6.41722C6.61039 6.34135 6.67326 6.27829 6.74899 6.23435C6.82472 6.19041 6.91067 6.16712 6.99823 6.16683C7.08579 6.16653 7.17189 6.18923 7.24792 6.23266L9.58125 7.566C9.65773 7.60975 9.72128 7.67292 9.76549 7.74914C9.80969 7.82535 9.83297 7.91189 9.83297 8C9.83297 8.0881 9.80969 8.17464 9.76549 8.25085C9.72128 8.32707 9.65773 8.39025 9.58125 8.434L7.24792 9.76733Z" fill="#F81818"/>
</svg>

    </a>
    `;
  } else if (vi) {
    return `
    <a class="block mb-2" href="https://player.vimeo.com/video/${vi[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://player.vimeo.com/video/${vi[1]}</a>
    <a href="https://player.vimeo.com/video/${vi[1]}" target="_blank" class="flex justify-center items-center w-full h-[315px] bg-[var(--color-primary-shade)]">
   <svg width="16" height="16" class="size-[100px] " viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.6 1H2.4C2.0287 1 1.6726 1.1475 1.41005 1.41005C1.1475 1.6726 1 2.0287 1 2.4V13.6C1 13.9713 1.1475 14.3274 1.41005 14.5899C1.6726 14.8525 2.0287 15 2.4 15H13.6C13.9713 15 14.3274 14.8525 14.5899 14.5899C14.8525 14.3274 15 13.9713 15 13.6V2.4C15 2.0287 14.8525 1.6726 14.5899 1.41005C14.3274 1.1475 13.9713 1 13.6 1ZM12.7775 5.64625C12.7308 6.63208 12.0454 7.9825 10.7212 9.6975C9.3475 11.4475 8.175 12.375 7.22125 12.375C6.62625 12.375 6.13625 11.8325 5.725 10.7388C4.92875 7.825 4.5875 6.11875 3.975 6.11875C3.68717 6.23499 3.41869 6.39431 3.17875 6.59125L2.70625 5.97875C3.87 4.955 4.98125 3.8175 5.68125 3.75625C6.38125 3.695 6.915 4.22 7.125 5.375C7.7725 9.47875 8.06125 10.1 9.23375 8.23625C9.56509 7.78199 9.79759 7.26335 9.91625 6.71375C10.03 5.6725 9.11125 5.7425 8.48125 6.01375C8.96542 4.38042 9.9075 3.58417 11.3075 3.625C12.3458 3.66 12.8358 4.33375 12.7775 5.64625Z" fill="#00CFFB"/>
</svg>



    </a>`;
  } else if (loom) {
    return `
    <a class="block mb-2" href="https://www.loom.com/share/${loom[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.loom.com/share/${loom[1]}</a>

    <a href="https://www.loom.com/share/${loom[1]}" target="_blank" class="flex justify-center items-center w-full h-[315px] bg-[var(--color-primary-shade)]">
  <svg width="16" height="16"  class="size-[100px] " viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_187_3829)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.33341 0.666687C2.62617 0.666687 1.94789 0.947639 1.4478 1.44774C0.9477 1.94783 0.666748 2.62611 0.666748 3.33335V12.6667C0.666748 13.3739 0.9477 14.0522 1.4478 14.5523C1.94789 15.0524 2.62617 15.3334 3.33341 15.3334H12.6667C13.374 15.3334 14.0523 15.0524 14.5524 14.5523C15.0525 14.0522 15.3334 13.3739 15.3334 12.6667V3.33335C15.3334 2.62611 15.0525 1.94783 14.5524 1.44774C14.0523 0.947639 13.374 0.666687 12.6667 0.666687H3.33341ZM7.51541 2.66669H8.48475V6.19069L10.2467 3.13869L11.0867 3.62335L9.32475 6.67535L12.3767 4.91335L12.8614 5.75335L9.80941 7.51535H13.3334V8.48469H9.80941L12.8614 10.2467L12.3767 11.0867L9.32475 9.32469L11.0867 12.376L10.2467 12.8614L8.48475 9.80935V13.3334H7.51541V9.80935L5.75341 12.8614L4.91341 12.376L6.67541 9.32469L3.62408 11.0867L3.13875 10.2467L6.19075 8.48469H2.66675V7.51535H6.19075L3.13875 5.75335L3.62341 4.91335L6.67541 6.67535L4.91341 3.62335L5.75341 3.13869L7.51541 6.19002V2.66669ZM9.45475 8.00002C9.45475 8.38582 9.30149 8.75582 9.02869 9.02863C8.75588 9.30143 8.38588 9.45469 8.00008 9.45469C7.61428 9.45469 7.24428 9.30143 6.97148 9.02863C6.69867 8.75582 6.54541 8.38582 6.54541 8.00002C6.54541 7.61422 6.69867 7.24422 6.97148 6.97142C7.24428 6.69861 7.61428 6.54535 8.00008 6.54535C8.38588 6.54535 8.75588 6.69861 9.02869 6.97142C9.30149 7.24422 9.45475 7.61422 9.45475 8.00002Z" fill="#5751EC"/>
</g>
<defs>
<clipPath id="clip0_187_3829">
<rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>

    </a>`;
  } else if (link) {
    return `<a class="block mb-2" href="${link}" target="_blank" style="color: blue; text-decoration: underline;">${link}</a>`;
  }

  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  container.querySelectorAll("a").forEach((a) => {
    const href = a.href;

    const ytMatch =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(href);
    const viMatch = /vimeo\.com\/(\d+)/.exec(href);
    const loomMatch = /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(href);

    let iframeHTML = null;

    if (ytMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://www.youtube.com/watch?v=${ytMatch[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.youtube.com/watch?v=${ytMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    } else if (viMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://player.vimeo.com/video/${viMatch[1]}"target="_blank" style="color: blue; text-decoration: underline;">https://player.vimeo.com/video/${viMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://player.vimeo.com/video/${viMatch[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
    } else if (loomMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://www.loom.com/share/${loomMatch[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.loom.com/share/${loomMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://www.loom.com/embed/${loomMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    }

    if (iframeHTML) {
      a.classList.add("video-link");
      a.setAttribute("target", "_blank");

      const tooltipWrapper = document.createElement("span");
      tooltipWrapper.classList.add("video-tooltip-wrapper");

      const tooltip = document.createElement("span");
      tooltip.classList.add("video-tooltip");
      tooltip.innerHTML = iframeHTML;

      a.parentNode.insertBefore(tooltipWrapper, a);
      tooltipWrapper.appendChild(a);
      tooltipWrapper.appendChild(tooltip);
    } else {
      a.setAttribute("target", "_blank");
      a.style.color = "blue";
      a.style.textDecoration = "underline";
    }
  });

  return DOMPurify.sanitize(container.innerHTML, {
    ALLOWED_TAGS: [...allowedTags, 'iframe'],
    ALLOWED_ATTR: [
      ...allowedAttrs,
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder'
    ]
  });
}
