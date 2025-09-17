import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';

interface SignUpViewProps {
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
  onSignIn: () => void;
}

export function SignUpView({ onSignUp, onSignIn }: SignUpViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const initialValues = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  };

  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value: string) => {
        if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Tên chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;
      }
    },
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
      minLength: 8,
      custom: (value: string) => {
        if (value && value.length < 8) {
          return 'Mật khẩu phải có ít nhất 8 ký tự';
        }
        if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Mật khẩu phải có chữ hoa, chữ thường và số';
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== values.password) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return null;
      }
    },
    agreeToTerms: {
      required: true,
      custom: (value: boolean) => {
        if (!value) {
          return 'Bạn phải đồng ý với điều khoản sử dụng';
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
      await onSignUp(formValues.email, formValues.password, formValues.fullName);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      setAuthError('Không thể tạo tài khoản. Email có thể đã được sử dụng.');
    }
  };

  const getPasswordStrength = () => {
    const password = values.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;

    if (strength <= 25) return { strength, label: 'Yếu', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Trung bình', color: 'bg-yellow-500' };
    if (strength <= 75) return { strength, label: 'Tốt', color: 'bg-blue-500' };
    return { strength, label: 'Mạnh', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* App Branding */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">₫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản</h1>
            <p className="text-gray-600">Bắt đầu quản lý tài chính thông minh</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
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
              {/* Full Name */}
              <FormField
                label="Họ và tên"
                name="fullName"
                type="text"
                value={values.fullName}
                onChange={(value) => setValue('fullName', value)}
                onBlur={() => setTouched('fullName')}
                error={errors.fullName}
                touched={touched.fullName}
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                helpText="Tên đầy đủ của bạn"
              />

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
                helpText="Email để đăng nhập và khôi phục tài khoản"
              />

              {/* Password Field */}
              <div className="space-y-2">
                <FormField
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={(value) => setValue('password', value)}
                  onBlur={() => setTouched('password')}
                  error={errors.password}
                  touched={touched.password}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                />

                {/* Password Strength Indicator */}
                {values.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Độ mạnh mật khẩu</span>
                      <span className={`font-medium ${
                        passwordStrength.strength <= 25 ? 'text-red-600' :
                        passwordStrength.strength <= 50 ? 'text-yellow-600' :
                        passwordStrength.strength <= 75 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <FormField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={(value) => setValue('confirmPassword', value)}
                onBlur={() => setTouched('confirmPassword')}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                placeholder="Nhập lại mật khẩu"
                required
              />

              {/* Terms Agreement */}
              <div className="space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={values.agreeToTerms}
                    onChange={(e) => setValue('agreeToTerms', e.target.checked)}
                    onBlur={() => setTouched('agreeToTerms')}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 mt-0.5"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Tôi đồng ý với{' '}
                    <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                      Điều khoản sử dụng
                    </button>
                    {' '}và{' '}
                    <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                      Chính sách bảo mật
                    </button>
                  </span>
                </label>
                {touched.agreeToTerms && errors.agreeToTerms && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <span>{errors.agreeToTerms}</span>
                  </div>
                )}
              </div>

              {/* Sign Up Button */}
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                variant="primary"
                className="w-full py-4 text-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Đang tạo tài khoản...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Tạo tài khoản</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </LoadingButton>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <button
                type="button"
                onClick={onSignIn}
                className="text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                Đăng nhập
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">Tính năng nổi bật</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Quản lý dự án</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Mục tiêu tiết kiệm</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Phân tích chi tiêu</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Báo cáo tài chính</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Tài khoản đã được tạo thành công! 🎉"
        onClose={() => setShowSuccess(false)}
        duration={2000}
      />
    </>
  );
}
