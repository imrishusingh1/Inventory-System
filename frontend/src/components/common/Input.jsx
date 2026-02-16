import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(
          clsx(
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200",
            "border-gray-300 focus:border-brand-500 focus:ring-brand-200",
            "placeholder-gray-400 text-gray-900 bg-white",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className
          )
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-pulse">{error.message}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
