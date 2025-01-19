import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Alert = ({ children, className = '', variant = 'default', ...props }) => {
  const baseStyles = 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground';
  
  const variantStyles = {
    default: 'bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface text-theme-light-text-primary dark:text-theme-dark-text-primary border-theme-light-border-default dark:border-theme-dark-border-default',
    destructive: 'border-theme-light-state-error dark:border-theme-dark-state-error text-theme-light-state-error dark:text-theme-dark-state-error bg-theme-light-state-error/10 dark:bg-theme-dark-state-error/10 [&>svg]:text-theme-light-state-error dark:text-theme-dark-state-error'
  };

  return (
    <div
      role="alert"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <AlertCircle className="h-4 w-4" />
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};