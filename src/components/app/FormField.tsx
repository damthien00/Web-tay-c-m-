import React, { useState } from 'react';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'select' | 'textarea';
  value: any;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  placeholder,
  options,
  prefix,
  suffix,
  helpText,
  required,
  disabled,
  rows = 3,
  onChange,
  onBlur,
  onFocus,
  className = '',
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = touched && error;
  const isValid = touched && !error && value;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const inputClasses = `
    w-full p-3 border rounded-xl transition-all duration-200 
    ${prefix ? 'pl-10' : ''} 
    ${suffix || type === 'password' ? 'pr-10' : ''}
    ${hasError 
      ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
      : isValid
      ? 'border-green-300 bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500'
      : isFocused
      ? 'border-red-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
    }
    focus:outline-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim();

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className={inputClasses}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={inputClasses}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              id={name}
              name={name}
              type={showPassword ? 'text' : 'password'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded p-1"
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            {prefix}
          </div>
        )}

        {renderInput()}

        {suffix && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            {suffix}
          </div>
        )}

        {/* Validation Icons */}
        {type !== 'password' && (isValid || hasError) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="flex items-center space-x-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {isValid && (
        <div className="flex items-center space-x-2 text-green-600 text-sm animate-in slide-in-from-top-1 duration-200">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Hợp lệ</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
