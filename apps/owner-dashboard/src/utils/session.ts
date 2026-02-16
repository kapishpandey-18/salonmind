import { STORAGE_KEYS } from "../constants/api";
import { queryClient } from "../lib/queryClient";

let isLogoutInProgress = false;

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
  queryClient.clear();
}

export function triggerAppLogoutRedirect() {
  if (isLogoutInProgress) {
    return;
  }
  isLogoutInProgress = true;
  clearStoredSession();
  window.location.href = "/login";
}
