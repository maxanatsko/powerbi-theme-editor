import React from 'react';
import { Label } from "@/components/ui/label";

const FormField = ({ label, required, children, description }) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-start gap-0.5">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {children}
    </div>
  );
};

export default FormField;