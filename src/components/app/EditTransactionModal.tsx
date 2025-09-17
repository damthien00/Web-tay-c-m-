import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactions } from '../../contexts/TransactionContext';
import { Transaction, TransactionCategory, PaymentMethod } from '../../types/Transaction';
import { CATEGORY_INFO, PAYMENT_METHOD_INFO } from '../../constants/vietnamese';
import { parseVND } from '../../utils/currency';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
  const { updateTransaction } = useTransactions();
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    type: transaction.type,
    amount: transaction.amount.toString(),
    category: transaction.category,
    description: transaction.description,
    paymentMethod: transaction.paymentMethod,
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
      minLength: 2,
      maxLength: 100,
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

  useEffect(() => {
    if (transaction && isOpen) {
      setValue('type', transaction.type);
      setValue('amount', transaction.amount.toString());
      setValue('category', transaction.category);
      setValue('description', transaction.description);
      setValue('paymentMethod', transaction.paymentMethod);
    }
  }, [transaction, isOpen, setValue]);

  const incomeCategories = Object.keys(CATEGORY_INFO).filter(cat =>
    ['luong-chinh', 'thu-nhap-phu', 'kinh-doanh', 'dau-tu', 'tien-thuong', 'tien-cho'].includes(cat)
  ) as TransactionCategory[];

  const expenseCategories = Object.keys(CATEGORY_INFO).filter(cat =>
    !incomeCategories.includes(cat as TransactionCategory)
  ) as TransactionCategory[];

  const onSubmit = async (formValues: typeof initialValues) => {
    const parsedAmount = parseVND(formValues.amount);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    updateTransaction(transaction.id, {
      type: formValues.type,
      amount: parsedAmount,
      category: formValues.category,
      description: formValues.description.trim(),
      paymentMethod: formValues.paymentMethod,
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

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setValue('type', newType);
    // Auto-select appropriate category when type changes
    if (newType === 'income' && expenseCategories.includes(values.category)) {
      setValue('category', 'luong-chinh');
    } else if (newType === 'expense' && incomeCategories.includes(values.category)) {
      setValue('category', 'an-uong-duong-pho');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="bg-white w-full rounded-t-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa giao dịch</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giao dịch <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`p-3 rounded-xl border font-medium transition-all duration-200 ${
                    values.type === 'expense'
                      ? 'bg-red-50 border-red-200 text-red-800 scale-[1.02]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Chi tiêu
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`p-3 rounded-xl border font-medium transition-all duration-200 ${
                    values.type === 'income'
                      ? 'bg-green-50 border-green-200 text-green-800 scale-[1.02]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Thu nhập
                </button>
              </div>
            </div>

            {/* Amount */}
            <CurrencyInput
              label="Số tiền"
              value={values.amount}
              onChange={(value) => setValue('amount', value)}
              onBlur={() => setTouched('amount')}
              error={errors.amount}
              touched={touched.amount}
              required
              helpText="Hỗ trợ nhiều định dạng: 50k, 1.5tr, 500000"
            />

            {/* Category */}
            <FormField
              label="Danh mục"
              name="category"
              type="select"
              value={values.category}
              onChange={(value) => setValue('category', value)}
              onBlur={() => setTouched('category')}
              error={errors.category}
              touched={touched.category}
              required
              options={(values.type === 'income' ? incomeCategories : expenseCategories).map((cat) => ({
                value: cat,
                label: `${CATEGORY_INFO[cat].icon} ${CATEGORY_INFO[cat].name}`
              }))}
            />

            {/* Description */}
            <FormField
              label="Mô tả"
              name="description"
              type="text"
              value={values.description}
              onChange={(value) => setValue('description', value)}
              onBlur={() => setTouched('description')}
              error={errors.description}
              touched={touched.description}
              placeholder="Ví dụ: Phở bò tái, Xăng xe máy..."
              required
              helpText="Mô tả ngắn gọn về giao dịch (2-100 ký tự)"
            />

            {/* Payment Method */}
            <FormField
              label="Phương thức thanh toán"
              name="paymentMethod"
              type="select"
              value={values.paymentMethod}
              onChange={(value) => setValue('paymentMethod', value)}
              onBlur={() => setTouched('paymentMethod')}
              error={errors.paymentMethod}
              touched={touched.paymentMethod}
              required
              options={Object.keys(PAYMENT_METHOD_INFO).map((method) => ({
                value: method,
                label: `${PAYMENT_METHOD_INFO[method as PaymentMethod].icon} ${PAYMENT_METHOD_INFO[method as PaymentMethod].name}`
              }))}
            />

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
                variant="primary"
                className="flex-1"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật giao dịch'}
              </LoadingButton>
            </div>
          </form>

          {/* Form Progress */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {['amount', 'description'].map((field) => (
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
              {Object.keys(touched).filter(key => touched[key] && !errors[key] && values[key]).length}/2 hoàn thành
            </span>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Giao dịch đã được cập nhật thành công! ✨"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
