/* eslint-disable no-empty */
import { getSpecificErrorMessage } from "./apiErrFn";
import { endSession, isSessionExpiredStatus } from "./session";

function handleError(err: any) {
  if (
    isSessionExpiredStatus(err.status) ||
    isSessionExpiredStatus(err.response?.status)
  ) {
    return endSession();
  }
  return getSpecificErrorMessage(err, "something went wrong");
}

export default handleError;
