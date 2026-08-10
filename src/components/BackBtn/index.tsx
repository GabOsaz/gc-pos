import backArrow from "../../assets/svg/arrow-left-bold.svg";

const BackBtn = ({
  hasBackBtn,
  backBtnFn,
  label = "Back",
}: {
  hasBackBtn: boolean;
  backBtnFn?: () => void;
  label?: string;
}) => {
  return (
    <>
      {hasBackBtn ? (
        <button
          className="flex text-sm gap-2 items-center
      hover:cursor-pointer w-fit"
          onClick={backBtnFn ? backBtnFn : () => window.history.back()}
          type="button"
        >
          <img src={backArrow} alt="back arrow icon" />
          <span>{label}</span>
        </button>
      ) : null}
    </>
  );
};

export default BackBtn;
