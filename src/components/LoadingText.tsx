const LoadingText = ({
  width = 'w-[200px]',
  height = "h-[15px]",
}: {
  width?: string;
  height?: string;
}) => {
  return (
    <div className="animate-pulse flex flex-col gap-2 py-2">
      <div className={`${height} ${width} bg-slate-300`} />
    </div>
  );
};

export default LoadingText;
