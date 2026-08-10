import Loader from "./Loader";

interface CustomButtonProps {
  type?: "reset" | "button" | "submit" | undefined;
  title: string;
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  width?: string;
  rightIcon?: string;
  leftIcon?: string;
  noShadow?: boolean;
  textColor?: string;
  className?: string;
  onHover?: () => void;
  onMouseLeave?: () => void;
}

interface ButtonIconProps {
  icon: string;
  hide: boolean;
}

function ButtonIcon({ icon, hide }: ButtonIconProps) {
  return (
    <img
      src={icon}
      alt="icon for button"
      className={`${hide ? "hidden" : ""} w-4.5 h-4.5`}
    />
  );
}

function CustomButton(props: CustomButtonProps) {
  const {
    type = "button",
    title,
    onClick,
    onHover,
    onMouseLeave,
    isLoading = false,
    isDisabled = false,
    width,
    rightIcon,
    leftIcon,
    noShadow,
    className,
    textColor,
  } = props;
  return (
    <button
      onMouseEnter={onHover}
      onMouseLeave={onMouseLeave}
      type={type}
      className={`bg-brand-blue min-h-12 min-w-16
        flex gap-2 items-center text-sm rounded-md before:ease-in-out relative overflow-hidden
        disabled:bg-brand-gray disabled:cursor-not-allowed px-4 py-3
        transition-all duration-500 before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 
        before:rotate-6 before:bg-white before:opacity-10 before:duration-1000 hover:shadow-white hover:before:-translate-x-96
        focus:scale-75 justify-center hover:bg-opacity-95 hover:backdrop-filter
        ${noShadow ? null : "shadow-lg"} ${textColor || "text-white"}
        ${isLoading ? "cursor-not-allowed" : "cursor-pointer"} ${className} ${width}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {leftIcon ? <ButtonIcon hide={isLoading} icon={leftIcon} /> : null}
      {isLoading ? <Loader /> : title}
      {rightIcon ? <ButtonIcon hide={isLoading} icon={rightIcon} /> : null}
    </button>
  );
}

export default CustomButton;
