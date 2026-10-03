import React from 'react';

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'surface' | 'danger' | 'ghost' | 'active';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  active?: boolean;
}

export const Button3D: React.FC<Button3DProps> = ({
  variant = 'surface',
  size = 'md',
  icon,
  children,
  active,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 h-7 gap-1.5',
    md: 'text-sm px-3.5 py-2 h-9 gap-2',
    lg: 'text-base px-5 py-2.5 h-11 gap-2.5',
    icon: 'p-2 h-9 w-9 justify-center',
  }[size];

  const variantClasses = {
    primary: 'btn-3d-primary font-medium',
    surface: 'btn-3d bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:bg-neutral-900 border-neutral-700',
    danger: 'btn-3d-danger font-medium',
    active: 'btn-3d bg-blue-600 text-white border-blue-500 shadow-inner font-semibold',
    ghost: 'hover:bg-white/10 active:bg-white/20 text-neutral-300 hover:text-white rounded-md transition-colors',
  }[active ? 'active' : variant];

  return (
    <button
      className={`inline-flex items-center justify-center select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
    </button>
  );
};
