/* eslint-disable import/no-named-as-default */
import { useMemo } from "react";
import AuthShell from "../../../components/AuthShell";
import CustomInput from "../../../components/CustomInput";
import { validateEmail } from "../../../utils/inputValidationSchema.ts";
import useLoginLogic from "./controller/useLoginLogic";
import routeMap from "../../../utils/routeMap.ts";
import CustomButton from "../../../components/CustomButton.tsx";

function Login() {
  const { onSubmit, setLoginDetails, loginDetails, isPending, navigate } =
    useLoginLogic();

  const isInputInvalid = useMemo(
    () => ({
      email: loginDetails.email !== "" && validateEmail(loginDetails.email),
      password: !(loginDetails?.password?.length > 4),
    }),
    [loginDetails.password, loginDetails.email],
  );

  return (
    <AuthShell title="LOGIN">
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="flex flex-col gap-4 min-w-75 max-w-100 lg:w-100">
          <CustomInput
            id="email"
            label="Email address"
            placeholder="Enter email"
            type="email"
            isInvalid={isInputInvalid.email}
            value={loginDetails?.email}
            bg="#F3F4F6"
            errorMessage="Email must be valid"
            onChange={(e) => {
              setLoginDetails({ ...loginDetails, email: e.target.value });
            }}
          />
          <CustomInput
            id="password"
            type="password"
            label="Password"
            placeholder="Enter password"
            value={loginDetails?.password}
            bg="#F3F4F6"
            onChange={(e) => {
              setLoginDetails({ ...loginDetails, password: e.target.value });
            }}
          />
          <CustomButton
            type="submit"
            title="Log In"
            isLoading={isPending}
            className="w-full"
            isDisabled={Object.values(isInputInvalid).some(
              (value) => value === true,
            )}
          />
          <div className="flex justify-end underline text-brand-blue text-sm">
            <button
              className="w-fit hover:cursor-pointer"
              type="button"
              onClick={() => navigate(routeMap.forgotPassword)}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

export default Login;
