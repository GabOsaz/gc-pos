import { appToast } from "../libs";

export const getSpecificErrorMessage = (data: any, altErrMsg?: string) => {
  if (
    data?.message === "Validation error" ||
    data?.response?.data?.message === "Validation error"
  ) {
    return Object.keys(data?.response?.data?.error)?.map((key) =>
      appToast.error(data?.response?.data?.error[key])
    );
  } else if (data?.response?.status >= 400) {
    return appToast.error(data?.response?.data?.message);
  } else {
    return appToast.error(data?.message ?? altErrMsg);
  }
};

const apiErrFn = (data: any, altErrMsg?: string) => {
  return getSpecificErrorMessage(data, altErrMsg);
};

export const apiSuccessToastFn = (data: any, altSuccessMsg?: string) => {
  return appToast.success(data?.message ?? altSuccessMsg);
};

export default apiErrFn;
