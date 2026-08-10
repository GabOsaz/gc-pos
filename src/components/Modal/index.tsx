import React from "react";
import { motion } from "framer-motion";
import closeModalIcon from "../../assets/svg/closeModalIcon.svg";
import CTAFooter from "./CTAFooter";

interface CustomModalProps {
  isOpen: boolean;
  children?: React.ReactNode;
  className?: string;
  handleCancel: () => void;
  handleReset?: () => void;
  title?: string;
  subTitle?: string;
  handleSave?: (e?: any) => void;
  handleSaveBtnText?: string;
  handleSaveBtnTextClassName?: string;
  isHandleSaveBtnLoading?: boolean;
  isHandleSaveBtnDisabled?: boolean;
  width?: string;
  canCloseAtTitle?: boolean;
  centered?: boolean;
}

function CustomModal({
  isOpen,
  children,
  className,
  handleCancel,
  handleSave,
  handleSaveBtnText,
  handleSaveBtnTextClassName,
  isHandleSaveBtnLoading,
  isHandleSaveBtnDisabled,
  title,
  subTitle,
  width,
  canCloseAtTitle,
  handleReset,
  centered,
}: CustomModalProps) {
  const backdrop = {
    visible: { opacity: 1 },
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const CustomModalAnime = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      transition: { delay: 0.1 },
    },
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        key="1"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={CustomModalAnime}
        className={`flex justify-center fixed inset-0 z-40 px-4 ${centered ? "items-center py-4" : "items-start overflow-y-auto py-8"} ${className}`}
      >
        {/* Width props are fixed pixel classes; clamp them to the viewport so
            the panel shrinks on small screens and scrolls instead of clipping. */}
        <div
          className={`bg-white rounded-lg ${width} max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto`}
        >
          {title || subTitle ? (
            <div className="border-b border-[#EAECF0] px-8 py-6">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">{title}</h1>
                {canCloseAtTitle && (
                  <button onClick={() => handleCancel()} className="cursor-pointer">
                    <img src={closeModalIcon} alt="Close" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-sm font-normal text-[#666666]">
                {subTitle}
              </p>
            </div>
          ) : null}
          {children}
          {handleSave && (
            <CTAFooter
              handleCancel={handleCancel}
              handleSave={(e?: any) => handleSave(e)}
              handleSaveBtnText={handleSaveBtnText}
              handleSaveBtnTextClassName={handleSaveBtnTextClassName}
              isHandleSaveBtnLoading={isHandleSaveBtnLoading}
              isHandleSaveBtnDisabled={isHandleSaveBtnDisabled}
              handleReset={handleReset}
            />
          )}
        </div>
      </motion.div>
      <motion.div
        key="2"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="cursor-default bg-[#00000066] z-20 fixed inset-0 w-full h-full backdrop-blur-[10px]"
      />
    </>
  );
}

export default CustomModal;
