interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function FormField({ label, id, name, type = "text", value, onChange, placeholder }: FormFieldProps) {
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
        className="bg-surface px-5 py-[10px] rounded-card w-full text-[16px] tracking-brand text-foreground placeholder:text-placeholder outline-none"
      />
    </div>
  );
}
