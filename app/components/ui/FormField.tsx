interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  // 명세대로 필드 하단에 표시할 에러 메시지 (없으면 미렌더)
  error?: string | null;
}

export function FormField({ label, id, name, type = "text", value, onChange, placeholder, error }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-[10px] items-start w-full">
      <label htmlFor={id} className="pl-3 text-foreground text-[16px] font-semibold tracking-brand w-full">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="bg-surface px-5 py-[10px] rounded-card w-full text-[16px] tracking-brand text-foreground placeholder:text-placeholder outline-none"
      />
      {error && (
        <p id={errorId} className="pl-3 text-[#c44] text-[13px] font-medium">{error}</p>
      )}
    </div>
  );
}
