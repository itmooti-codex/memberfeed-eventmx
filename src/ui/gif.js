export function initGifPicker() {
  const modal = $(
    `<div id="gif-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-12 z-[2147483642]">
      <div class="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        <div class="p-4 border-b flex space-x-2">
          <input type="text" id="gif-search-input" placeholder="Search GIFs…" class="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring" />
          <button id="gif-search-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none">Search</button>
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
        <div class="p-4 border-t flex justify-end">
          <button id="gif-close-btn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">Close</button>
        </div>
      </div>
    </div>`
  ).appendTo('body');

  const apiKey = 'Ivfu3HjgtK75rqD0xdRxNYlhXo5UqR3u';
  let targetInput = null;

  function showLoading() { $('#gif-loading').removeClass('hidden'); }
  function hideLoading() { $('#gif-loading').addClass('hidden'); }
  async function fetchGifBlob(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch (err) {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw err;
      return await res.blob();
    }
  }
  async function search(term = '') {
    showLoading();
    const endpoint = term
      ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(term)}&limit=20`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      $('#gif-grid').empty();
      (data.data || []).forEach(g => {
        $('<img>')
          .attr('src', g.images.fixed_height_small.url)
          .attr('data-full', g.images.original.url)
          .addClass('cursor-pointer rounded')
          .appendTo('#gif-grid');
      });
    } catch (err) {
      console.error('GIF fetch failed', err);
    } finally {
      hideLoading();
    }
  }

  $(document).on('click', '.gif-toggle', function (e) {
    e.stopPropagation();
    targetInput = $(this).closest('.comment-form, .post-form').find('.file-input')[0];
    if (!targetInput) targetInput = document.querySelector('#file-input');
    $('#gif-modal').removeClass('hidden');
    $('#gif-search-input').val('');
    search();
  });

  $('#gif-close-btn').on('click', () => $('#gif-modal').addClass('hidden'));
  $('#gif-search-btn').on('click', () => search($('#gif-search-input').val().trim()));
  $('#gif-grid').on('click', 'img', async function () {
    const url = $(this).data('full');
    if (targetInput && targetInput.filepond) {
      try {
        const blob = await fetchGifBlob(url);
        console.log('Adding GIF:', url);
        if (!blob || blob.type !== 'image/gif') {
          console.log('Fetched blob is not a GIF:', blob);
          return;
        } 
        const file = new File([blob], 'giphy.gif', { type: blob.type });
        console.log('Creating File object:', file);
        if (!targetInput.filepond) {
          console.log('Target input is not a FilePond instance');
          return;
        }
        await targetInput.filepond.addFile(file);
      } catch (err) {
        console.log('Failed to add GIF', err);
      }
    }else{
      console.log('Target input not found or not a FilePond instance');
    }
    $('#gif-modal').addClass('hidden');
  });
}
