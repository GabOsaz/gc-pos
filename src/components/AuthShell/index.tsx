import type { ReactNode } from "react";
import BackBtn from "../BackBtn";
import logo from "../../assets/svg/logo.svg";

interface AuthShellProps {
  children: ReactNode;
  hasBackBtn?: boolean;
  title: string;
  subTitle?: ReactNode | string;
}

function AuthShell({
  children,
  hasBackBtn = false,
  title,
  subTitle = null,
}: AuthShellProps) {
  return (
    <div className="flex px-7 py-4 min-h-screen max-w-450 justify-center lg:justify-start mx-auto">
      <div
        className="hidden lg:block authImg relative lg:w-[50%] bg-cover
       bg-no-repeat rounded-2xl shadow-[inset_0px_-200px_500px_-100px_#000]
        px-10 text-white"
      >
        <div className="absolute bottom-11">
          <p className="font-bold text-sm mb-3">GARMENT CARE</p>
          <p className="text-3xl tracking-[-3%]">
            Your control hub to manage and streamline
            <br />
            your
            <span className="text-brand-gray">
              {" "}
              laundry service operations.
            </span>
          </p>
        </div>
      </div>
      <div className="lg:w-[50%] flex min-h-[90vh]">
        <div className="w-fit m-auto flex flex-col gap-9 ">
          <BackBtn hasBackBtn={hasBackBtn} />
          <div className="flex flex-col gap-9">
            <div>
              <img src={logo} alt="garment care logo" />
            </div>
            <div>
              <div className="mb-7">
                <h3 className="font-medium text-3xl mb-2 capitalize">
                  {title}
                </h3>
                {typeof subTitle === "string" ? (
                  <p className="max-w-88.75 text-brand-darkGray">
                    {subTitle}
                  </p>
                ) : (
                  subTitle
                )}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
