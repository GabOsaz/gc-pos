import { appCookies } from "../libs";

export const LOGIN_PATH = "/";

const EXPIRED_FLAG = "session:expired";

let ending = false;

export const isSessionExpiredStatus = (status?: number) =>
  status === 401 || status === 419;

export function endSession() {
  if (ending) return;
  ending = true;

  appCookies.remove("userData");
  sessionStorage.setItem(EXPIRED_FLAG, "1");

  if (window.location.pathname === LOGIN_PATH) {
    window.location.reload();
    return;
  }
  window.location.replace(LOGIN_PATH);
}

export function consumeSessionExpiredNotice() {
  if (sessionStorage.getItem(EXPIRED_FLAG) !== "1") return false;
  sessionStorage.removeItem(EXPIRED_FLAG);
  return true;
}
