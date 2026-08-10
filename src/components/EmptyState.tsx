import emptyStateIcon from "../assets/svg/empty-state.svg";
import CustomButton from "./CustomButton";

interface EmptyStateProps {
  title: string;
  subTitle?: string;
  hasBtn?: boolean;
  btnText?: string;
  btnIcon?: string;
  btnOnClick?: () => void;
}

function EmptyState({
  title,
  subTitle,
  hasBtn,
  btnText,
  btnIcon,
  btnOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex mb-4">
      <div className="max-w-[388px] m-auto flex flex-col gap-6 text-center">
        <div className="w-fit mx-auto">
          <img src={emptyStateIcon} alt="empty state icon" />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">{title}</h3>
          <p className="text-brand-darkGray text-sm text-wrap">{subTitle}</p>
        </div>
        {hasBtn ? (
          <CustomButton
            title={btnText ?? ""}
            onClick={btnOnClick}
            className="max-w-[135px] mx-auto"
            leftIcon={btnIcon}
          />
        ) : null}
      </div>
    </div>
  );
}

export default EmptyState;
