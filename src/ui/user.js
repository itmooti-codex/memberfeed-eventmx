export function updateCurrentUserUI(state) {
  const avatar = document.getElementById("current-user-avatar");
  const avatarForModal = document.getElementById("current-user-avatar-modal");
  const avatarName = document.querySelectorAll(".avatar-name");
  const avatarPhoto = document.querySelectorAll(".avatar-photo");
  if (avatarPhoto && state?.currentUser?.profile_image) {
    avatarPhoto.forEach((el) => {
      el.src = state.currentUser.profile_image;
    });
  }
  if (avatarName && state?.currentUser?.display_name) {
    avatarName.forEach((el) => {
      el.textContent = state.currentUser.display_name;
    });
  }
  if (avatar && state?.currentUser?.profile_image) {
    avatar.src = state.currentUser.profile_image;
    if (avatarForModal) {
      avatarForModal.src = state.currentUser.profile_image;
    }
  }
  const nameEl = document.getElementById("current-user-name");
  const nameElForModal = document.getElementById("current-user-name-modal");
  if (nameEl && state?.currentUser?.display_name) {
    nameEl.textContent = state.currentUser.display_name;
    if (nameElForModal) {
      nameElForModal.textContent = state.currentUser.display_name;
    }
  }
}
