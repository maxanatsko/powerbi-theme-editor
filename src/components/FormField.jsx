import React from 'react';
import { Label } from "@/components/ui/label";

const FormField = ({ label, required, children, description, className = '' }) => {
  return (
    <div className={`space-y-2 border-b pb-4 last:border-b-0
      border-theme-light-border-default dark:border-theme-dark-border-default ${className}`}>
      <Label className="flex items-start gap-0.5 text-theme-light-text-primary dark:text-theme-dark-text-primary">
        {label}
        {required && <span className="text-theme-light-state-error dark:text-theme-dark-state-error">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary">{description}</p>
      )}
      <div className="bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface rounded-md p-4">
        {children}
      </div>
    </div>
  );
};

export default FormField;