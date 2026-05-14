interface StepHeaderProps {
  step: number;
  title: string;
}

export function StepHeader({ step, title }: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-[6px] pt-[11px]">
      <span className="text-foreground text-[17px] font-semibold tracking-brand">
        {String(step).padStart(2, "0")}
      </span>
      <span className="text-foreground text-[20px] font-semibold tracking-brand">{title}</span>
    </div>
  );
}
