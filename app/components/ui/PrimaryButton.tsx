import { ArrowRightIcon } from "../icons";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  active?: boolean;
  showArrow?: boolean;
}

export function PrimaryButton({ children, onClick, type = "button", active = true, showArrow = true }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${active ? "bg-muted" : "bg-placeholder"} flex items-center justify-center gap-1 px-[30px] py-[10px] rounded-card w-full cursor-pointer transition-colors`}
    >
      <span className="text-white text-[16px] font-medium tracking-brand">{children}</span>
      {showArrow && <ArrowRightIcon />}
    </button>
  );
}
