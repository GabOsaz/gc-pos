interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search",
  width = "w-72",
}: SearchInputProps) => (
  <div className="relative">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-logan-grey pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`pl-10 pr-4 py-2.5 border border-brand-neutral rounded-lg text-sm text-brand-black placeholder:text-brand-logan-grey outline-none focus:border-brand-blue bg-white ${width}`}
    />
  </div>
);

export default SearchInput;
