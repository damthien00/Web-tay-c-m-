import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { LoadingButton } from './LoadingButton';

interface ResetPasswordViewProps {
  token?: string | null;
  onBack: () => void;
  onResetPassword: (token: string, newPassword: string) => Promise<void>;
}

export function ResetPasswordView({ token, onBack, onResetPassword }: ResetPasswordViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = {
    password: '',
    confirmPassword: '',
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
  } = useFormValidation(initialValues, {
    password: {
      required: true,
      minLength: 8,
      custom: (value: string) => {
        if (value && value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Mật khẩu phải có chữ hoa, chữ thường và số';
        }
        return null;
      },
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== values.password) return 'Mật khẩu xác nhận không khớp';
        return null;
      },
    },
  });

  const onSubmit = async () => {
    setError(null);
    if (!token) {
      setError('Liên kết đặt lại không hợp lệ hoặc đã hết hạn.');
      return;
    }
    try {
      await onResetPassword(token, values.password);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (e) {
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
              <p className="text-gray-600 mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className={`flex items-center border rounded-xl px-3 py-2 ${touched.password && errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <Lock className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="password"
                    className="w-full outline-none"
                    placeholder="••••••••"
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    onBlur={() => setTouched('password', true)}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className={`flex items-center border rounded-xl px-3 py-2 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <Lock className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="password"
                    className="w-full outline-none"
                    placeholder="••••••••"
                    value={values.confirmPassword}
                    onChange={(e) => setValue('confirmPassword', e.target.value)}
                    onBlur={() => setTouched('confirmPassword', true)}
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                className="w-full"
              >
                Cập nhật mật khẩu
              </LoadingButton>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Liên kết đặt lại chỉ có hiệu lực trong thời gian giới hạn vì lý do bảo mật.
            </p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-green-200 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">Đặt lại mật khẩu thành công!</p>
          </div>
        </div>
      )}
    </>
  );
}
