import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button3D } from './Button3D';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[95vw] h-[90vh]',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthClasses} bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-blue-400">{icon}</div>}
            <div>
              <h2 className="text-base font-semibold text-neutral-100">{title}</h2>
              {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <Button3D variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </Button3D>
        </div>

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto flex-1 text-sm text-neutral-200">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/60 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
