import { state, DEFAULT_AVATAR,GLOBAL_AUTHOR_ID } from "../../config.js";
import { safeArray } from "../../utils/formatter.js";
import { findRawById } from "../../utils/posts.js";
import { disableBodyScroll, enableBodyScroll } from "../../utils/bodyScroll.js";

const modal = document.getElementById("likes-modal");
const titleEl = document.getElementById("likes-modal-title");
const listEl = document.getElementById("likes-list");
const closeBtn = document.getElementById("likes-modal-close");

function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    enableBodyScroll();
}

export function openLikesModal(id) {
    if (!modal) return;
    const raw = findRawById(state.rawItems, Number(id));
    const reactors = safeArray(raw?.Feed_Reactors_Data);
    titleEl.textContent = `Likes (${reactors.length})`;
    listEl.innerHTML = reactors
        .map((r) => {
            const u = r.Feed_Reactor || {};
            const isCurrentUser = u.id === GLOBAL_AUTHOR_ID;
            let you = "";
            if( isCurrentUser) {
            you= `(You)`;
            }
            const name =
                u.display_name || [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                "Anonymous";
            const img = u.profile_image || DEFAULT_AVATAR;
            return `<div class="flex items-center gap-2 p-2 mx-4 rounded hover:bg-[#E7F1FE] cursor-pointer"><img class="w-6 h-6 border-[1px] border-[#D9D9D9] rounded-full object-cover" src="${img}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'" alt="${name}"><div>${name} ${you}</div></div>`;
        })
        .join("") || `<div class="m-auto">
         <img src=" https://static-au03.vitalstats.app/uploads/eventmx/dpYP3oQoAomii1_KBO68M.gif" class="size-[250px]"/>
         <img src="https://static-au03.vitalstats.app/uploads/eventmx/dva4KMb33sPYMOlHVhvlR.jpg" class="!hidden size-[250px]"/>
        </div>`;
    modal.classList.remove("hidden");
    disableBodyScroll();
}

export function initLikesModalHandlers() {
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }
    $(document).on("click", ".like-count", function (e) {
        e.stopPropagation();
        const depth = Number($(this).closest(".item").data("depth"));
        const inModal = $(this).closest("#modalFeedRoot").length > 0;
        if (depth !== 0 || inModal) return;
        const id = $(this).data("id");
        if (id) openLikesModal(id);
    });
}