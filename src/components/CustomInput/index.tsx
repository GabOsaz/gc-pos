/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import { useState } from "react";
import show from "../../assets/svg/show-password.svg";
import hide from "../../assets/svg/hide-password.svg";
import searchIcon from "../../assets/svg/search-icon.svg";
import LoadingText from "../LoadingText";

interface CustomInputProps {
  id?: string;
  label?: string;
  name?: string;
  type?: string;
  value?: string | number;
  defaultValue?: any;
  // eslint-disable-next-line no-unused-vars
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  placeholder: string;
  className?: string;
  readOnly?: boolean;
  canSelect?: boolean;
  canCheck?: boolean;
  selectOptions?: {
    id: string | number;
    name: string;
  }[];
  isDisabled?: boolean;
  rest?: any;
  isLoading?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  isRequired?: boolean;
  bg?: string;
  showSearchIcon?: boolean;
}

function CustomInput({
  label,
  id,
  type = "text",
  onChange,
  placeholder,
  className,
  readOnly,
  canSelect,
  canCheck: _canCheck,
  selectOptions,
  isDisabled,
  name,
  value,
  isLoading,
  isInvalid,
  errorMessage,
  onBlur,
  isRequired,
  defaultValue,
  bg,
  rest,
  showSearchIcon,
}: CustomInputProps) {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [showRequiredError, setShowRequiredError] = useState(false);

  const displayCurrentBody = () => {
    switch (true) {
      case canSelect:
        return (
          <select
            onChange={onChange}
            id={id ?? label}
            value={value}
            defaultValue={defaultValue}
            name={name}
            onBlur={onBlur}
            disabled={isDisabled}
            className={`${className} bg-brand-lightGray rounded-md px-4 py-3`}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {selectOptions?.map((option, idx) => (
              <option value={option?.id} key={`${option?.id}-${idx}`}>
                {option?.name}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <>
            {isLoading ? (
              <LoadingText height="h-[35px]" width="w-full" />
            ) : (
              <div>
                <div className="relative">
                  {showSearchIcon && (
                    <img
                      src={searchIcon}
                      alt="search icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                  <input
                    id={id ?? label}
                    value={value}
                    disabled={isDisabled}
                    name={name}
                    type={isShowPassword ? "text" : type}
                    onChange={onChange}
                    onBlur={(e) => {
                      onBlur?.(e);
                      setShowRequiredError(
                        isRequired ? (e.target.value as string)?.length === 0 : false
                      );
                    }}
                    style={{ backgroundColor: bg ?? (isDisabled ? "#EDF0F2" : "white") }}
                    placeholder={placeholder}
                    className={`w-full ${showSearchIcon ? 'pl-12' : ''} ${className} rounded-lg px-4 py-3 ${
                      isDisabled ? "bg-slate-500" : ""
                    } ${readOnly ? "cursor-default" : ""}`}
                    readOnly={readOnly}
                    aria-invalid={isInvalid || showRequiredError}
                    required={isRequired}
                    {...rest}
                  />
                  {type === "password" ? (
                    <div
                      className="absolute right-2 top-2 cursor-pointer"
                      onClick={() => setIsShowPassword(!isShowPassword)}
                    >
                      <img
                        src={isShowPassword ? hide : show}
                        alt="password eye icon"
                        className="w-6 h-6"
                      />
                    </div>
                  ) : null}
                </div>
                {isInvalid ? (
                  <p className="text-sm text-brand-crimson">{errorMessage}</p>
                ) : null}
                {showRequiredError &&
                (value as string)?.length === 0 &&
                !isInvalid ? (
                  <p className="text-sm text-brand-crimson">
                    This field is required
                  </p>
                ) : null}
              </div>
            )}
          </>
        );
    }
  };
  return (
    <div className="grow">
      <label
        htmlFor={id ?? label}
        className="hover:cursor-pointer text-sm mb-2"
      >
        {label}
      </label>
      {displayCurrentBody()}
    </div>
  );
}

export default CustomInput;
