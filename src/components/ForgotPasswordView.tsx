import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import { FormField } from './FormField';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface ForgotPasswordViewProps {
  onBack: () => void;
  onResetPassword: (email: string) => Promise<void>;
}

export function ForgotPasswordView({ onBack, onResetPassword }: ForgotPasswordViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const initialValues = {
    email: '',
  };

  const validationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ';
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
  } = useFormValidation(initialValues, validationRules);

  const onSubmit = async (formValues: typeof initialValues) => {
    try {
      await onResetPassword(formValues.email);
      setIsEmailSent(true);
      setShowSuccess(true);
    } catch (error) {
      // Handle error
    }
  };

  if (isEmailSent) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Email đã được gửi!</h2>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{values.email}</strong>
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Bước tiếp theo:</h3>
                  <ol className="text-sm text-blue-700 space-y-1 text-left">
                    <li>1. Kiểm tra hộp thư đến của bạn</li>
                    <li>2. Tìm email từ VietMoney</li>
                    <li>3. Nhấp vào liên kết đặt lại mật khẩu</li>
                    <li>4. Tạo mật khẩu mới</li>
                  </ol>
                </div>

                <button
                  onClick={onBack}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Quay lại đăng nhập
                </button>

                <button
                  // onClick={() => onSubmit(values)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Gửi lại email
                </button>
              </div>
            </div>
          </div>
        </div>

        <SuccessNotification
          isVisible={showSuccess}
          message="Email đặt lại mật khẩu đã được gửi! 📧"
          onClose={() => setShowSuccess(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu?</h1>
              <p className="text-gray-600">Đừng lo, chúng tôi sẽ giúp bạn</p>
            </div>
          </div>

          {/* Reset Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
              <p className="text-gray-600 text-sm">
                Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={(value) => setValue('email', value)}
                onBlur={() => setTouched('email')}
                error={errors.email}
                touched={touched.email}
                placeholder="Nhập email đã đăng ký"
                required
                helpText="Email bạn đã sử dụng để tạo tài khoản"
              />

              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                variant="primary"
                className="w-full py-4 text-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Đang gửi...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Gửi email đặt lại</span>
                  </span>
                )}
              </LoadingButton>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Lưu ý bảo mật</h3>
            <p className="text-yellow-700 text-sm">
              Nếu bạn không nhận được email trong vòng 5 phút, hãy kiểm tra thư mục spam
              hoặc liên hệ với chúng tôi để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Email đặt lại mật khẩu đã được gửi! 📧"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
