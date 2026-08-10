/* eslint-disable no-empty */
import { toast } from "react-toastify";
import { getSpecificErrorMessage } from "./apiErrFn";

function handleError(err: any) {
  if (
    err.status === 401 ||
    err.response?.status === 401 ||
    err.status === 419 ||
    err.response?.status === 419
  ) {
    window.location.replace("/auth/login");
    return toast.error("Session expired. Please log in again");
  }
  return getSpecificErrorMessage(err, "something went wrong");
}

export default handleError;
