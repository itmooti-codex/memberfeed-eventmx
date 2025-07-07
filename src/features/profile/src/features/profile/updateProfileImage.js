import { fetchGraphQL } from '../../../../../api/fetch.js';
import { refreshCurrentUser } from '../../../../posts/user.js';
import {
    API_KEY,
    HTTP_ENDPOINT,
    GLOBAL_AUTHOR_ID,
    state,
} from '../../../../../config.js';
export const UPDATE_CONTACT_PROFILE_IMAGE = `
mutation updateContact($id: EventmxContactID, $payload: ContactUpdateInput = null) {
  updateContact(
    query: [{ where: { id: $id } }]
    payload: $payload
  ) {
    profile_image
  }
}
`;
async function requestUploadDetails(file) {
    const base = new URL(HTTP_ENDPOINT).origin;
    const params = new URLSearchParams({
        type: file.type,
        name: file.name,
        generateName: '1',
    });
    const res = await fetch(`${base}/api/v1/rest/upload?${params}`, {
        headers: { 'Api-Key': API_KEY },
    });
    const data = await res.json();
    if (!res.ok || data.statusCode !== 200) {
        throw new Error('Failed to obtain upload URL');
    }
    return data.data; // { uploadUrl, url, key }
}

async function uploadFileToS3(url, file) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!res.ok) {
        throw new Error('File upload failed');
    }
}


export async function updateProfileImage(file) {
    const { uploadUrl, url } = await requestUploadDetails(file);
    await uploadFileToS3(uploadUrl, file);
    const payload = { profile_image: url };

    await fetchGraphQL(UPDATE_CONTACT_PROFILE_IMAGE, {
        id: GLOBAL_AUTHOR_ID,
        payload,
    });
    await refreshCurrentUser();
    const pageUserProfileDisplay = document.getElementById('pageUserProfileDisplay');
    if (pageUserProfileDisplay) {
        pageUserProfileDisplay.src = url;
    }
    return state.currentUser?.profile_image;
}

export function initProfileImageUpload() {
    const input = document.getElementById('imageInput');
    const button = document.getElementById('updateProfileImage');
    if (!input || !button) return;
    button.addEventListener('click', () => {
        const file = input.files?.[0];
        if (file) {
            updateProfileImage(file).catch((err) => {
                console.error('Profile image update failed', err);
            });
        }
    });
}
