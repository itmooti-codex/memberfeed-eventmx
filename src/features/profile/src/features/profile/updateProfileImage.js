import { processFileFields } from '../../../../../utils/handleFile.js';
import { fetchGraphQL } from '../../../../../api/fetch.js';
import { awsParam, awsParamUrl, GLOBAL_AUTHOR_ID, state } from '../../../../../config.js';
import { refreshCurrentUser } from '../../../../posts/user.js';

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

export async function updateProfileImage(file) {
    const toSubmit = {};
    await processFileFields(
        toSubmit,
        [{ fieldName: 'profile_image', file }],
        awsParam,
        awsParamUrl,
    );

    console.log("To submit", toSubmit);
  
    const payload = { profile_image: toSubmit.profile_image };
  
    console.log("Profile payload is", payload);
  
  await fetchGraphQL(UPDATE_CONTACT_PROFILE_IMAGE, {
        id: GLOBAL_AUTHOR_ID,
        payload,
    });
    await refreshCurrentUser();
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
