import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import routeMap from "../../../../utils/routeMap";
import { appCookies } from "../../../../libs";
import { consumeSessionExpiredNotice } from "../../../../utils/session";
import { useLogin } from "../model/mutations/useLogin";

function useLoginLogic() {
  const routerNavigate = useNavigate();
  const navigate = (to: string) => routerNavigate({ to: to as any });

  useEffect(() => {
    if (consumeSessionExpiredNotice()) {
      toast.error("Session expired. Please log in again");
    }
  }, []);
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const onSuccess = (successData: any) => {
    toast.success("Admin login successful!");
    appCookies.set(
      "userData",
      JSON.stringify({
        aToken: successData?.data?.data?.token,
        adminData: successData?.data?.data?.admin,
      })
    );
    if (!successData?.data?.data?.admin?.status) {
      navigate(routeMap.login);
    } else if ((successData?.data?.data?.admin?.status)) {
      navigate(routeMap.placeOrder);
    }
  };

  const onError = (errorData: any) => {
    toast.error(errorData?.response?.data?.message || "Error logging in");
  };

  const { mutate, isPending } = useLogin(onSuccess, onError);

  const onSubmit = (e: any) => {
    e.preventDefault();
    mutate(loginDetails);
  };

  return {
    onSubmit,
    setLoginDetails,
    loginDetails,
    isPending,
    navigate,
  };
}

export default useLoginLogic;
