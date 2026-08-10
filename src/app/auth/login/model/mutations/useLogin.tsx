/* eslint-disable import/prefer-default-export */
import { useMutation } from "@tanstack/react-query";
import { instaceWithoutAuth } from "../../../../../libs/instance";

export interface LoginI {
  email: string;
  password: string;
}

/**
 * @param {*} data -> { email, password }
 * @returns axios request with data
 */

const login = (data: LoginI) => {
  return instaceWithoutAuth({ url: "/admins/login", method: "POST", data });
}

export const useLogin = (onSuccess: any, onError: any) =>
  useMutation({
    mutationFn: login,
    onError,
    onSuccess,
  });
