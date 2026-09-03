/* eslint-disable consistent-return */
import axios from "axios";
import Cookies from "js-cookie";
import handleError from "../utils/errorHandler";
import { endSession, isSessionExpiredStatus } from "../utils/session";
import { appToast } from "./index";

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_GARMENT_CARE_BASEURL,
});

/** Every backend response is wrapped in this envelope. */
export interface ApiResponse<T> {
  status: string;
  message: string;
  code: number;
  data: T;
}

/**
 * Pulls the payload out of the envelope for reads, where the message is not
 * shown. Mutations should keep the whole envelope so `message` can be toasted.
 */
export const unwrap = <T>(payload: unknown): T => {
  const envelope = payload as { data?: T } | null;
  return envelope?.data !== undefined ? envelope.data : (payload as T);
};

export const instaceWithoutAuth = axios.create({
  baseURL: import.meta.env.VITE_GARMENT_CARE_BASEURL,
  headers: {
    "content-Type": "application/json",
  },
});

export const request = (axiosConfig: any) =>
  apiInstance(axiosConfig)
    .then((res) => {
      if (res?.data?.code >= 200 && res?.data?.code < 300) {
        return res.data;
      }
    })
    .catch((err) => {
      if (!window.navigator.onLine) {
        return appToast.error('Please, try again after internet connection is restored.')
      }
      handleError(err);
      return err;
    });

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isSessionExpiredStatus(error?.response?.status)) {
      endSession();
    }
    return Promise.reject(error);
  }
);

apiInstance.interceptors.request.use((config) => {
  const userData = Cookies.get("userData");
  const { aToken } = userData ? JSON.parse(userData) : null;
  if (aToken) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${aToken}`;
  }

  return config;
});
