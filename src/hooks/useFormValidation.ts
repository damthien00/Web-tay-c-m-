import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  min?: number;
  max?: number;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState {
  values: { [key: string]: any };
  errors: ValidationErrors;
  touched: { [key: string]: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

export function useFormValidation(initialValues: any, validationRules: ValidationRules) {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Trường này là bắt buộc';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Tối thiểu ${rule.minLength} ký tự`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Tối đa ${rule.maxLength} ký tự`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Định dạng không hợp lệ';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `Giá trị tối thiểu là ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `Giá trị tối đa là ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((values: any): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [validateField, validationRules]);

  const setValue = useCallback((name: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const fieldError = validateField(name, value);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      const allErrors = validateForm(newValues);
      const isValid = Object.keys(allErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateField, validateForm]);

  const setTouched = useCallback((name: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmit: (values: any) => Promise<void> | void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      const errors = validateForm(formState.values);
      
      setFormState(prev => ({
        ...prev,
        errors,
        touched: allTouched,
        isValid: Object.keys(errors).length === 0,
        isSubmitting: true,
      }));

      if (Object.keys(errors).length === 0) {
        try {
          await onSubmit(formState.values);
          reset();
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    };
  }, [formState.values, validateForm, validationRules, reset]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    setValue,
    setTouched,
    setSubmitting,
    reset,
    handleSubmit,
  };
}