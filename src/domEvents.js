import { DEFAULT_AVATAR } from "./config.js";
import { GET_CONTACTS_FOR_MODAL, UPDATE_SCHEDULED_TO_POST } from "./api/queries.js";
import { fetchGraphQL } from "./api/fetch.js";
import { showToast } from "./ui/toast.js";
import { disableBodyScroll, enableBodyScroll } from "./utils/bodyScroll.js";
import { setPendingFile, setFileTypeCheck } from "./features/uploads/handlers.js";
import { GLOBAL_PAGE_TAG } from "./config.js";

function renderContacts(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.classList = "";
  container.classList.add("grid", "grid-cols-2", "gap-4", "p-4");
  container.innerHTML = list
    .map((c) => {
      const isAdmin = containerId === "adminContacts";
      return `
    <div
      @click="${isAdmin
          ? `
            document.getElementById('adminSchedulePostButton').classList.remove('hidden');
            document.getElementById('scheduledTabForAdmin').classList.remove('hidden');
            document.querySelector('.featurePostBtnForAdmin').classList.remove('hidden');
          `
          : `
            document.getElementById('adminSchedulePostButton').classList.add('hidden');
            document.getElementById('scheduledTabForAdmin').classList.add('hidden');
            document.querySelector('.featurePostBtnForAdmin').classList.add('hidden');
          `
        }
      loadSelectedUserFeed('${c.TagName}','${c.Contact_ID}','${c.Display_Name?.replace(/'/g, "\\'") || "Anonymous"}','${c.Profile_Image || DEFAULT_AVATAR}');
      modalToSelectUser=false;"
      class="cursor-pointer flex items-center flex-col "
    >
      <div class="flex  items-center flex-col gap-2 m-[5px] cursor-pointer h-[128px] w-[128px] rounded-full border-[4px] border-[rgba(200,200,200,0.4)] transition-[border] duration-200 ease-linear hover:border-[rgba(0,0,0,0.2)]">
        <img
          src="${c.Profile_Image || DEFAULT_AVATAR}"
          alt="${c.Display_Name || "Anonymous"}"
          class="h-full shrink-0 w-full rounded-full object-cover" />
      </div>
      <div>${c.Display_Name || "Anonymous"}</div>
    </div>
  `;
    })
    .join("");
}

export async function loadModalContacts() {
  try {
    const res = await fetchGraphQL(GET_CONTACTS_FOR_MODAL);
    const allContacts = res?.data?.feedContacts || [];
    const subscriberContacts = allContacts.filter(
      (c) => c.TagName === `${GLOBAL_PAGE_TAG}_Subscriber`
    );
    const adminContacts = allContacts.filter(
      (c) => c.TagName === `${GLOBAL_PAGE_TAG}_Admin`
    );

    renderContacts(subscriberContacts, "subscriberContacts");
    renderContacts(adminContacts, "adminContacts");

    if (allContacts.length === 1) {
      const c = allContacts[0];
      window.loadSelectedUserFeed(
        c.TagName,
        c.Contact_ID,
        c.Display_Name?.replace(/'/g, "\\'") || "Anonymous",
        c.Profile_Image || DEFAULT_AVATAR
      );
      const isAdmin = c.TagName === `${GLOBAL_PAGE_TAG}_Admin`;
      if (isAdmin) {
        document.getElementById('adminSchedulePostButton').classList.remove('hidden');
        document.getElementById('scheduledTabForAdmin').classList.remove('hidden');
        document.querySelector('.featurePostBtnForAdmin').classList.remove('hidden');
      } else {
        document.getElementById('adminSchedulePostButton').classList.add('hidden');
        document.getElementById('scheduledTabForAdmin').classList.add('hidden');
        document.querySelector('.featurePostBtnForAdmin').classList.add('hidden');
      }
      const modalRoot = document.querySelector('[x-data*="modalToSelectUser"]');
      modalRoot?.classList.add("hidden");
      enableBodyScroll();
    }
  } catch (err) {
    console.error("Failed to load contacts", err);
  }
}

function resetCreatePostModal() {
  const editor = document.getElementById("post-editor");
  if (editor) editor.innerHTML = "";
  const fileInput = document.getElementById("file-input");
  if (fileInput) {
    if (fileInput.filepond) {
      fileInput.filepond.removeFiles();
    }
    fileInput.value = "";
  }
  const sched = document.getElementById("scheduledDateContainer");
  if (sched) sched.textContent = "";
  setPendingFile(null);
  setFileTypeCheck("");
}

export function setupCreatePostModal() {
  const trigger = document.getElementById("create-post-trigger");
  const modal = document.getElementById("create-post-modal");
  const closeBtn = document.getElementById("close-post-modal");
  const uploadFileOuterButton = document.getElementById("uploadFileOuterButton");
  const startRecordingOuterButton = document.getElementById("startRecordingOuterButton");

  if (trigger && modal) {
    trigger.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.classList.add("show");
      disableBodyScroll();
      document.getElementById("post-editor").focus();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("show");
      enableBodyScroll();
      resetCreatePostModal();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        resetCreatePostModal();
        closeBtn?.click();
      }
    });
  }

  if (uploadFileOuterButton && trigger && modal) {
    uploadFileOuterButton.addEventListener("click", () => {
      trigger.click();
      setTimeout(() => {
        const dropLabel = document.querySelector(".filepond--drop-label");
        dropLabel?.click();
      }, 0);
    });
  }

  if (startRecordingOuterButton && trigger && modal) {
    startRecordingOuterButton.addEventListener("click", () => {
      trigger.click();
      setTimeout(() => {
        const recordBtn = document.getElementById("recordBtn");
        recordBtn?.click();
      }, 0);
    });
  }
}



export function initScheduledPostHandler() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".postNowFromScheduled");
    if (!btn) return;
    btn.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none");
    const uid = btn.getAttribute("data-uid");
    if (!uid) return;
    const variables = {
      unique_id: uid,
      payload: {
        feed_status: "Published - Not Flagged"
      }
    };

    try {
      await fetchGraphQL(UPDATE_SCHEDULED_TO_POST, variables, UPDATE_SCHEDULED_TO_POST);
      showToast("Post updated successfully!");
      btn.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none");
    } catch (error) {
      console.error("Error updating post:", error);
    }
  });
}

