import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { PROJECT_CATEGORIES } from '../../constants/projects';
import { parseVND } from '../../utils/currency';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const { addProject } = useProjects();
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    name: '',
    description: '',
    budget: '',
    category: 'web-development',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    currency: 'VND',
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    budget: {
      required: true,
      custom: (value: string) => {
        const parsed = parseVND(value);
        if (parsed <= 0) return 'Ngân sách phải lớn hơn 0';
        if (parsed < 100000) return 'Ngân sách tối thiểu là 100,000₫';
        if (parsed > 10000000000) return 'Ngân sách quá lớn (tối đa 10 tỷ)';
        return null;
      }
    },
    startDate: {
      required: true,
    },
    endDate: {
      required: false,
      custom: (value: string) => {
        if (value && values.startDate) {
          const start = new Date(values.startDate);
          const end = new Date(value);
          if (end <= start) return 'Ngày kết thúc phải sau ngày bắt đầu';
        }
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
    await addProject({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      budget: parseVND(formValues.budget),
      category: formValues.category as any,
      status: formValues.status as any,
      startDate: formValues.startDate,
      endDate: formValues.endDate || undefined,
      currency: formValues.currency as any,
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
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
	      <div className={'bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto'}>
		      <div className="max-w-md mx-auto p-6 space-y-6">
			      <div className="flex items-center justify-between">
				      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tạo dự án mới</h2>
				      <button
					      onClick={handleClose}
					      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
				      >
					      <X className="w-5 h-5" />
				      </button>
			      </div>

			      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
				      {/* Project Name */}
				      <FormField
					      label="Tên dự án"
					      name="name"
					      type="text"
					      value={values.name}
					      onChange={(value) => setValue('name', value)}
					      onBlur={() => setTouched('name')}
					      error={errors.name}
					      touched={touched.name}
					      placeholder="Ví dụ: Website bán hàng cho ABC Store"
					      required
					      helpText="Tên dự án rõ ràng, dễ nhận biết (3-100 ký tự)"
				      />

				      {/* Description */}
				      <FormField
					      label="Mô tả dự án"
					      name="description"
					      type="textarea"
					      value={values.description}
					      onChange={(value) => setValue('description', value)}
					      onBlur={() => setTouched('description')}
					      error={errors.description}
					      touched={touched.description}
					      placeholder="Mô tả chi tiết về dự án, mục tiêu và phạm vi công việc..."
					      required
					      helpText="Mô tả chi tiết về dự án (10-500 ký tự)"
					      rows={4}
				      />

				      {/* Category */}
				      <FormField
					      label="Loại dự án"
					      name="category"
					      type="select"
					      value={values.category}
					      onChange={(value) => setValue('category', value)}
					      onBlur={() => setTouched('category')}
					      error={errors.category}
					      touched={touched.category}
					      required
					      options={Object.entries(PROJECT_CATEGORIES).map(([key, cat]) => ({
						      value: key,
						      label: `${cat.icon} ${cat.name}`
					      }))}
				      />

				      {/* Budget */}
				      <CurrencyInput
					      label="Ngân sách dự án"
					      value={values.budget}
					      onChange={(value) => setValue('budget', value)}
					      onBlur={() => setTouched('budget')}
					      error={errors.budget}
					      touched={touched.budget}
					      placeholder="Ví dụ: 50tr, 100k, 5000000"
					      required
					      helpText="Tổng ngân sách dự kiến cho dự án (tối thiểu 100,000₫)"
				      />

				      {/* Status */}
				      <FormField
					      label="Trạng thái"
					      name="status"
					      type="select"
					      value={values.status}
					      onChange={(value) => setValue('status', value)}
					      onBlur={() => setTouched('status')}
					      error={errors.status}
					      touched={touched.status}
					      required
					      options={[
						      { value: 'planning', label: '📋 Lên kế hoạch' },
						      { value: 'active', label: '🚀 Đang thực hiện' },
						      { value: 'on-hold', label: '⏸️ Tạm dừng' },
						      { value: 'completed', label: '✅ Hoàn thành' }
					      ]}
				      />

				      {/* Dates */}
				      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					      <FormField
						      label="Ngày bắt đầu"
						      name="startDate"
						      type="date"
						      value={values.startDate}
						      onChange={(value) => setValue('startDate', value)}
						      onBlur={() => setTouched('startDate')}
						      error={errors.startDate}
						      touched={touched.startDate}
						      required
					      />

					      <FormField
						      label="Ngày kết thúc (dự kiến)"
						      name="endDate"
						      type="date"
						      value={values.endDate}
						      onChange={(value) => setValue('endDate', value)}
						      onBlur={() => setTouched('endDate')}
						      error={errors.endDate}
						      touched={touched.endDate}
						      helpText="Có thể để trống nếu chưa xác định"
					      />
				      </div>

				      {/* Currency */}
				      {/*<FormField*/}
					    {/*  label="Đơn vị tiền tệ"*/}
					    {/*  name="currency"*/}
					    {/*  type="select"*/}
					    {/*  value={values.currency}*/}
					    {/*  onChange={(value) => setValue('currency', value)}*/}
					    {/*  onBlur={() => setTouched('currency')}*/}
					    {/*  error={errors.currency}*/}
					    {/*  touched={touched.currency}*/}
					    {/*  required*/}
					    {/*  options={[*/}
						  {/*    { value: 'VND', label: '🇻🇳 Việt Nam Đồng (₫)' },*/}
						  {/*    { value: 'USD', label: '🇺🇸 US Dollar ($)' }*/}
					    {/*  ]}*/}
				      {/*/>*/}

				      {/* Submit Button */}
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
						      variant="primary"
						      className="flex-1"
					      >
						      {isSubmitting ? 'Đang tạo...' : 'Tạo dự án'}
					      </LoadingButton>
				      </div>
			      </form>
		      </div>
				</div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Dự án đã được tạo thành công! 🎉"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
