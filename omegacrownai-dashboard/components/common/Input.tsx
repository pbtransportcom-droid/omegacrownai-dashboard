import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-muted focus:border-accent ${props.className || ''}`}
    />
  );
}
