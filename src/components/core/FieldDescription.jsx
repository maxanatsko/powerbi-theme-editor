import React from 'react';

export const FieldDescription = ({ label, tooltip }) => {
  return (
    <div className="space-y-1.5">
      <h3 className="text-lg font-semibold text-gray-900">
        {label}
      </h3>
      {tooltip && (
        <p className="text-sm text-gray-500 max-w-xl">
          {tooltip}
        </p>
      )}
    </div>
  );
};