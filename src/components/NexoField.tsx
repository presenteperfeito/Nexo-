import React from "react";

type NexoInputProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

export function NexoInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: NexoInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-white text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
      />
    </div>
  );
}

type NexoTextAreaProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

export function NexoTextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
}: NexoTextAreaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-white text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}
