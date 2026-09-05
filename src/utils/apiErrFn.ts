import { appToast } from "../libs";

interface MaybeNetworkError {
  response?: unknown;
  code?: string;
  message?: string;
}

/**
 * A dropped connection surfaces as an axios error with no `response` at all
 * (status codes only exist for requests that reached the server), so it must
 * be caught before the status-based branches below.
 */
const isConnectivityError = (err: MaybeNetworkError) =>
  (typeof navigator !== "undefined" && !navigator.onLine) ||
  (!err?.response && (err?.code === "ERR_NETWORK" || err?.message === "Network Error"));

const toastOnce = (message: string) => appToast.error(message, { toastId: message });

export const getSpecificErrorMessage = (data: any, altErrMsg?: string) => {
  if (isConnectivityError(data)) {
    return toastOnce("You're offline. Check your internet connection and try again.");
  } else if (
    data?.message === "Validation error" ||
    data?.response?.data?.message === "Validation error"
  ) {
    return Object.keys(data?.response?.data?.error)?.map((key) =>
      toastOnce(data?.response?.data?.error[key])
    );
  } else if (data?.response?.status >= 400) {
    return toastOnce(data?.response?.data?.message);
  } else {
    return toastOnce(data?.message ?? altErrMsg);
  }
};

const apiErrFn = (data: any, altErrMsg?: string) => {
  return getSpecificErrorMessage(data, altErrMsg);
};

export const apiSuccessToastFn = (data: any, altSuccessMsg?: string) => {
  return appToast.success(data?.message ?? altSuccessMsg);
};

export default apiErrFn;
