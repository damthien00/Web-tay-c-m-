import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { REVENUE_SOURCES } from '../constants/projects';
import { parseVND } from '../utils/currency';
import { useFormValidation } from '../hooks/useFormValidation';
import { FormField } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface AddProjectRevenueModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectRevenueModal({ projectId, isOpen, onClose }: AddProjectRevenueModalProps) {
  const { addRevenue } = useProjects();
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    amount: '',
    description: '',
    source: 'client-payment',
    status: 'received',
    date: new Date().toISOString().split('T')[0],
  };

  const validationRules = {
    amount: {
      required: true,
      custom: (value: string) => {
        const parsed = parseVND(value);
        if (parsed <= 0) return 'Số tiền phải lớn hơn 0';
        if (parsed > 10000000000) return 'Số tiền quá lớn (tối đa 10 tỷ)';
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

    await new Promise(resolve => setTimeout(resolve, 500));

    addRevenue({
	    paidAmount: 0,
	    projectId,
      amount: parsedAmount,
      description: formValues.description.trim(),
      source: formValues.source as any,
      status: formValues.status as any,
      date: formValues.date
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
        <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 mx-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Thêm doanh thu dự án</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <CurrencyInput
              label="Số tiền doanh thu"
              value={values.amount}
              onChange={(value) => setValue('amount', value)}
              onBlur={() => setTouched('amount')}
              error={errors.amount}
              touched={touched.amount}
              required
              helpText="Số tiền doanh thu từ dự án"
            />

            <FormField
              label="Mô tả doanh thu"
              name="description"
              type="text"
              value={values.description}
              onChange={(value) => setValue('description', value)}
              onBlur={() => setTouched('description')}
              error={errors.description}
              touched={touched.description}
              placeholder="Ví dụ: Thanh toán giai đoạn 1, Hoa hồng bán hàng..."
              required
              helpText="Mô tả chi tiết về khoản doanh thu này"
            />

            <FormField
              label="Nguồn doanh thu"
              name="source"
              type="select"
              value={values.source}
              onChange={(value) => setValue('source', value)}
              onBlur={() => setTouched('source')}
              error={errors.source}
              touched={touched.source}
              required
              options={Object.entries(REVENUE_SOURCES).map(([key, source]) => ({
                value: key,
                label: `${source.icon} ${source.name}`
              }))}
            />

            <FormField
              label="Trạng thái thanh toán"
              name="status"
              type="select"
              value={values.status}
              onChange={(value) => setValue('status', value)}
              onBlur={() => setTouched('status')}
              error={errors.status}
              touched={touched.status}
              required
              options={[
                { value: 'received', label: '✅ Đã nhận' },
                { value: 'pending', label: '⏳ Chờ thanh toán' },
                { value: 'overdue', label: '⚠️ Quá hạn' }
              ]}
            />

            {/* Paid Amount */}
            {values.status !== 'received' && (
              <CurrencyInput
                label="Số tiền đã nhận (nếu có)"
                value={values.paidAmount}
                onChange={(value) => setValue('paidAmount', value)}
                onBlur={() => setTouched('paidAmount')}
                error={errors.paidAmount}
                touched={touched.paidAmount}
                placeholder="Ví dụ: 50% đã nhận trước"
                helpText="Để trống nếu chưa nhận gì"
              />
            )}

            {/* Invoice Number */}
            <FormField
              label="Số hóa đơn (tùy chọn)"
              name="invoiceNumber"
              type="text"
              value={values.invoiceNumber}
              onChange={(value) => setValue('invoiceNumber', value)}
              onBlur={() => setTouched('invoiceNumber')}
              error={errors.invoiceNumber}
              touched={touched.invoiceNumber}
              placeholder="Ví dụ: INV-001, HD-2025-001"
              helpText="Số hóa đơn để dễ theo dõi"
            />

            {/* Due Date for pending/overdue */}
            {values.status !== 'received' && (
              <FormField
                label="Ngày đến hạn thanh toán"
                name="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(value) => setValue('dueDate', value)}
                onBlur={() => setTouched('dueDate')}
                error={errors.dueDate}
                touched={touched.dueDate}
                helpText="Ngày khách hàng cần thanh toán"
              />
            )}

            <FormField
              label="Ngày doanh thu"
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
                variant="success"
                className="flex-1"
              >
                {isSubmitting ? 'Đang thêm...' : 'Thêm doanh thu'}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Doanh thu đã được thêm vào dự án! 💰"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
