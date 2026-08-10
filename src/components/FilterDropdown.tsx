import React from "react";

interface FilterDropdownProps {
  value: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Trigger label while nothing is filtered. */
  placeholder?: string;
  /** Option that means "no filter" — shown as `allLabel` in the list. */
  allValue?: string;
  allLabel?: string;
}

const FilterDropdown = ({
  value,
  options,
  onSelect,
  open,
  onToggle,
  containerRef,
  placeholder = "Filter",
  allValue = "All",
  allLabel = "All",
}: FilterDropdownProps) => (
  <div className="relative" ref={containerRef}>
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 bg-white border border-brand-neutral rounded-lg px-4 py-2.5 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer"
    >
      {value === allValue ? placeholder : value}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform ${open ? "rotate-180" : ""}`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    {open && (
      <div className="absolute left-0 top-12 z-20 w-48 bg-white border border-brand-neutral rounded-lg shadow-lg py-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-lighter-gray cursor-pointer ${
              value === option ? "text-brand-blue font-medium" : "text-brand-black"
            }`}
          >
            {option === allValue ? allLabel : option}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default FilterDropdown;
