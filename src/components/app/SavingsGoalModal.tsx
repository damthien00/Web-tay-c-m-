import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSavingsGoals } from '../../contexts/SavingsGoalContext';
import { SAVINGS_GOAL_CATEGORIES } from '../../constants/savingsGoals';
import { parseVND } from '../../utils/currency';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsGoalModal({ isOpen, onClose }: SavingsGoalModalProps) {
  const { addGoal } = useSavingsGoals();
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'emergency',
  };

  const validationRules = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 50,
      custom: (value: string) => {
        if (value && value.trim().length < 3) return 'Tên mục tiêu quá ngắn';
        return null;
      }
    },
    targetAmount: {
      required: true,
      custom: (value: string) => {
        const parsed = parseVND(value);
        if (parsed <= 0) return 'Số tiền phải lớn hơn 0';
        if (parsed < 10000) return 'Số tiền tối thiểu là 10,000₫';
        if (parsed > 10000000000) return 'Số tiền quá lớn (tối đa 10 tỷ)';
        return null;
      }
    },
    deadline: {
      required: true,
      custom: (value: string) => {
        if (!value) return null;
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) return 'Thời hạn phải là ngày trong tương lai';

        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10);
        if (selectedDate > maxDate) return 'Thời hạn không được quá 10 năm';

        return null;
      }
    },
  };

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    reset,
  } = useFormValidation(initialValues, validationRules);

  const onSubmit = async (formValues: typeof initialValues) => {
    const parsedAmount = parseVND(formValues.targetAmount);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    addGoal({
      title: formValues.title.trim(),
      targetAmount: parsedAmount,
      deadline: formValues.deadline,
      category: formValues.category as any,
    });

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 2000);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getDeadlineHelpText = () => {
    if (values.deadline) {
      const selectedDate = new Date(values.deadline);
      const today = new Date();
      const diffTime = selectedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        if (diffDays === 1) return 'Mục tiêu trong 1 ngày';
        if (diffDays <= 30) return `Mục tiêu trong ${diffDays} ngày`;
        if (diffDays <= 365) return `Mục tiêu trong ${Math.ceil(diffDays / 30)} tháng`;
        return `Mục tiêu trong ${Math.ceil(diffDays / 365)} năm`;
      }
    }
    return 'Chọn thời hạn hoàn thành mục tiêu';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="bg-white w-full rounded-t-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Tạo mục tiêu tiết kiệm</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Goal Title */}
            <FormField
              label="Tên mục tiêu"
              name="title"
              type="text"
              value={values.title}
              onChange={(value) => setValue('title', value)}
              onBlur={() => setTouched('title')}
              error={errors.title}
              touched={touched.title}
              placeholder="Ví dụ: Mua xe máy mới, Du lịch Phú Quốc..."
              required
              helpText="Tên mục tiêu rõ ràng, dễ nhớ (3-50 ký tự)"
            />

            {/* Category */}
            <FormField
              label="Loại mục tiêu"
              name="category"
              type="select"
              value={values.category}
              onChange={(value) => setValue('category', value)}
              onBlur={() => setTouched('category')}
              error={errors.category}
              touched={touched.category}
              required
              options={Object.entries(SAVINGS_GOAL_CATEGORIES).map(([key, cat]) => ({
                value: key,
                label: `${cat.icon} ${cat.name} - ${cat.description}`
              }))}
            />

            {/* Target Amount */}
            <CurrencyInput
              label="Số tiền mục tiêu"
              value={values.targetAmount}
              onChange={(value) => setValue('targetAmount', value)}
              onBlur={() => setTouched('targetAmount')}
              error={errors.targetAmount}
              touched={touched.targetAmount}
              placeholder="Ví dụ: 50tr, 100k, 5000000"
              required
              helpText="Số tiền bạn muốn tiết kiệm (tối thiểu 10,000₫)"
            />

            {/* Deadline */}
            <FormField
              label="Thời hạn"
              name="deadline"
              type="date"
              value={values.deadline}
              onChange={(value) => setValue('deadline', value)}
              onBlur={() => setTouched('deadline')}
              error={errors.deadline}
              touched={touched.deadline}
              required
              helpText={getDeadlineHelpText()}
            />

            {/* Goal Preview */}
            {values.title && values.targetAmount && values.deadline && !errors.title && !errors.targetAmount && !errors.deadline && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top-1 duration-300">
                <h4 className="font-semibold text-green-800 mb-2">Xem trước mục tiêu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Tên:</span>
                    <span className="font-medium text-green-800">{values.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Mục tiêu:</span>
                    <span className="font-medium text-green-800">{parseVND(values.targetAmount).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Thời hạn:</span>
                    <span className="font-medium text-green-800">
                      {new Date(values.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                variant="success"
                className="flex-1"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo mục tiêu'}
              </LoadingButton>
            </div>
          </form>

          {/* Form Progress */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {['title', 'targetAmount', 'deadline'].map((field) => (
                <div
                  key={field}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    touched[field] && !errors[field] && values[field]
                      ? 'bg-green-500 scale-110'
                      : touched[field] && errors[field]
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {Object.keys(touched).filter(key => touched[key] && !errors[key] && values[key]).length}/3 hoàn thành
            </span>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Mục tiêu tiết kiệm đã được tạo thành công! 🎯"
        onClose={() => setShowSuccess(false)}
        duration={2000}
      />
    </>
  );
}
