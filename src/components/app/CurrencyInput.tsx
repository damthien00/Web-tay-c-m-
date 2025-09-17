import React, { useState, useEffect } from 'react';
import { parseVND, formatInputPreview } from '../../utils/currency';
import { Check, AlertCircle } from 'lucide-react';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder = "Ví dụ: 50k, 1.5tr, 500000",
  required,
  disabled,
  helpText,
  className = '',
}: CurrencyInputProps) {
  const [preview, setPreview] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value) {
      const previewText = formatInputPreview(value);
      setPreview(previewText);
    } else {
      setPreview('');
    }
  }, [value]);

  const hasError = touched && error;
  const isValid = touched && !error && value && parseVND(value) > 0;
  const parsedAmount = parseVND(value);

  const inputClasses = `
    w-full p-3 pr-10 border rounded-xl transition-all duration-200
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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isValid ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : hasError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <span className="text-gray-500">₫</span>
          )}
        </div>
      </div>

      {/* Real-time Preview */}
      {preview && !hasError && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Xem trước:</span>
            <span className="font-semibold text-green-600">{preview}</span>
          </div>
          {parsedAmount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Số tiền: {parsedAmount.toLocaleString('vi-VN')} VND
            </div>
          )}
        </div>
      )}

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
          <span>Số tiền hợp lệ</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* Format Examples */}
      {isFocused && !value && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 animate-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-blue-700 font-medium mb-2">Các định dạng được hỗ trợ:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
            <div>• 50k = 50,000₫</div>
            <div>• 1.5tr = 1,500,000₫</div>
            <div>• 2b = 2,000,000,000₫</div>
            <div>• 500000 = 500,000₫</div>
          </div>
        </div>
      )}
    </div>
  );
}
