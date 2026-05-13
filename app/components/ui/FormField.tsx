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
      <label htmlFor={id} className="pl-3 text-[#474741] text-[16px] font-semibold tracking-[0.7px] w-full">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-[#f4f3f1] px-5 py-[10px] rounded-[6px] w-full text-[16px] tracking-[0.7px] text-[#474741] placeholder:text-[#a3a3a3] outline-none"
      />
    </div>
  );
}
