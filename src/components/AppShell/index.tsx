import { Link, useRouterState } from "@tanstack/react-router";
import logo from "../../assets/svg/gc-logo.svg";
import { useAdminProfile } from "../../common-hooks/useAdminProfile";

interface NavLink {
  label: string;
  to: string;
}

interface AppShellProps {
  children: React.ReactNode;
  userAvatar?: string;
  notificationCount?: number;
}

const navLinks: NavLink[] = [
  { label: "Place Order", to: "/place-order" },
  { label: "Saved Bookings", to: "/bookings" },
  { label: "Order History", to: "/order-history" },
  { label: "Today's Pickup", to: "/pickup" },
];

const AppShell = ({ children }: AppShellProps) => {
  const { location } = useRouterState();
  const { data: admin } = useAdminProfile();

  const userName = admin ? `${admin.first_name} ${admin.last_name}` : "";
  const userDisplayName = admin?.first_name ?? "";

  return (
    <div className="">
      <header className="bg-brand-blue text-white px-4 sm:px-8 xl:px-24">
        {/* Top bar: logo + user controls */}
        <div className="flex items-center justify-between py-6">
          <img src={logo} alt="Garment Care" className="max-h-9 sm:max-h-none w-auto" />
          <div className="flex items-center gap-3 sm:gap-6">
            {/* <button type="button" className="relative p-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-0.5 font-medium leading-none">
                  {notificationCount}
                </span>
              )}
            </button> */}
            <button
              type="button"
              className="flex items-center gap-2 border border-[#E2E8F0] rounded-lg pl-2 pr-3 py-2"
            >
              <div className="w-7 h-7 rounded-full border border-[#E2E8F0] bg-white/20 flex items-center justify-center text-sm font-medium">
                {userDisplayName[0]}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
              {/* <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg> */}
            </button>
          </div>
        </div>

        {/* Bottom bar: welcome text + nav links */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mt-6 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Welcome, {userDisplayName}</h1>
            {/* <p className="text-sm text-white/70 mt-1">
              Branch Name - {branchName}
            </p> */}
          </div>
          <nav className="flex items-center gap-5 sm:gap-8 overflow-x-auto">
            {navLinks.map((link) => {
              // startsWith so detail routes keep their parent tab active
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm pb-3 whitespace-nowrap shrink-0 ${isActive ? "text-white border-b-2 border-white" : "text-white/70"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppShell;
