interface ProgressBarProps {
  value: number;
  pulse?: boolean;
}

export function ProgressBar({ value, pulse = false }: ProgressBarProps) {
  const isFull = value >= 1;
  return (
    <div className="relative py-[10px]">
      <div className="bg-[#d9d9d9] h-[9px] rounded-[4px] w-full" />
      <div
        className={`absolute bg-[#775a19] h-[9px] left-0 top-[10px] ${isFull ? "rounded-[4px]" : "rounded-l-[4px]"} ${pulse ? "animate-pulse" : ""}`}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
