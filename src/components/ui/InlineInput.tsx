import { forwardRef, type InputHTMLAttributes } from "react";

interface InlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InlineInput = forwardRef<HTMLInputElement, InlineInputProps>(
  function InlineInput({ inputRef, className = "", ...props }, ref) {
    return (
      <input
        ref={ref || inputRef}
        className={`border-2 border-transparent bg-transparent px-1 py-0.5 text-base font-bold text-text outline-none transition-all focus:border-text focus:pl-1 ${className}`}
        {...props}
      />
    );
  }
);
