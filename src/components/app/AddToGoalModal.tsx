import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSavingsGoals } from '../../contexts/SavingsGoalContext';
import { parseVND } from '../../utils/currency';
import { useFormValidation } from '../../hooks/useFormValidation';
import { CurrencyInput } from './CurrencyInput';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';
import { formatCurrency } from '../../utils/currency';

interface AddToGoalModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToGoalModal({ goalId, isOpen, onClose }: AddToGoalModalProps) {
  const { goals, addToGoal } = useSavingsGoals();
  const [showSuccess, setShowSuccess] = useState(false);

  const goal = goals.find(g => g.id === goalId);

  const initialValues = {
    amount: '',
  };

  const validationRules = {
    amount: {
      required: true,
      custom: (value: string) => {
        const parsed = parseVND(value);
        if (parsed <= 0) return 'Số tiền phải lớn hơn 0';
        if (parsed < 1000) return 'Số tiền tối thiểu là 1,000₫';

        if (goal) {
          const remaining = goal.targetAmount - goal.currentAmount;
          if (parsed > remaining) {
            return `Số tiền vượt quá mục tiêu (còn thiếu ${formatCurrency(remaining, true)})`;
          }
        }

        if (parsed > 100000000) return 'Số tiền quá lớn (tối đa 100 triệu)';
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
    const parsedAmount = parseVND(formValues.amount);

    addToGoal(goalId, parsedAmount);

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

  if (!isOpen || !goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Thêm tiền tiết kiệm</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Goal Progress */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-3">{goal.title}</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tiến độ hiện tại</span>
                <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-600">Đã có: </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(goal.currentAmount, true)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mục tiêu: </span>
                  <span className="font-semibold">
                    {formatCurrency(goal.targetAmount, true)}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">Còn thiếu: </span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(remaining, true)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <CurrencyInput
              label="Số tiền thêm vào"
              value={values.amount}
              onChange={(value) => setValue('amount', value)}
              onBlur={() => setTouched('amount')}
              error={errors.amount}
              touched={touched.amount}
              placeholder="Ví dụ: 100k, 500000"
              required
              helpText={`Số tiền tối đa có thể thêm: ${formatCurrency(remaining, true)}`}
            />

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền gợi ý</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  Math.min(100000, remaining),
                  Math.min(500000, remaining),
                  remaining
                ].filter(amount => amount > 0).map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setValue('amount', amount.toString())}
                    className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {formatCurrency(amount, true)}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Preview */}
            {values.amount && !errors.amount && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-in slide-in-from-top-1 duration-300">
                <h4 className="font-semibold text-blue-800 mb-2">Sau khi thêm tiền</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Số tiền mới:</span>
                    <span className="font-medium text-blue-800">
                      {formatCurrency(goal.currentAmount + parseVND(values.amount), true)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tiến độ mới:</span>
                    <span className="font-medium text-blue-800">
                      {Math.min(((goal.currentAmount + parseVND(values.amount)) / goal.targetAmount) * 100, 100).toFixed(1)}%
                    </span>
                  </div>
                  {goal.currentAmount + parseVND(values.amount) >= goal.targetAmount && (
                    <div className="text-center text-green-600 font-semibold">
                      🎉 Mục tiêu sẽ được hoàn thành!
                    </div>
                  )}
                </div>
              </div>
            )}

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
                {isSubmitting ? 'Đang thêm...' : 'Thêm tiền'}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message={
          goal && goal.currentAmount + parseVND(values.amount) >= goal.targetAmount
            ? "🎉 Chúc mừng! Mục tiêu đã hoàn thành!"
            : "Tiền đã được thêm vào mục tiêu! 💰"
        }
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
