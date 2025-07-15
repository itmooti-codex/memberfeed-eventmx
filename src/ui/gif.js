export function initGifPicker() {
  const modal = $(
    `<div id="gif-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-12 !z-[2147483649]">
      <div class="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden relative">
        <div id="pond-loading" class="hidden absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <svg class="animate-spin h-12 w-12 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div class="py-4 mx-4 border-b flex space-x-2 items-center justify-between">
        <div class="h1">Choose a GIF</div>
        <div class="flex items-center justify-start gap-2 rounded-[34px] bg-zinc-100 hover:bg-[var(--color-primary-shade)] transition-all p-2 cursor-pointer group " id="gif-close-btn" >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8535 18.146C18.8999 18.1925 18.9368 18.2476 18.9619 18.3083C18.9871 18.369 19 18.4341 19 18.4997C19 18.5654 18.9871 18.6305 18.9619 18.6912C18.9368 18.7519 18.8999 18.807 18.8535 18.8535C18.807 18.8999 18.7519 18.9368 18.6912 18.9619C18.6305 18.9871 18.5654 19 18.4997 19C18.4341 19 18.369 18.9871 18.3083 18.9619C18.2476 18.9368 18.1925 18.8999 18.146 18.8535L14 14.7068L9.85398 18.8535C9.76017 18.9473 9.63292 19 9.50025 19C9.36758 19 9.24033 18.9473 9.14652 18.8535C9.0527 18.7597 9 18.6324 9 18.4997C9 18.3671 9.0527 18.2398 9.14652 18.146L13.2932 14L9.14652 9.85398C9.0527 9.76017 9 9.63292 9 9.50025C9 9.36758 9.0527 9.24033 9.14652 9.14652C9.24033 9.0527 9.36758 9 9.50025 9C9.63292 9 9.76017 9.0527 9.85398 9.14652L14 13.2932L18.146 9.14652C18.2398 9.0527 18.3671 9 18.4997 9C18.6324 9 18.7597 9.0527 18.8535 9.14652C18.9473 9.24033 19 9.36758 19 9.50025C19 9.63292 18.9473 9.76017 18.8535 9.85398L14.7068 14L18.8535 18.146Z" fill="#0E0E0E"></path>
              </svg>
            </div>
        </div>
        <div class="py-4 mx-4 flex space-x-2">
        <div class=" flex items-center gap-2 search-wrapper w-full !bg-white">
          <input type="text" id="gif-search-input" placeholder="Search GIFs…" class="!py-2 !pl-2 rounded text-sm w-full" />
          </div>
          <div id="gif-search-btn" class="flex items-center cursor-pointer justify-center gap-2 transition-all rounded bg-[var(--color-primary)] group px-3 py-2 cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="!fill-white" d="M14.5165 13.7917L11.3103 10.5862C12.2396 9.47052 12.703 8.03956 12.6041 6.59097C12.5052 5.14238 11.8516 3.78768 10.7793 2.80868C9.70705 1.82969 8.29861 1.30178 6.84702 1.33477C5.39543 1.36776 4.01244 1.95911 2.98575 2.98581C1.95905 4.0125 1.3677 5.39549 1.33471 6.84708C1.30172 8.29868 1.82963 9.70711 2.80862 10.7794C3.78762 11.8517 5.14232 12.5052 6.59091 12.6041C8.0395 12.703 9.47046 12.2397 10.5861 11.3104L13.7916 14.5165C13.8392 14.5641 13.8957 14.6019 13.9579 14.6276C14.0201 14.6534 14.0867 14.6666 14.154 14.6666C14.2213 14.6666 14.288 14.6534 14.3502 14.6276C14.4124 14.6019 14.4689 14.5641 14.5165 14.5165C14.5641 14.4689 14.6018 14.4124 14.6276 14.3502C14.6533 14.2881 14.6666 14.2214 14.6666 14.1541C14.6666 14.0868 14.6533 14.0201 14.6276 13.958C14.6018 13.8958 14.5641 13.8393 14.5165 13.7917ZM2.37194 6.98238C2.37194 6.07053 2.64233 5.17916 3.14893 4.42099C3.65552 3.66282 4.37557 3.07189 5.218 2.72294C6.06044 2.37399 6.98744 2.28269 7.88176 2.46058C8.77609 2.63848 9.59758 3.07757 10.2424 3.72235C10.8871 4.36712 11.3262 5.18861 11.5041 6.08294C11.682 6.97727 11.5907 7.90426 11.2418 8.7467C10.8928 9.58914 10.3019 10.3092 9.54372 10.8158C8.78554 11.3224 7.89417 11.5928 6.98232 11.5928C5.75999 11.5914 4.58811 11.1052 3.72378 10.2409C2.85946 9.3766 2.37329 8.20472 2.37194 6.98238Z" fill="black"/>
            </svg>
          <div class="justify-start text-center p3 text-white transition-all text-nowrap">Search</div>
          </div>
        </div>
        <div class="p-4 relative">
          <div id="gif-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-auto"></div>
          <div id="gif-loading" class="hidden absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <svg class="animate-spin h-12 w-12 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>`
  ).prependTo('body');

  const apiKeyGIPHY = '94CIbzCFrmRmAtulBbV6g0XRteWMqzfr';
  let pondInstance = null;

  function showLoading() { $('#gif-loading').removeClass('hidden'); }
  function hideLoading() { $('#gif-loading').addClass('hidden'); }
  function showPondLoading() { $('#pond-loading').removeClass('hidden'); }
  function hidePondLoading() { $('#pond-loading').addClass('hidden'); }

  async function fetchGifBlob(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
      return await res.blob();
    }
  }

  async function search(term = '') {
    showLoading();
    const endpoint = term
      ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKeyGIPHY}&q=${encodeURIComponent(term)}&limit=20`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKeyGIPHY}&limit=20`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      $('#gif-grid').empty();
      (data.data || []).forEach(g => {
        const originalUrl = g.images.original.url;
        const filename = originalUrl.split('/').pop().split('?')[0];
        $('<img>')
          .attr('src', g.images.fixed_height_small.url)
          .attr('data-full', originalUrl)
          .attr('data-filename', filename)
          .addClass('cursor-pointer rounded')
          .appendTo('#gif-grid');
      });
    } catch (err) {
     
    } finally {
      hideLoading();
    }
  }

  // Handle toggle click: choose input inside create-post-modal or fallback to comment-form
  $(document).on('click', '.gif-toggle', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.focus();
    let gifModal = $('#gif-search-input');
    console.log("Input of gif modal is", gifModal);
   
    const $toggle = $(this);
  
    let actualInput;
    if (document.querySelector('#create-post-modal')?.classList.contains('show')) {
      const wrapper = document.querySelector('#create-post-modal');
      actualInput = wrapper.querySelector('#file-input');
    } else {
      actualInput = document.querySelector('.comment-form').querySelector('#file-input');
    }
    if (!actualInput) {
     
      return;
    }

    pondInstance = FilePond.find(actualInput);
    if (!pondInstance) {
      return;
    }

    $('#gif-modal').removeClass('hidden');
    $('#gif-search-input').val('');
    search();
    setTimeout(() => {
      const input = document.getElementById('gif-search-input');
      input?.focus();
    }, 100);
  });
  $('#gif-search-input').on('pointerdown mousedown click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.focus();
  });
  $('#gif-search-input').on('focus focusin', e => {
    e.stopPropagation();
  });
  $('#gif-search-input').on('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#gif-search-btn').trigger('click');
    }
  });
  $('#gif-close-btn').on('click', () => $('#gif-modal').addClass('hidden'));

  $('#gif-search-btn').on('click', e => {
    e.preventDefault();
    e.stopPropagation();
    search($('#gif-search-input').val().trim());
    $('#gif-search-input').trigger('focus');
  });

  $('#gif-grid').on('click', 'img', async function () {
    const url = $(this).data('full');
    const filename = $(this).data('filename') || 'giphy.gif';
    if (pondInstance) {
      try {
        showPondLoading();
        const blob = await fetchGifBlob(url);
        if (blob.type === 'image/gif') {
          const file = new File([blob], filename, { type: blob.type });
          await pondInstance.addFile(file);
        } else {
         
        }
      } catch (err) {
        console.error('Failed to add GIF', err);
      } finally {
        hidePondLoading();
      }
    } else {
      
    }
    $('#gif-modal').addClass('hidden');
  });
}
