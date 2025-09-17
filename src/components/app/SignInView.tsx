import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone, Shield } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface SignInViewProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function SignInView({ onSignIn, onForgotPassword, onSignUp }: SignInViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false,
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
    password: {
      required: true,
      minLength: 6,
      custom: (value: string) => {
        if (value && value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự';
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
    try {
      setAuthError(null);
      await onSignIn(formValues.email, formValues.password);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      setAuthError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* App Branding */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">₫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">VietMoney</h1>
            <p className="text-gray-600">Quản lý tài chính thông minh</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
              <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
            </div>

            {/* Authentication Error */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">{authError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={(value) => setValue('email', value)}
                onBlur={() => setTouched('email')}
                error={errors.email}
                touched={touched.email}
                placeholder="example@gmail.com"
                required
                prefix={<Mail className="w-5 h-5 text-gray-400" />}
              />

              {/* Password Field */}
              <FormField
                label="Mật khẩu"
                name="password"
                type="password"
                value={values.password}
                onChange={(value) => setValue('password', value)}
                onBlur={() => setTouched('password')}
                error={errors.password}
                touched={touched.password}
                placeholder="Nhập mật khẩu của bạn"
                required
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={values.rememberMe}
                    onChange={(e) => setValue('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>

                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Sign In Button */}
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                variant="primary"
                className="w-full py-4 text-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Đang đăng nhập...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </LoadingButton>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">hoặc</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Biometric Sign In (Demo) */}
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Đăng nhập bằng sinh trắc học</span>
            </button>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <button
                type="button"
                onClick={onSignUp}
                className="text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Bảo mật thông tin</span>
            </div>
            <p className="text-blue-700 text-sm">
              Dữ liệu tài chính của bạn được mã hóa và bảo vệ theo tiêu chuẩn ngân hàng.
              Chúng tôi không bao giờ chia sẻ thông tin cá nhân của bạn.
            </p>
          </div>

          {/* Vietnamese Cultural Touch */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🇻🇳 Được thiết kế đặc biệt cho người Việt Nam
            </p>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Đăng nhập thành công! Chào mừng bạn quay trở lại! 🎉"
        onClose={() => setShowSuccess(false)}
        duration={2000}
      />
    </>
  );
}
