import CustomButton from "../CustomButton";

export interface CTAFooterProps {
  handleCancel: () => void;
  handleSave: () => void;
  handleReset?: () => void;
  handleSaveBtnText?: string;
  handleSaveBtnTextClassName?: string;
  isHandleSaveBtnLoading?: boolean;
  isHandleSaveBtnDisabled?: boolean;
}

function CTAFooter({
  handleCancel,
  handleSave,
  handleSaveBtnText,
  handleSaveBtnTextClassName,
  isHandleSaveBtnLoading,
  isHandleSaveBtnDisabled,
  handleReset,
}: CTAFooterProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3 sm:gap-4 mt-4 bg-[#F3F4F6] rounded-b-xl py-4 px-5 sm:px-10">
      <div>
        <CustomButton
          textColor="text-black"
          onClick={handleCancel}
          title="Cancel"
          className="border border-[#D1D5DB] bg-white px-8 py-[14px] rounded-xl"
        />
      </div>
      {handleReset ? (
        <div>
          <CustomButton
            textColor="text-black"
            onClick={handleReset}
            title="Reset"
            className="border bg-yellow-300 px-8 py-[14px] rounded-xl"
          />
        </div>
      ) : null}
      <div>
        <CustomButton
          onClick={handleSave}
          isDisabled={isHandleSaveBtnDisabled}
          isLoading={isHandleSaveBtnLoading}
          title={handleSaveBtnText ?? "Save"}
          className={`bg-brand-blue text-white px-8 py-[14px] rounded-xl ${handleSaveBtnTextClassName}`}
        />
      </div>
    </div>
  );
}

export default CTAFooter;
