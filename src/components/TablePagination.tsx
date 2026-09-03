interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const TablePagination = ({
  page,
  totalPages,
  onPrevious,
  onNext,
}: TablePaginationProps) => (
  <div className="flex items-center justify-between px-1 py-4">
    <button
      type="button"
      onClick={onPrevious}
      disabled={page === 1}
      className="flex items-center gap-2 bg-brand-light-gray rounded-lg px-4 py-2.5 text-sm text-brand-black hover:bg-brand-gray cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Previous
    </button>

    <span className="text-sm text-brand-dark-gray">
      Page {page} of {totalPages}
    </span>

    <button
      type="button"
      onClick={onNext}
      disabled={page === totalPages}
      className="flex items-center gap-2 bg-white border border-brand-neutral rounded-lg px-4 py-2.5 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  </div>
);

export default TablePagination;
