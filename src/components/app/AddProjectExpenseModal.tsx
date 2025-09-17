import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { EXPENSE_CATEGORIES } from '../../constants/projects';
import { parseVND } from '../../utils/currency';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface AddProjectExpenseModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectExpenseModal({ projectId, isOpen, onClose }: AddProjectExpenseModalProps) {
  const { addExpense } = useProjects();
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    amount: '',
    description: '',
    category: 'development',
    date: new Date().toISOString().split('T')[0],
  };

  const validationRules = {
    amount: {
      required: true,
      custom: (value: string) => {
        const parsed = parseVND(value);
        if (parsed <= 0) return 'Số tiền phải lớn hơn 0';
        if (parsed > 1000000000) return 'Số tiền quá lớn (tối đa 1 tỷ)';
        return null;
      }
    },
    description: {
      required: true,
      minLength: 3,
      maxLength: 200,
    },
    date: {
      required: true,
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
    const parsedAmount = parseVND(formValues.amount);

    addExpense({
      projectId,
      amount: parsedAmount,
      description: formValues.description.trim(),
      category: formValues.category as any,
      date: formValues.date,
    });

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 1500);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 mx-2 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Thêm chi phí dự án</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

	        <div className="overflow-y-auto flex-1 pr-2">
		        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
			        <CurrencyInput
				        label="Số tiền chi phí"
				        value={values.amount}
				        onChange={(value) => setValue('amount', value)}
				        onBlur={() => setTouched('amount')}
				        error={errors.amount}
				        touched={touched.amount}
				        required
				        helpText="Số tiền chi phí cho dự án"
			        />

			        <FormField
				        label="Mô tả chi phí"
				        name="description"
				        type="text"
				        value={values.description}
				        onChange={(value) => setValue('description', value)}
				        onBlur={() => setTouched('description')}
				        error={errors.description}
				        touched={touched.description}
				        placeholder="Ví dụ: Thuê developer, Mua hosting..."
				        required
				        helpText="Mô tả chi tiết về khoản chi phí này"
			        />

			        <FormField
				        label="Danh mục chi phí"
				        name="category"
				        type="select"
				        value={values.category}
				        onChange={(value) => setValue('category', value)}
				        onBlur={() => setTouched('category')}
				        error={errors.category}
				        touched={touched.category}
				        required
				        options={Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => ({
					        value: key,
					        label: `${cat.icon} ${cat.name}`
				        }))}
			        />

			        <FormField
				        label="Ngày chi phí"
				        name="date"
				        type="date"
				        value={values.date}
				        onChange={(value) => setValue('date', value)}
				        onBlur={() => setTouched('date')}
				        error={errors.date}
				        touched={touched.date}
				        required
			        />

			        <div className="flex space-x-3">
				        <button
					        type="button"
					        onClick={handleClose}
					        disabled={isSubmitting}
					        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm sm:text-base"
				        >
					        Hủy
				        </button>
				        <LoadingButton
					        type="submit"
					        isLoading={isSubmitting}
					        disabled={!isValid}
					        variant="danger"
					        className="flex-1"
				        >
					        {isSubmitting ? 'Đang thêm...' : 'Thêm chi phí'}
				        </LoadingButton>
			        </div>
		        </form>
	        </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Chi phí đã được thêm vào dự án! 💸"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
