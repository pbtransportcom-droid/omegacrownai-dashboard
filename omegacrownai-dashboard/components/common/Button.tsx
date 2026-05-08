import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-accent text-white hover:bg-[#5b4df1]',
    secondary: 'bg-white/5 text-text hover:bg-white/10 border border-border',
    ghost: 'bg-transparent text-muted hover:bg-white/5'
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${styles} ${className}`}
      {...props}
    />
  );
}
