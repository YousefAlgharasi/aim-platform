import { ButtonHTMLAttributes } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

// All visuals live in ./buttonStyles so <Button>, link-buttons and raw buttons stay identical.
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${buttonClasses(variant, size, fullWidth)} ${className}`} {...props}>
      {children}
    </button>
  );
}
