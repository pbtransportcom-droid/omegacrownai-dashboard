import { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent ${props.className || ''}`}
    />
  );
}
