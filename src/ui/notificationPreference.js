import { notificationStore } from "../config.js";

export function renderNotificationToggles(data) {
    const container = document.getElementById('notificationOptionsContainer');
    const prefs = data;
    const allOff = prefs.Turn_Off_All_Notifications;

    const options = [
        { label: "All", key: "Notify_me_of_all_Posts" },
        { label: "Comment / Replies on my post only", key: "Notify_me_of_comments_replies_on_my_posts_only" },
        { label: "Mentions only", key: "Notify_me_when_I_am_Mentioned" },
        { label: "Likes only", key: "Notify_me_when_I_get_Likes", missing: true }
    ];

    const html = [];

    // "Turn notifications off" toggle
    html.push(`
    <div class="flex items-center justify-between">
      <span>Turn notifications off</span>
      <div class="relative h-4 w-8 rounded-full transition duration-200 ease-linear ${allOff ? 'bg-[var(--color-primary)]' : 'bg-gray-400'}">
        <div class="absolute left-0 h-4 w-4 transform rounded-full border-2 bg-white transition duration-100 ease-linear ${allOff ? 'translate-x-full border-[var(--color-primary)]' : 'translate-x-0 border-gray-400'}"></div>
        <input 
          type="checkbox" 
          id="toggleAllOff" 
          class="absolute h-full w-full opacity-0 cursor-pointer" 
          ${allOff ? 'checked' : ''}/>
      </div>
    </div>
  `);

    // Individual option toggles
    options.forEach(opt => {
        const value = prefs[opt.key] ?? false;
        const opacityClass = allOff ? 'opacity-40 cursor-not-allowed' : 'opacity-100';
        const bgClass = value ? 'bg-[var(--color-primary)]' : 'bg-gray-400';
        const toggleClass = value ? 'translate-x-full border-[var(--color-primary)]' : 'translate-x-0 border-gray-400';
        const disabledAttr = allOff ? 'disabled' : '';

        html.push(`
      <div class="flex items-center justify-between ${opacityClass}">
        <span>${opt.label}</span>
        <div class="relative h-4 w-8 rounded-full transition duration-200 ease-linear ${bgClass}">
          <div class="absolute left-0 h-4 w-4 transform rounded-full border-2 bg-white transition duration-100 ease-linear ${toggleClass}"></div>
          <input 
            type="checkbox" 
            class="pref-toggle absolute h-full w-full opacity-0 cursor-pointer" 
            data-key="${opt.key}" 
            ${value ? 'checked' : ''} 
            ${disabledAttr}/>
        </div>
      </div>
    `);
    });

    container.innerHTML = html.join('');

    // attach event listeners
    const allToggle = document.getElementById('toggleAllOff');
    if (allToggle) {
        allToggle.addEventListener('change', e => toggleAllOff(e.target.checked));
    }

    container.querySelectorAll('.pref-toggle').forEach(input => {
        const key = input.dataset.key;
        input.addEventListener('change', e => toggleOption(key, e.target.checked));
    });
}

export function toggleAllOff(state) {
    const prefs = notificationStore.preferences;
    if (!prefs) return;

    prefs.Turn_Off_All_Notifications = state;
    if (state) {
        prefs.Notify_me_of_all_Posts = false;
        prefs.Notify_me_of_comments_replies_on_my_posts_only = false;
        prefs.Notify_me_when_I_am_Mentioned = false;
        prefs.Notify_me_when_I_get_Likes = false;
    }

    renderNotificationToggles(prefs);
}

export function toggleOption(key, value) {
    const prefs = notificationStore.preferences;
    if (!prefs) return;

    if (value) {
        for (const k in prefs) {
            if (k !== 'Turn_Off_All_Notifications') {
                prefs[k] = false;
            }
        }
        prefs[key] = true;
    } else {
        prefs[key] = false;
    }

    renderNotificationToggles(prefs);
}